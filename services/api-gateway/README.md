# API Gateway

This folder contains the `api-gateway` service (FastAPI + Uvicorn). It implements tenant-aware API endpoints, RLS integration, and security middleware.

Quick commands:
- Copy `.env.sample` to `.env` and edit values
- Start dev stack: `docker-compose up -d`
- Run server (dev): `python start_simple.py`
- Run server (prod): `python run_server.py`
- Run database migrations: `alembic upgrade head`
- Run tests: `pytest -q`

See `README_API_GATEWAY.md` for more details.