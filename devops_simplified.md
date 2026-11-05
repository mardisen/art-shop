# Art Shop: Simplified Cloud Run Deployment

This document defines a simplified deployment that consolidates all API components into a single multi-container Cloud Run service.

## 1. Prerequisites

Replace `<PROJECT_ID>` and `<REGION>` (e.g., `europe-west8`) in the following steps.

## 2. Infrastructure Setup

```bash
# Set variables
export PROJECT_ID=<PROJECT_ID>
export REGION=<REGION>
export DB_INSTANCE=artshop-db
export RUN_SA="artshop-run@${PROJECT_ID}.iam.gserviceaccount.com"

# Create Service Account
gcloud iam service-accounts create artshop-run --display-name="Art Shop Simplified SA"

# Grant DB access
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${RUN_SA}" \
    --role="roles/cloudsql.client"
```

## 3. Artifact Upload (`cloudbuild.yaml`)

```bash
gcloud builds submit --config cloudbuild.yaml .
```

## 3. Service Definition (`service.yaml`)

Create `service.yaml` to define the multi-container stack. Note the `container-dependencies` annotation and mandatory `startupProbe` for sidecars.

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
        run.googleapis.com/container-dependencies: '{"auth":["cloud-sql-proxy","redis"],"bookmark":["cloud-sql-proxy","redis"],"institute":["cloud-sql-proxy","redis"],"workshop":["cloud-sql-proxy","redis"]}'
    spec:
      serviceAccountName: artshop-run@<PROJECT-ID>.iam.gserviceaccount.com
      containers:
        - name: gateway
          image: <REGION>-docker.pkg.dev/artshop-second/artshop/gateway:latest
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
        - name: auth
          image: <REGION>-docker.pkg.dev/<PROJECT-ID>/artshop/auth:latest
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8001", "--host", "0.0.0.0"]
          env:
            - name: DATABASE_URL
              value: "127.0.0.1:5432"
        - name: bookmark
          image: <REGION>-docker.pkg.dev/<PROJECT-ID>/artshop/bookmark:latest
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8002", "--host", "0.0.0.0"]
          env: [{ name: DATABASE_URL, value: "127.0.0.1:5432" }]
        - name: institute
          image: <REGION>-docker.pkg.dev/<PROJECT-ID>/artshop/institute:latest
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8003", "--host", "0.0.0.0"]
          env: [{ name: DATABASE_URL, value: "127.0.0.1:5432" }]
        - name: workshop
          image: <REGION>-docker.pkg.dev/<PROJECT-ID>/artshop/workshop:latest
          command: ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "8004", "--host", "0.0.0.0"]
          env: [{ name: DATABASE_URL, value: "127.0.0.1:5432" }]
        - name: cloud-sql-proxy
          image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.26.3
          args: ["--port=5432", "--address=0.0.0.0", "<PROJECT-ID>:<REGION>:artshop-db"]
          startupProbe:
            tcpSocket:
              port: 5432
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 20
        - name: redis
          image: redis:7-alpine
          startupProbe:
            tcpSocket:
              port: 6379
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 20

```

## 4. Deploy

```bash
# Deploy API stack
gcloud run services replace service.yaml --region=${REGION}
gcloud run services add-iam-policy-binding artshop --region=${REGION} \
    --member="allUsers" --role="roles/run.invoker"

# Get API URL for frontend
export API_URL=$(gcloud run services describe artshop --region=${REGION} --format='value(status.url)')

# Build and deploy frontend
gcloud builds submit --config=cloudbuild.frontend.yaml --substitutions=_NEXT_PUBLIC_API_URL=${API_URL}
gcloud run deploy frontend --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/artshop/frontend:latest \
    --region=${REGION} --allow-unauthenticated
```

The gateway appends `FRONTEND_URL` to its allowed CORS origins at startup.

```bash
export FRONTEND_URL="$(gcloud run services describe frontend --region="$REGION" --format='value(status.url)')"

gcloud run services update artshop \
  --region="$REGION" \
  --update-env-vars="FRONTEND_URL=${FRONTEND_URL}"
```