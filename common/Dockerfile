
FROM python:3.14-slim


# WORKDIR /code


# COPY ./requirements.txt /code/requirements.txt


# RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


# COPY . /code/app
# COPY .docker.env /code/app/.env


# CMD ["fastapi", "run", "app/main.py", "--port", "80"]

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy the application into the container.
COPY . /app

# Install the application dependencies.
WORKDIR /app
COPY .docker.env .env
RUN uv sync --frozen --no-cache

# Run the application.
CMD ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "80", "--host", "0.0.0.0"]

HEALTHCHECK --interval=1m00s --timeout=5s --retries=5 CMD curl --include --request GET http://localhost:80/ || exit 1