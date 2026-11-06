# Workshop Service

FastAPI microservice for art workshops. It supports creating, updating, deleting, listing, and searching workshops, including text, type, and distance filters. Data is stored in PostgreSQL and read endpoints are cached in Redis.

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

- `.env` is used for local runs and points to PostgreSQL on `localhost:5432` and Redis on `localhost:6379`.
- `.docker.env` is copied to `.env` inside the image and uses the container hostnames `workshop-postgres` and `workshop-redis`.
- Write operations require the caller's `X-User-Id`; creation also accepts `X-Institute-Id`. The gateway injects these headers.

> The default local database port is `5432`, which is also used by the auth service. If both databases run on the host at the same time, change one published port in `docker-compose.yaml` and update the matching `.env` file.

## Run with Docker Compose

From this directory:

```bash
docker compose up --build
```

This starts PostgreSQL, Redis, a one-shot seed container, and the API:

- API: http://localhost:8004
- Swagger UI: http://localhost:8004/docs
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

The seed step inserts three development workshops in Bari and the surrounding area. Stop the stack with:

```bash
docker compose down
```

Add `-v` to also delete the database volume.

## Run locally with uv

When the API runs with `uv` on the host, PostgreSQL and Redis must be reachable on
published host ports. The service compose file starts both with the ports expected
by `.env` (PostgreSQL `5432`, Redis `6379`).

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

4. Start the API on port `8004` (the port the gateway expects):

   ```bash
   uv run fastapi dev app/main.py --port 8004
   ```

The local API is then available at http://localhost:8004 and its docs at
http://localhost:8004/docs. If the full stack is already running from the repository
root, stop it first (`docker compose down` at the root): its database and Redis are
only on internal Docker networks and reuse the same container names.

The workshop database also defaults to host port `5432`, which the auth service uses.
If both databases must run on the host at the same time, change the published port in
`docker-compose.yaml` and update `DATABASE_URL` in `.env` to match.

## Tests

```bash
uv run pytest
```

The tests use in-memory SQLite and `fakeredis`; no external services are required.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Health/hello endpoint |
| `GET` | `/workshop/` | List workshops |
| `GET` | `/workshop/search` | Search by `type`, `search`, `latitude`, `longitude`, and `distance` |
| `GET` | `/workshop/{id}` | Read one workshop |
| `POST` | `/workshop/` | Create a workshop (`X-User-Id` required) |
| `PUT` | `/workshop/{id}` | Update a workshop (creator only) |
| `DELETE` | `/workshop/{id}` | Delete a workshop (creator only) |

Available workshop types are `Drawing`, `Painting`, `Sculpture`, `Photography`, and `Other`.

## Project layout

- `app/main.py` — FastAPI application and caching setup
- `app/routers/workshop.py` — workshop endpoints and search logic
- `app/models/workshop.py` — SQLModel models and workshop types
- `app/database.py` — engine, session, tables, and seed data
- `app/utils.py` — database URL and distance helpers
- `app/cli.py` — database seeding command
- `tests/` — unit tests
