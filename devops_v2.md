# Art Shop v2: Simplified Cloud Run Deployment

One Cloud Run service (`artshop`) runs the gateway, the four backends, the Cloud
SQL Auth Proxy and Redis as containers in the same instance. The frontend is a
second, independent Cloud Run service. Everything lives in one region.

```
Cloud Run service "artshop" (public)
├── gateway            :80   <- ingress container, public port
├── auth               :8001
├── bookmark           :8002
├── institute          :8003
├── workshop           :8004
├── cloud-sql-proxy    :5432 -> Cloud SQL "artshop-db"
└── redis              :6379

Cloud Run service "frontend" (public) -> calls the artshop URL
```

## What keeps this simple

- **One deployable unit** for the whole API: one `gcloud run services replace`.
- **Same region everywhere.** Cloud SQL and Cloud Run *must* be in the same
  region; the proxy rejects cross-region instances with
  `provided region was mismatched`.
- **The proxy binds `0.0.0.0`.** Cloud Run startup probes are not sent to the
  container loopback, so `--address=127.0.0.1` makes the probe fail forever.
- **No wait loops / `nc`.** `run.googleapis.com/container-dependencies` makes
  the backends start only after the proxy and Redis pass their `startupProbe`.
- **No secrets in the repo.** DB credentials are plain env vars in
  `service.yaml` (override `DATABASE_*` baked into the images).

---

## 0. Prerequisites

```bash
export PROJECT_ID=artshop-second
export REGION=europe-west8
export DB_INSTANCE=artshop-db
export SA=artshop-run@${PROJECT_ID}.iam.gserviceaccount.com

gcloud config set project "${PROJECT_ID}"
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

## 1. Service account

```bash
gcloud iam service-accounts create artshop-run \
  --display-name="Art Shop Cloud Run" --project="${PROJECT_ID}"

# Allows the service to open connections to Cloud SQL.
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA}" \
  --role="roles/cloudsql.client"

# Allows *you* to deploy with that service account attached.
gcloud iam service-accounts add-iam-policy-binding "${SA}" \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/iam.serviceAccountUser"
```

## 2. Cloud SQL

> The region **must** equal `$REGION`, the same region used by Cloud Run.
> Creating the instance elsewhere is the #1 cause of a failing deploy.

```bash
gcloud sql instances create "${DB_INSTANCE}" \
  --database-version=POSTGRES_17 \
  --tier=db-f1-micro \
  --region="${REGION}" \
  --storage-type=SSD \
  --storage-size=10GB \
  --project="${PROJECT_ID}"

# Credentials must match DATABASE_* in service.yaml.
gcloud sql databases create fastapi \
  --instance="${DB_INSTANCE}" --project="${PROJECT_ID}"
gcloud sql users create example \
  --instance="${DB_INSTANCE}" --password=example --project="${PROJECT_ID}"

# This is the value used by the proxy.
gcloud sql instances describe "${DB_INSTANCE}" \
  --project="${PROJECT_ID}" --format='value(connectionName)'
```

## 3. Build and push images

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --project="${PROJECT_ID}" .
```

`cloudbuild.yaml` builds `auth`, `bookmark`, `institute`, `workshop`,
`gateway` and pushes them to
`${REGION}-docker.pkg.dev/${PROJECT_ID}/artshop/<name>:latest`.

## 4. API service definition (`service.yaml`)

Replace `<PROJECT_ID>`, `<REGION>` and the proxy connection name with the
values from step 2. The file in the repo is already filled in for
`artshop-second` / `europe-west8`.

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: artshop
  annotations:
    run.googleapis.com/launch-stage: BETA
