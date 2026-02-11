"""Alembic environment file (uses SQLAlchemy URL from environment)."""
from logging.config import fileConfig
import os
import sys
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# Load .env file
load_dotenv()

config = context.config

# Try to configure logging, but skip if there are issues with the ini file
try:
    if config.config_file_name:
        fileConfig(config.config_file_name)
except Exception as e:
    print(f"Warning: Could not load logging config: {e}")

DB_URL = os.environ.get('DATABASE_URL')
if DB_URL:
    config.set_main_option('sqlalchemy.url', DB_URL)

# NOTE: import models' MetaData here when using autogenerate
# from app.models import base
# target_metadata = base.Base.metadata


def run_migrations_offline():
    context.configure(url=config.get_main_option('sqlalchemy.url'), literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(config.get_section(config.config_ini_section), prefix='sqlalchemy.', poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
