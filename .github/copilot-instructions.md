# GitHub Copilot Instructions for TAI — api-gateway service 🔧

Purpose: help AI coding agents become productive quickly in the `services/api-gateway` codebase by documenting architecture, critical developer workflows, conventions, and points requiring human review.

## Quick orientation (what this repo contains) 📁
- Service: `services/api-gateway/` — a FastAPI-based API gateway with tenant-aware middleware and RLS support.
- Key directories:
  - `app/` — application code (routes, middleware, models, schemas, security, utils)
  - `alembic/` — DB migrations and RLS policy management
  - `tests/` — pytest-based tests (security-focused suite in `tests/security/`)
- Quick commands (see `README.md`): copy `.env.sample`, `docker-compose up -d`, `python start_simple.py`, `alembic upgrade head`, `pytest -q`.

## Architecture & high-level patterns 🧭
- Multi-tenant design with Postgres Row-Level Security (RLS):
  - Middleware must set the per-connection tenant context (see `app/middleware/rls_bind.py` and `app/core/rls.py`).
  - Migrations must include RLS policy changes (see `alembic/versions/0001_init_multitenant_rls.py`).
- Middleware pipeline is explicit and order-sensitive (register middleware in `app/bootstrap.py`). Typical order: request id -> logging -> auth -> tenant extraction -> rls binding -> rate limiting -> idempotency.
- Auth flows:
  - Supports JWT (multi-algo: EdDSA/RS256/HS256) and API keys (scope-based). See `app/middleware/jwt_auth.py`, `app/middleware/api_key_middleware.py`, and `app/security/api_keys/`.
- Service-to-service calls use typed gateway clients in `app/core/gateway_clients/` (e.g. `IngestionClient`) and should use `httpx.AsyncClient`.
- Observability: middleware emits structured logs in `app/middleware/logging_middleware.py` and a health endpoint exists at `/healthz`.

## Developer workflows & commands ⚙️
- Local dev stack: `docker-compose up -d` (Postgres, Redis, RabbitMQ).
- Run dev server (hot reload): `python start_simple.py`.
- Production run (Uvicorn, 4 workers): `python run_server.py` or build Docker image with `docker build -t api-gateway:local .`.
- DB migrations: create with `alembic revision --autogenerate -m "msg"` (ensure models importable) and apply with `alembic upgrade head`.
- Tests: `pytest -q`. Security tests live under `tests/security/`.
- Secrets: dev uses `.env` and `VAULT_ADDR/VAULT_TOKEN` for Vault integration in `app/core/secrets_manager.py`.

## Conventions & code patterns ✅
- Configuration is Pydantic `Settings` in `app/core/config.py` and reads `.env` by default.
- Database sessions: call `app/core/db.init_db(DATABASE_URL)` at startup and use dependency `get_db_dep` from `app/core/dependencies.py`.
- Models use SQLAlchemy; keep RLS-sensitive tables changes in alembic migrations and include explicit SQL for policies.
- API responses: use Pydantic schemas from `app/schemas/` and return consistent error shapes from `app/middleware/error_handler.py`.
- Security-sensitive strings (keys, tokens) should not be hard-coded—prefer Vault or environment variables and document any exceptions in code comments.

## Code generation guidelines for AI agents 🤖
- Respect multi-tenant isolation: when adding DB queries, ensure tenant scoping is enforced either via session-level RLS binding or explicit filters. Reference `app/core/rls.py` and `app/middleware/tenant_ctx.py`.
- When editing `alembic` migrations, DO NOT modify historical migration files (create a new revision for schema changes). Add raw SQL for RLS policies where needed.
- Tests must include a security-focused test when adding features that touch tenant isolation, API keys, or audit logs—place tests under `tests/security/`.
- For HTTP clients, prefer async `httpx.AsyncClient` and ensure SSRF checks (`app/middleware/ssrf_guard.py`) are applied to user-supplied URLs.
- When introducing new middleware, document its registration order in `app/bootstrap.py` and add a short note in `README_API_GATEWAY.md` if it impacts security or tenancy.

## Integration & external dependencies 🔗
- Postgres (RLS), Redis (idempotency, rate-limiting), RabbitMQ (events). Config via `DATABASE_URL`, `REDIS_URL`, `RABBITMQ_URL`.
- HashiCorp Vault optional integration: `VAULT_ADDR`, `VAULT_TOKEN` — see `app/core/secrets_manager.py`.
- Open Policy Agent (OPA) for policy-as-code, client at `app/security/policy/opa_client.py`.

## Files to review manually (safety & correctness) ⚠️
- `app/middleware/jwt_auth.py` — must correctly validate multi-alg JWTs and `iss` claims against JWKS endpoints.
- `app/core/rls.py` and `alembic` migrations — RLS SQL must be correct and tested.
- `app/security/api_keys/manager.py` — key generation & storage; raw keys should be hashed and never stored in plaintext.
- `app/middleware/ssrf_guard.py` — ensure network allowlist/denylist is appropriate for your deployment.

## Example commit checklist for agents ✍️
- Unit test(s) added or updated (focus on tenancy & security).
- New migration created when DB changes are needed; RLS policies included for tenant tables.
- `README_API_GATEWAY.md` updated if developer workflow changed (e.g., new env vars or services).
- Ensure no secrets are committed; prefer `.env.sample` updates and mention required Vault setup.

---

If anything above is unclear or you'd like more/less detail for a specific area (migrations, auth, or middleware order), tell me which section to expand and I'll iterate. ✅