spec:
  template:
    metadata:
      annotations:
        # Backends start only after the proxy + redis are healthy.
        run.googleapis.com/container-dependencies: '{"auth":["cloud-sql-proxy","redis"],"bookmark":["cloud-sql-proxy","redis"],"institute":["cloud-sql-proxy","redis"],"workshop":["cloud-sql-proxy","redis"]}'
    spec:
      serviceAccountName: artshop-run@<PROJECT_ID>.iam.gserviceaccount.com
      containers:
        - name: gateway
          image: <REGION>-docker.pkg.dev/<PROJECT_ID>/artshop/gateway:latest
          ports:
            - containerPort: 80
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "80", "--host", "0.0.0.0"]
          env:
            - name: DISABLE_SERVICE_AUTH
              value: "true"
            - name: AUTH_URL
              value: "http://localhost:8001"
            - name: BOOKMARK_URL
              value: "http://localhost:8002"
            - name: INSTITUTE_URL
              value: "http://localhost:8003"
            - name: WORKSHOP_URL
              value: "http://localhost:8004"
          startupProbe:
            tcpSocket:
              port: 80
            periodSeconds: 5
            failureThreshold: 60
        - name: auth
          image: <REGION>-docker.pkg.dev/<PROJECT_ID>/artshop/auth:latest
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8001", "--host", "0.0.0.0"]
          env: &db-env
            - name: DATABASE_ENGINE
              value: "postgresql"
            - name: DATABASE_USER
              value: "example"
            - name: DATABASE_PASSWORD
              value: "example"
            - name: DATABASE_SPACE
              value: "fastapi"
            - name: DATABASE_URL
              value: "127.0.0.1:5432"
            - name: REDIS_URL
              value: "redis://localhost:6379/0"
          startupProbe:
            tcpSocket:
              port: 8001
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 30
        - name: bookmark
          image: <REGION>-docker.pkg.dev/<PROJECT_ID>/artshop/bookmark:latest
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8002", "--host", "0.0.0.0"]
          env: *db-env
          startupProbe:
            tcpSocket:
              port: 8002
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 30
        - name: institute
          image: <REGION>-docker.pkg.dev/<PROJECT_ID>/artshop/institute:latest
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8003", "--host", "0.0.0.0"]
          env: *db-env
          startupProbe:
            tcpSocket:
              port: 8003
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 30
        - name: workshop
          image: <REGION>-docker.pkg.dev/<PROJECT_ID>/artshop/workshop:latest
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8004", "--host", "0.0.0.0"]
          env: *db-env
          startupProbe:
            tcpSocket:
              port: 8004
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 30
        - name: cloud-sql-proxy
          image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.26.3
          # 0.0.0.0 is required: Cloud Run probes do not reach 127.0.0.1.
          args: ["--address=0.0.0.0", "--port=5432", "<PROJECT_ID>:<REGION>:artshop-db"]
          startupProbe:
            tcpSocket:
              port: 5432
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 20
        - name: redis
          image: redis:7-alpine
          startupProbe:
            tcpSocket:
              port: 6379
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 20
```

Notes:

- Containers in one Cloud Run instance share the network namespace, so
  `localhost` works between them.
- Every container listed in `container-dependencies` **must** have a
  `startupProbe`, otherwise the config is rejected.
- `env: &db-env` / `env: *db-env` is plain YAML aliasing, used to avoid
  repeating the DB block four times.

## 5. Deploy the API

```bash
gcloud run services replace service.yaml \
  --region="${REGION}" --project="${PROJECT_ID}"

gcloud run services add-iam-policy-binding artshop \
  --region="${REGION}" --project="${PROJECT_ID}" \
  --member=allUsers --role=roles/run.invoker

# Stable, deterministic URL (also listed in run.googleapis.com/urls).
export PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
export API_URL="https://artshop-${PROJECT_NUMBER}.${REGION}.run.app"
```

## 6. Deploy the frontend

The API URL is baked into the Next.js build, so build it *after* the API is up.

```bash
gcloud builds submit --config=cloudbuild.frontend.yaml \
  --substitutions=_NEXT_PUBLIC_API_URL="${API_URL}" \
  --project="${PROJECT_ID}" .

gcloud run deploy frontend \
  --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/artshop/frontend:latest" \
  --region="${REGION}" --project="${PROJECT_ID}" --allow-unauthenticated

export FRONTEND_URL="https://frontend-${PROJECT_NUMBER}.${REGION}.run.app"
```

The gateway reads `FRONTEND_URL` at startup for CORS. Set it on the gateway
container:

```bash
gcloud run services update artshop \
  --region="${REGION}" --project="${PROJECT_ID}" \
  --container=gateway \
  --update-env-vars=FRONTEND_URL="${FRONTEND_URL}"
```

To keep it across future `replace` runs, add it under the gateway `env:` in
`service.yaml` and re-deploy:

```yaml
            - name: FRONTEND_URL
              value: "https://frontend-<PROJECT_NUMBER>.europe-west8.run.app"
```

## 7. Verify

```bash
curl -s "${API_URL}/"                      # {"Hello":"World"}
curl -s -o /dev/null -w '%{http_code}\n' "${API_URL}/auth/me"     # 401
curl -s -o /dev/null -w '%{http_code}\n' "${API_URL}/institute/"  # 200
curl -s -o /dev/null -w '%{http_code}\n' "${API_URL}/workshop/"   # 200

