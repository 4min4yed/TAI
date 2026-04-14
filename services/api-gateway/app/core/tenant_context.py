"""Request-scoped tenant context for DB RLS binding."""

from contextvars import ContextVar, Token

_tenant_ctx: ContextVar[str | None] = ContextVar("tenant_id", default=None)


def set_current_tenant_id(tenant_id: str | None) -> Token:
    return _tenant_ctx.set(tenant_id)


def reset_current_tenant_id(token: Token) -> None:
    _tenant_ctx.reset(token)


def get_current_tenant_id() -> str | None:
    return _tenant_ctx.get()
