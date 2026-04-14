"""Hierarchical RBAC utilities with permission inheritance."""

from __future__ import annotations

ROLE_LEVEL = {
    "user": 1,
    "viewer": 2,
    "editor": 3,
    "manager": 4,
    "admin": 5,
    "owner": 6,
}

# A permission is granted when the role level is at least the configured threshold.
PERMISSION_MIN_ROLE = {
    "documents.read": "viewer",
    "documents.upload": "editor",
    "documents.edit": "editor",
    "documents.delete": "admin",
    "users.read": "admin",
    "users.invite": "admin",
    "users.manage": "admin",
    "users.delete": "owner",
}


def normalize_role(role: str | None) -> str:
    return str(role or "").strip().lower()


def has_role_at_least(role: str | None, minimum_role: str) -> bool:
    current = ROLE_LEVEL.get(normalize_role(role), 0)
    required = ROLE_LEVEL.get(normalize_role(minimum_role), 0)
    return current >= required


def can(role: str | None, permission: str) -> bool:
    minimum_role = PERMISSION_MIN_ROLE.get(permission)
    if not minimum_role:
        return False
    return has_role_at_least(role, minimum_role)
