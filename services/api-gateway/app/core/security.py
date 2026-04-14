"""Password hashing and token helpers (Argon2id, token utils)."""
from argon2 import PasswordHasher

from app.core.config import Settings

settings = Settings()
ph = PasswordHasher(
    time_cost=max(2, settings.ARGON2_TIME_COST),
    memory_cost=max(8192, settings.ARGON2_MEMORY_COST_KIB),
    parallelism=max(1, settings.ARGON2_PARALLELISM),
)


def _peppered(password: str) -> str:
    pepper = settings.PASSWORD_PEPPER or ""
    return f"{password}{pepper}"


def hash_password(password: str) -> str:
    return ph.hash(_peppered(password))


def verify_password(hash: str, password: str) -> bool:
    try:
        return ph.verify(hash, _peppered(password))
    except Exception:
        return False
