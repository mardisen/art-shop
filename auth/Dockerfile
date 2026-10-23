
FROM python:3.14-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy the application into the container.
COPY . /app

# Install the application dependencies.
WORKDIR /app
COPY .docker.env .env
RUN if [ -f uv.lock ]; then uv sync --frozen --no-cache; else uv sync --no-cache; fi

ENV PYTHONPATH "${PYTHONPATH}:/app"

# Run the application.
CMD ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "80", "--host", "0.0.0.0"]

HEALTHCHECK --interval=30s --timeout=5s --retries=5 --start-period=20s \
  CMD python -c "import urllib.request;urllib.request.urlopen('http://localhost:80/')" || exit 1