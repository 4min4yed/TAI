"""MFA/TOTP handlers (RFC 6238)."""

import pyotp

from app.core.config import Settings


settings = Settings()


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def build_totp_uri(email: str, secret: str) -> str:
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=settings.TOTP_ISSUER)


def verify_totp(secret: str, code: str) -> bool:
    if not secret or not code:
        return False
    totp = pyotp.TOTP(secret)
    return bool(totp.verify(str(code).strip(), valid_window=1))


def requires_mfa(user) -> bool:
    return bool(user and user.is_2fa_enabled and user.totp_secret)

