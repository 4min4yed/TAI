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
- Current tenancy pipeline: `RequestID -> Logging -> TenantCtx -> RLSBind`
- TenantCtx extracts `tenant_id` from authenticated JWT claims; DB sessions bind it to `app.current_tenant` for PostgreSQL RLS
- Signup/verification flow uses explicit email verification with expiring single-use tokens:
	- `POST /v1/auth/register` creates or refreshes unverified accounts and sends verification email
	- `POST /v1/auth/verify-email/validate` checks token validity
	- `POST /v1/auth/verify-email/confirm` verifies token + password before account activation
	- `POST /v1/auth/resend-verification` uses silent responses (anti-enumeration)
	- `POST /v1/auth/verify-email/not-me` invalidates pending signup
- Required env additions for this flow:
	- `FRONTEND_URL` (default: `http://localhost:3000`)
	- `EMAIL_VERIFICATION_TTL_MINUTES` (default: `30`)

If you add DB schema changes, include a migration under `alembic/versions/` and update `alembic/README.md`.