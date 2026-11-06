# Monitoring

Local observability stack for the Art Shop containers. It runs Grafana, Loki, Prometheus, and Grafana Alloy. Alloy collects container and host metrics, scrapes Docker logs, and forwards them to Prometheus and Loki.

## Prerequisites

- Docker Engine with the Docker Compose plugin
- A Linux host (Alloy mounts host paths such as `/proc`, `/sys`, and the Docker socket)
- Permission to access the Docker socket and run a privileged container

## Installation and run

From this directory:

```bash
docker compose up -d
```

This starts:

| Service | URL | Purpose |
| --- | --- | --- |
| Grafana | http://localhost:5000 | Dashboards; anonymous admin access is enabled |
| Prometheus | http://localhost:9090 | Metrics storage and queries |
| Loki | http://localhost:3100 | Log storage |
| Alloy | http://localhost:12345 | Metrics and log collector |

The Grafana data sources for Loki and Prometheus are provisioned automatically.

## Stop

```bash
docker compose down
```

## Configuration files

- `docker-compose.yml` — services, ports, and mounts
- `config.alloy` — cAdvisor metrics, host metrics, Docker log discovery, relabeling, and remote write
- `loki-config.yaml` — Loki storage and schema configuration
- `grafana/datasources/default.yml` — optional Loki data source definition

## Notes

- Alloy excludes its own logs and those of Grafana and Loki from ingestion.
- Docker Desktop may not expose all host paths and sockets required for full metrics collection; the stack is intended for Linux.
- To monitor containers from other Compose projects, they must run on the host Docker daemon that Alloy can see through `/var/run/docker.sock`.
