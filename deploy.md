# Art Shop: Cloud Run Deployment

One Cloud Run service (`artshop`) runs the gateway, the four backends, the Cloud
SQL Auth Proxy and Redis as containers in the same instance. The frontend is a
second service. Everything lives in one region.

```
Cloud Run service "artshop" (public)
├── gateway            :80   <- ingress container
├── auth               :8001
├── bookmark           :8002
├── institute          :8003
├── workshop           :8004
├── cloud-sql-proxy    :5432 -> Cloud SQL "artshop-db"
└── redis              :6379

Cloud Run service "frontend" (public) -> calls the artshop URL
```

Key constraints:

- Cloud SQL and Cloud Run **must** share a region, or the proxy fails with
  `provided region was mismatched`.
- The proxy must bind `0.0.0.0`; Cloud Run probes do not reach `127.0.0.1`.
- Backends start only after the proxy/Redis pass their `startupProbe` via the
  `run.googleapis.com/container-dependencies` annotation.
- `service.yaml` is the source of truth for the API service.

## 0. Setup

```bash
export PROJECT_ID=artshop-second
export REGION=europe-west8
export DB_INSTANCE=artshop-db
export SA=artshop-run@${PROJECT_ID}.iam.gserviceaccount.com

gcloud config set project "${PROJECT_ID}"
gcloud services enable run.googleapis.com sqladmin.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com \
  cloudresourcemanager.googleapis.com
```

`cloudresourcemanager.googleapis.com` is required by `gcloud projects describe`
(used below and by the GitHub Actions workflow).

## 1. IAM

```bash
gcloud iam service-accounts create artshop-run \
  --display-name="Art Shop Cloud Run" --project="${PROJECT_ID}"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA}" --role=roles/cloudsql.client

gcloud iam service-accounts add-iam-policy-binding "${SA}" \
  --member="user:$(gcloud config get-value account)" \
  --role=roles/iam.serviceAccountUser
```

## 2. Cloud SQL

```bash
gcloud sql instances create "${DB_INSTANCE}" \
  --database-version=POSTGRES_17 --tier=db-f1-micro --region="${REGION}" \
  --storage-type=SSD --storage-size=10GB --project="${PROJECT_ID}"

gcloud sql databases create fastapi --instance="${DB_INSTANCE}" --project="${PROJECT_ID}"
gcloud sql users create example --instance="${DB_INSTANCE}" \
  --password=example --project="${PROJECT_ID}"
```

The proxy connection name is deterministic:
`${PROJECT_ID}:${REGION}:${DB_INSTANCE}`.

## 3. Build images

```bash
gcloud builds submit --config=cloudbuild.yaml --project="${PROJECT_ID}" .
```

Builds `auth`, `bookmark`, `institute`, `workshop`, `gateway` and pushes them to
`${REGION}-docker.pkg.dev/${PROJECT_ID}/artshop/<name>:latest`.

## 4. Manifest

`service.yaml` is already filled in for `artshop-second` / `europe-west8`.
Before deploying to another project, update only these values:

- `serviceAccountName`
- image paths (`<REGION>-docker.pkg.dev/<PROJECT_ID>/artshop/<name>:latest`)
- proxy arg (`<PROJECT_ID>:<REGION>:artshop-db`)

Compute the public URLs and set the gateway CORS origin in the manifest:

```bash
export PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
export FRONTEND_URL="https://frontend-${PROJECT_NUMBER}.${REGION}.run.app"
sed -i -E "s#value: \"https://frontend-[^\"]*\.run\.app\"#value: \"${FRONTEND_URL}\"#" service.yaml
```

Non-obvious fields: the proxy runs with `--address=0.0.0.0`; each container in
`container-dependencies` has a `startupProbe`; the shared `DATABASE_*`/`REDIS_URL`
env uses a YAML anchor (`&db-env` / `*db-env`).

## 5. Deploy the API

```bash
gcloud run services replace service.yaml \
  --region="${REGION}" --project="${PROJECT_ID}"

gcloud run services add-iam-policy-binding artshop \
  --region="${REGION}" --project="${PROJECT_ID}" \
  --member=allUsers --role=roles/run.invoker

export API_URL="https://artshop-${PROJECT_NUMBER}.${REGION}.run.app"
```

## 6. Deploy the frontend

The API URL is baked into the Next.js build, so build it after the API is up.

```bash
gcloud builds submit --config=cloudbuild.frontend.yaml \
  --substitutions=_NEXT_PUBLIC_API_URL="${API_URL}" \
  --project="${PROJECT_ID}" .

gcloud run deploy frontend \
  --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/artshop/frontend:latest" \
  --region="${REGION}" --project="${PROJECT_ID}" --allow-unauthenticated
```

`FRONTEND_URL` must already be set on the gateway (step 4) for CORS.

## 7. Seed the database (optional)

Run `app/cli.py` in each service through the Auth Proxy (requires `docker` and
`uv`). The seed is idempotent on a fresh database.

