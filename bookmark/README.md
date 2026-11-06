# Bookmark Service

FastAPI microservice that stores the workshops bookmarked by each user. Bookmarks live in PostgreSQL and the read endpoint is cached in Redis. The service expects the API Gateway to provide the caller identity through the `X-User-Id` header.

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

- `.env` is used for local runs and points to PostgreSQL on `localhost:5434` and Redis on `localhost:6379`.
- `.docker.env` is copied to `.env` inside the image and uses the container hostnames `bookmark-postgres` and `bookmark-redis`.
- Direct requests must include the `X-User-Id` header; the gateway normally injects it after authenticating the user.

## Run with Docker Compose

From this directory:

```bash
docker compose up --build
```

This starts PostgreSQL, Redis, a one-shot seed container, and the API:

- API: http://localhost:8002
- Swagger UI: http://localhost:8002/docs
- PostgreSQL: `localhost:5434`
- Redis: `localhost:6379`

The seed step inserts a few bookmarks for users `1` and `2`. Stop the stack with:

```bash
docker compose down
```

Add `-v` to also delete the database volume.

## Run locally with uv

When the API runs with `uv` on the host, PostgreSQL and Redis must be reachable on
published host ports. The service compose file starts both with the ports expected
by `.env` (PostgreSQL `5434`, Redis `6379`).

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

4. Start the API on port `8002` (the port the gateway expects):

   ```bash
   uv run fastapi dev app/main.py --port 8002
   ```

The local API is then available at http://localhost:8002 and its docs at
http://localhost:8002/docs. If the full stack is already running from the repository
root, stop it first (`docker compose down` at the root): its database and Redis are
only on internal Docker networks and reuse the same container names.

## Tests

```bash
uv run pytest
```

The tests run against in-memory SQLite and `fakeredis`; no external services are required.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Health/hello endpoint |
| `GET` | `/bookmark/` | List the caller's bookmarks |
| `POST` | `/bookmark/` | Create a bookmark; body `{"workshop_id": 1}` |
| `DELETE` | `/bookmark/{workshop_id}` | Remove one of the caller's bookmarks |

All bookmark routes require `X-User-Id`.

## Project layout

- `app/main.py` — FastAPI application and caching setup
- `app/routers/bookmark.py` — bookmark endpoints
- `app/models/bookmark.py` — SQLModel models
- `app/database.py` — engine, session, tables, and seed data
- `app/cli.py` — database seeding command
- `tests/` — unit tests
