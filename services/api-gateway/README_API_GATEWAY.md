API Gateway — Service Overview

Purpose:
- Acts as the HTTP gateway for tenant requests
- Enforces multi-tenancy via Row-Level Security (RLS)
- Provides authentication (JWT / API keys) and observability

Important files:
- `app/` — application code (routes, middleware, models)
- `alembic/` — DB migrations and RLS policy management
- `docker-compose.yml` — local dev dependencies (Postgres, Redis, RabbitMQ)

Developer notes:
- Config is Pydantic-based in `app/core/config.py` and reads from environment
- Use `app/core/gateway_clients` for internal service calls
- Middleware layers are explicit and order-sensitive (see `app/middleware`)

If you add DB schema changes, include a migration under `alembic/versions/` and update `alembic/README.md`.