```bash
docker run --rm -d --name artshop-db-proxy -p 127.0.0.1:55432:5432 \
  gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.26.3 \
  --address=0.0.0.0 --port=5432 \
  --token "$(gcloud auth print-access-token)" \
  "${PROJECT_ID}:${REGION}:${DB_INSTANCE}"

export DATABASE_ENGINE=postgresql DATABASE_USER=example \
  DATABASE_PASSWORD=example DATABASE_SPACE=fastapi \
  DATABASE_URL=127.0.0.1:55432

for svc in auth institute workshop bookmark; do
  (cd "${svc}" && uv sync --quiet && ./.venv/bin/python -m app.cli)
done

docker rm -f artshop-db-proxy
```

Seed users: `artist@example.com / artist`, `prof@example.com / prof`.

> The seed uses fixed ids (users 1-2, institutes 0-1, workshops 1-3) and skips
> primary-key conflicts. If earlier registrations used ids 1/2, delete those
> rows (or use a fresh DB) and re-run so `artist@example.com` is created.

## 8. Verify

```bash
curl -s "${API_URL}/"                                                        # {"Hello":"World"}
curl -s -o /dev/null -w 'auth/me %{http_code}\n' "${API_URL}/auth/me"        # 401
curl -s -o /dev/null -w 'institute %{http_code}\n' "${API_URL}/institute/"   # 200
curl -s -o /dev/null -w 'workshop %{http_code}\n' "${API_URL}/workshop/"     # 200
curl -s -o /dev/null -w 'login %{http_code}\n' -X POST "${API_URL}/auth/login" \
  -d 'username=artist@example.com&password=artist'                           # 200 after seed
curl -s -D - -o /dev/null "${API_URL}/institute/" -H "Origin: ${FRONTEND_URL}" \
  | grep -i access-control-allow-origin
gcloud run services describe artshop --region="${REGION}" --project="${PROJECT_ID}" \
  --format='value(status.conditions)'
```

The revision is healthy when `Ready` is `True`.

## 9. CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` deploys on every push to `main` (and manually):
it builds/pushes images with Docker, renders `service.yaml`, deploys the API
and frontend, and smoke-tests the result. It uses Workload Identity Federation,
so no long-lived key is stored.

One-time setup:

```bash
export PROJECT_ID=artshop-second
export GITHUB_REPO=OWNER/REPO

# Required by `gcloud projects describe` and Workload Identity Federation.
gcloud services enable cloudresourcemanager.googleapis.com \
  iam.googleapis.com iamcredentials.googleapis.com --project="${PROJECT_ID}"

export PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
export DEPLOY_SA=github-deploy@${PROJECT_ID}.iam.gserviceaccount.com

gcloud iam service-accounts create github-deploy \
  --display-name="GitHub Actions deployer" --project="${PROJECT_ID}"

for role in roles/run.admin roles/artifactregistry.admin roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${DEPLOY_SA}" --role="${role}"
done

gcloud iam workload-identity-pools create github \
  --location=global --project="${PROJECT_ID}"

gcloud iam workload-identity-pools providers create-oidc github \
  --location=global --project="${PROJECT_ID}" --workload-identity-pool=github \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'"

gcloud iam service-accounts add-iam-policy-binding "${DEPLOY_SA}" \
  --project="${PROJECT_ID}" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github/attribute.repository/${GITHUB_REPO}"
```

Repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|---|---|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/providers/github` |
| `GCP_DEPLOY_SERVICE_ACCOUNT` | `github-deploy@<PROJECT_ID>.iam.gserviceaccount.com` |

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `STARTUP TCP probe failed ... 5432 ... DEADLINE_EXCEEDED` | Proxy on `127.0.0.1` | `--address=0.0.0.0` |
| `provided region was mismatched` | Cloud SQL and Cloud Run differ | Same region |
| Backends fail to connect | Proxy not ready / wrong connection name | Check `${PROJECT_ID}:${REGION}:${DB_INSTANCE}` |
| `OperationalError` / missing tables | DB/user missing or `DATABASE_*` wrong | Create DB+user, match `service.yaml` |
| Container config rejected (`dependsOn`/probes) | Using `dependsOn` | Use `container-dependencies` + `startupProbe` |
| Frontend calls `localhost:8000` | Built without `_NEXT_PUBLIC_API_URL` | Rebuild with `API_URL` |
| CORS errors | Gateway missing `FRONTEND_URL` | Set it, new revision |
| `Cloud Resource Manager API has not been used ... or it is disabled` | API not enabled | `gcloud services enable cloudresourcemanager.googleapis.com` |

## Teardown

```bash
gcloud run services delete frontend --region="${REGION}" --project="${PROJECT_ID}" --quiet
gcloud run services delete artshop   --region="${REGION}" --project="${PROJECT_ID}" --quiet
gcloud sql instances delete "${DB_INSTANCE}" --project="${PROJECT_ID}" --quiet
```
