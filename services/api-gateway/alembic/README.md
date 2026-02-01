# Alembic migrations

- Put migration scripts under `alembic/versions/`.
- Migrations must include RLS policy changes when changing tenant-sensitive tables.
- Use `alembic revision --autogenerate -m "describe"` when models are importable.
- Run `alembic upgrade head` to apply migrations.
