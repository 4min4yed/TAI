"""Authorization helpers (decorators used by routes).

Examples:
- @require_permission("documents.read")
- @require_role("admin")
"""
from functools import wraps
from fastapi import HTTPException


def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Implement permission check using request.state.user or dependency
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_role(role: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Implement role check
            return await func(*args, **kwargs)
        return wrapper
    return decorator