# CORS must echo the frontend origin.
curl -s -D - -o /dev/null "${API_URL}/institute/" -H "Origin: ${FRONTEND_URL}" \
  | grep -i access-control-allow-origin

# Watch per-container logs while a revision starts.
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=artshop AND severity>=ERROR" \
  --limit=20 --project="${PROJECT_ID}"
```

A revision is healthy when all containers pass their startup probes:
`gcloud run services describe artshop --region=$REGION --format='value(status.conditions)'`
must report `Ready: True`.

## 8. CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` runs on every push to `main` (and manually)
and performs the same steps as above: build/push images, deploy the API,
deploy the frontend, and smoke-test the result. It authenticates with
Workload Identity Federation, so no long-lived key is stored.

One-time setup:

```bash
export PROJECT_ID=artshop-second
export PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
export DEPLOY_SA=github-deploy@${PROJECT_ID}.iam.gserviceaccount.com
export GITHUB_REPO=OWNER/REPO        # e.g. mardisen/art-shop

# Dedicated deployer service account.
gcloud iam service-accounts create github-deploy \
  --display-name="GitHub Actions deployer" --project="${PROJECT_ID}"

for role in roles/run.admin roles/artifactregistry.admin roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${DEPLOY_SA}" --role="${role}"
done

# Workload Identity Federation pool + GitHub OIDC provider.
gcloud iam workload-identity-pools create github \
  --location=global --project="${PROJECT_ID}"

gcloud iam workload-identity-pools providers create-oidc github \
  --location=global --project="${PROJECT_ID}" \
  --workload-identity-pool=github \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'"

# Let that repo impersonate the deployer SA.
gcloud iam service-accounts add-iam-policy-binding "${DEPLOY_SA}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github/attribute.repository/${GITHUB_REPO}"
```

Add these repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|---|---|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/providers/github` |
| `GCP_DEPLOY_SERVICE_ACCOUNT` | `github-deploy@<PROJECT_ID>.iam.gserviceaccount.com` |

Notes:

- The workflow builds the images with `docker build` on the GitHub runner (and
  pushes to Artifact Registry), so the deployer only needs Artifact Registry
  and Cloud Run permissions — no Cloud Build permissions. `cloudbuild.yaml`
  remains the manual/alternative path from step 3.
- `roles/iam.serviceAccountUser` at project level lets the deployer attach
  the runtime SA `artshop-run@...` to the Cloud Run service.
- If you change `PROJECT_ID`/`REGION`, update the `env:` block in
  `deploy.yml`, the image paths/SA in `service.yaml`, and the proxy instance
  connection name in `service.yaml`.
- The workflow renders `service.yaml` on the fly, injecting the computed
  `FRONTEND_URL`, so the committed file can keep the deterministic URL.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `STARTUP TCP probe failed ... "cloud-sql-proxy" on port 5432 ... DEADLINE_EXCEEDED` | Proxy listening on `127.0.0.1` only | `--address=0.0.0.0` |
| `provided region was mismatched - got <db-region>, want <run-region>` | Cloud SQL region ≠ Cloud Run region | Put both in the same region |
| `failed to connect to instance: ... connection refused` from backends | Proxy not ready / wrong `connectionName` | Check `gcloud sql instances describe --format='value(connectionName)'` |
| Backends crash with `create_db_and_tables` / `OperationalError` | DB/user missing or `DATABASE_*` wrong | Create `fastapi` DB and `example` user; match `service.yaml` env |
| `server closed the connection unexpectedly` | Proxy cannot reach the instance | Same region, `roles/cloudsql.client`, instance `RUNNABLE` |
| Container config rejected mentioning `dependsOn` / probes | Using `dependsOn` | Use the `run.googleapis.com/container-dependencies` annotation; sidecars need `startupProbe` |
| Frontend calls `localhost:8000` | Built without `_NEXT_PUBLIC_API_URL` | Rebuild with the API URL from step 6 |
| CORS errors in the browser | Gateway missing `FRONTEND_URL` | Set it and create a new revision |

## Teardown

```bash
gcloud run services delete frontend --region="${REGION}" --project="${PROJECT_ID}" --quiet
gcloud run services delete artshop   --region="${REGION}" --project="${PROJECT_ID}" --quiet
gcloud sql instances delete "${DB_INSTANCE}" --project="${PROJECT_ID}" --quiet
```
