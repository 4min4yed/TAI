"""Route aggregation: modules should register routers here in `bootstrap.py`."""
from .health import router as health_router

__all__ = ["health_router"]
