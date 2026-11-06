# API Gateway

FastAPI reverse proxy and entry point for the backend. It routes requests by the first path segment (`/auth`, `/bookmark`, `/institute`, `/workshop`), calls the auth service to validate the bearer token, and injects `X-User-Id`, `X-User-Role`, and `X-Institute-Id` into upstream requests.

## Prerequisites

- Python 3.14+ and `uv`, or
- Docker Engine with the Docker Compose plugin
- The auth, bookmark, institute, and workshop services running and reachable

## Installation

```bash
uv sync
```

Dependencies are declared in `pyproject.toml`. The Docker image installs them with `uv` during the build.

## Configuration

The gateway reads these variables from `.env`:

| Variable | Purpose | Local default |
| --- | --- | --- |
| `AUTH_MATCH`, `AUTH_URL` | Path prefix and upstream URL for auth | `auth`, `http://localhost:8001` |
| `BOOKMARK_MATCH`, `BOOKMARK_URL` | Path prefix and upstream URL for bookmarks | `bookmark`, `http://localhost:8002` |
| `INSTITUTE_MATCH`, `INSTITUTE_URL` | Path prefix and upstream URL for institutes | `institute`, `http://localhost:8003` |
| `WORKSHOP_MATCH`, `WORKSHOP_URL` | Path prefix and upstream URL for workshops | `workshop`, `http://localhost:8004` |

`.docker.env` is copied to `.env` inside the image and uses container hostnames (`auth-api`, `bookmark-api`, `institute-api`, `workshop-api`).

## Run with Docker Compose

Building the image from this directory:

```bash
docker compose up --build
```

The container listens on http://localhost:8000. The bundled compose file starts only the gateway; it expects the upstream services to be reachable at the URLs from `.docker.env`. To test the full stack in containers, all services must share a Docker network and use those container hostnames.

## Run locally with uv

For local development the simplest setup is to run the four backend services on ports `8001`-`8004` (see their READMEs), then start the gateway:

1. Install the dependencies:

   ```bash
   uv sync
   ```

2. Start the gateway on port `8000`:

   ```bash
   uv run fastapi dev app/main.py --port 8000
   ```

The gateway is then available at http://localhost:8000 and its docs at http://localhost:8000/docs. Its `.env` already points to the local service ports.

## Tests

```bash
uv run pytest
```

The tests mock the upstream services and do not need the backend to be running.

## Routing

| Prefix | Upstream |
| --- | --- |
| `/auth/...` | Auth service |
| `/bookmark/...` | Bookmark service |
| `/institute/...` | Institute service |
| `/workshop/...` | Workshop service |

Unknown prefixes return `404`. The gateway forwards `GET`, `POST`, `PUT`, and `DELETE` requests and forwards query parameters and request bodies.

## Project layout

- `app/main.py` — FastAPI application and catch-all route
- `app/utils.py` — service resolution, auth lookup, and request forwarding
- `tests/` — unit tests with mocked upstreams
