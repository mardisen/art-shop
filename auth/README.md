# Auth Service

FastAPI microservice for user registration, login, JWT issuance, and user lookup. It stores users in PostgreSQL and caches user lookups in Redis. The API Gateway calls `/auth/me` to resolve the caller's identity before forwarding requests to the other services.

## Prerequisites

- Docker Engine with the Docker Compose plugin, or
- Python 3.14+ and `uv` (CI uses `uv 0.13.6`)
- PostgreSQL and Redis if you run the service without Docker

## Installation

Dependencies are managed with `uv` and are declared in `pyproject.toml`:

```bash
uv sync
```

The Docker image also installs the dependencies with `uv`, so no local Python setup is needed if you use Docker Compose.

## Configuration

- `.env` is loaded when running locally. Its defaults point to `localhost` for PostgreSQL (`5432`) and Redis (`6379`).
- `.docker.env` is copied to `.env` inside the image by the `Dockerfile`. It uses container hostnames such as `auth-postgres` and `auth-redis`.
- Set a strong `SECRET_KEY` in `.env` outside local development. The code currently falls back to a development key.

Relevant variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_ENGINE`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_SPACE`, `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis connection |
| `ALGORITHM` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime |
| `SECRET_KEY` | JWT signing secret |

## Run with Docker Compose

From this directory:

```bash
docker compose up --build
```

This starts PostgreSQL, Redis, a one-shot seed container, and the API:

- API: http://localhost:8001
- Swagger UI: http://localhost:8001/docs
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

The seed container creates two development accounts:

| Email | Password | Role |
| --- | --- | --- |
| `artist@example.com` | `artist` | Artist |
| `prof@example.com` | `prof` | Professor |

Stop the stack with:

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

4. Start the API on port `8001` (the port the gateway expects):

   ```bash
   uv run fastapi dev app/main.py --port 8001
   ```

The local API is then available at http://localhost:8001 and its docs at
http://localhost:8001/docs. If the full stack is already running from the repository
root, stop it first (`docker compose down` at the root): its database and Redis are
only on internal Docker networks and reuse the same container names.

## Tests

```bash
uv run pytest
```

The tests use in-memory SQLite and `fakeredis`, so they do not need PostgreSQL or Redis.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Health/hello endpoint |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | OAuth2 password login; `username` is the email |
| `GET` | `/auth/me` | Current user from the bearer token |
| `PUT` | `/auth/institute` | Set the professor's institute |
| `GET` | `/auth/users/{user_id}` | Read a user by id (authenticated) |

## Project layout

- `app/main.py` — FastAPI application and lifespan hooks
- `app/routers/auth.py` — authentication endpoints
- `app/models/user.py` — SQLModel models and roles
- `app/database.py` — engine, session, tables, and seed data
- `app/cli.py` — database seeding command
- `tests/` — unit tests
