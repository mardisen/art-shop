# Institute Service

FastAPI microservice for art institutes. It stores institutes in PostgreSQL and caches read responses in Redis. Create and update operations require the caller to be a professor; the API Gateway supplies the identity headers.

## Prerequisites

- Docker Engine with the Docker Compose plugin, or
- Python 3.14+ and `uv`
- PostgreSQL and Redis if you run the service without Docker

## Installation

```bash
uv sync
```

Dependencies are declared in `pyproject.toml`. The Docker image installs them with `uv` during the build.

## Configuration

- `.env` is used for local runs and points to PostgreSQL on `localhost:5435` and Redis on `localhost:6379`.
- `.docker.env` is copied to `.env` inside the image and uses the container hostnames `institute-postgres` and `institute-redis`.
- Mutating routes expect `X-User-Role: Professor`. Update also expects `X-Institute-Id` to match the institute being changed. Both headers are normally injected by the gateway.

## Run with Docker Compose

From this directory:

```bash
docker compose up --build
```

This starts PostgreSQL, Redis, a one-shot seed container, and the API:

- API: http://localhost:8003
- Swagger UI: http://localhost:8003/docs
- PostgreSQL: `localhost:5435`
- Redis: `localhost:6379`

The seed step inserts two development institutes. Stop the stack with:

```bash
docker compose down
```

Add `-v` to also delete the database volume.

## Run locally with uv

When the API runs with `uv` on the host, PostgreSQL and Redis must be reachable on
published host ports. The service compose file starts both with the ports expected
by `.env` (PostgreSQL `5435`, Redis `6379`).

1. Start PostgreSQL and Redis from this directory:

   ```bash
   docker compose up -d db redis
   ```

2. Install the dependencies:

   ```bash
   uv sync
   ```

3. Seed the database (optional, idempotent):

   ```bash
   uv run python -m app.cli
   ```

4. Start the API on port `8003` (the port the gateway expects):

   ```bash
   uv run fastapi dev app/main.py --port 8003
   ```

The local API is then available at http://localhost:8003 and its docs at
http://localhost:8003/docs. If the full stack is already running from the repository
root, stop it first (`docker compose down` at the root): its database and Redis are
only on internal Docker networks and reuse the same container names.

## Tests

```bash
uv run pytest
```

The tests use in-memory SQLite and `fakeredis`; no external services are required.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Health/hello endpoint |
| `GET` | `/institute/` | List institutes |
| `GET` | `/institute/{id}` | Read one institute |
| `POST` | `/institute/` | Create an institute (Professor only) |
| `PUT` | `/institute/{id}` | Update an institute (Professor and matching `X-Institute-Id`) |

## Project layout

- `app/main.py` — FastAPI application and caching setup
- `app/routers/institute.py` — institute endpoints
- `app/models/institute.py` — SQLModel models
- `app/database.py` — engine, session, tables, and seed data
- `app/cli.py` — database seeding command
- `tests/` — unit tests
