"""JWT creation and validation helpers with typed token support."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import json
import uuid
from typing import Any

import jwt

from app.core.config import Settings


settings = Settings()


def _parse_key_ring() -> dict[str, dict[str, str]]:
    """Parse configured key ring as {kid: {alg, private_key, public_key}}."""
    raw = (settings.JWT_KEY_RING_JSON or "").strip()
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError("JWT_KEY_RING_JSON must be valid JSON") from exc
    if not isinstance(parsed, dict):
        raise RuntimeError("JWT_KEY_RING_JSON must be an object keyed by kid")
    out: dict[str, dict[str, str]] = {}
    for kid, entry in parsed.items():
        if not isinstance(kid, str) or not isinstance(entry, dict):
            continue
        alg = str(entry.get("alg", "")).strip()
        private_key = str(entry.get("private_key", "") or "")
        public_key = str(entry.get("public_key", "") or "")
        if alg:
            out[kid] = {
                "alg": alg,
                "private_key": private_key,
                "public_key": public_key,
            }
    return out


def utc_now() -> datetime:
    """Return timezone-aware UTC now for claim generation."""
    return datetime.now(timezone.utc)


def _allowed_algorithms() -> list[str]:
    """Read allowed verification/signing algorithms from settings."""
    raw = settings.JWT_ALGORITHMS or "HS256"
    return [alg.strip() for alg in raw.split(",") if alg.strip()]


def _jwt_key_for_algorithm(algorithm: str, for_signing: bool) -> str:
    """Return key material for a given algorithm and operation."""
    if algorithm == "HS256":
        return settings.JWT_SECRET
    if algorithm == "RS256":
        return settings.JWT_RS256_PRIVATE_KEY if for_signing else settings.JWT_RS256_PUBLIC_KEY
    if algorithm == "EdDSA":
        return settings.JWT_EDDSA_PRIVATE_KEY if for_signing else settings.JWT_EDDSA_PUBLIC_KEY
    raise ValueError(f"Unsupported JWT algorithm: {algorithm}")


def _select_signing_algorithm() -> str:
    """Pick strongest configured algorithm in priority order."""
    for candidate in ("EdDSA", "RS256", "HS256"):
        if candidate not in _allowed_algorithms():
            continue
        key = _jwt_key_for_algorithm(candidate, for_signing=True)
        if key:
            return candidate
    raise RuntimeError("No JWT signing algorithm is configured")


def _resolve_signing_material() -> tuple[str, str, str | None]:
    """Resolve signing algorithm, key and optional KID.

    If an active KID is configured and valid, use it to support key rotation
    without redeploying application code.
    """
    key_ring = _parse_key_ring()
    active_kid = (settings.JWT_ACTIVE_KID or "").strip()
    if active_kid and active_kid in key_ring:
        entry = key_ring[active_kid]
        algorithm = entry["alg"]
        if algorithm not in _allowed_algorithms():
            raise RuntimeError(f"Active KID algorithm is not allowed: {algorithm}")
        signing_key = entry.get("private_key") or entry.get("public_key")
        if not signing_key:
            raise RuntimeError(f"No signing key configured for active KID: {active_kid}")
        return algorithm, signing_key, active_kid

    algorithm = _select_signing_algorithm()
    signing_key = _jwt_key_for_algorithm(algorithm, for_signing=True)
    return algorithm, signing_key, None


def _resolve_verify_key(algorithm: str, kid: str | None) -> str:
    """Resolve verification key from key ring or algorithm defaults."""
    key_ring = _parse_key_ring()
    if kid and kid in key_ring:
        entry = key_ring[kid]
        entry_alg = entry.get("alg", "")
        if entry_alg != algorithm:
            raise jwt.InvalidAlgorithmError("KID algorithm mismatch")
        verify_key = entry.get("public_key") or entry.get("private_key")
        if not verify_key:
            raise jwt.InvalidKeyError(f"No verification key configured for KID: {kid}")
        return verify_key

    verify_key = _jwt_key_for_algorithm(algorithm, for_signing=False)
    if verify_key:
        return verify_key
    raise jwt.InvalidKeyError(f"No verification key configured for {algorithm}")


def _base_claims(user_id: str, tenant_id: str, role: str, token_type: str, ttl: timedelta) -> dict[str, Any]:
    """Build standard JWT claims shared by all token types."""
    now = utc_now()
    return {
        "sub": str(user_id),
        "user_id": str(user_id),
        "tenant_id": str(tenant_id),
        "role": str(role),
        "type": token_type,
        "jti": str(uuid.uuid4()),
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int((now + ttl).timestamp()),
    }


def _encode(payload: dict[str, Any]) -> str:
    """Encode payload with selected signing material and optional KID header."""
    algorithm, key, kid = _resolve_signing_material()
    headers = {"kid": kid} if kid else None
    return jwt.encode(payload, key, algorithm=algorithm, headers=headers)


def create_access_token(user_id: str, tenant_id: str, role: str) -> tuple[str, dict[str, Any]]:
    """Create short-lived access token and return token plus claims."""
    claims = _base_claims(
        user_id=user_id,
        tenant_id=tenant_id,
        role=role,
        token_type="access",
        ttl=timedelta(minutes=max(1, settings.JWT_ACCESS_TTL_MINUTES)),
    )
    return _encode(claims), claims


def create_refresh_token(user_id: str, tenant_id: str, role: str, family_id: str | None = None) -> tuple[str, dict[str, Any]]:
    """Create refresh token; `family` enables refresh-token rotation tracking."""
    claims = _base_claims(
        user_id=user_id,
        tenant_id=tenant_id,
        role=role,
        token_type="refresh",
        ttl=timedelta(days=max(1, settings.JWT_REFRESH_TTL_DAYS)),
    )
    claims["family"] = family_id or claims["jti"]
    return _encode(claims), claims


def create_mfa_challenge_token(user_id: str, tenant_id: str, role: str) -> tuple[str, dict[str, Any]]:
    """Create short-lived token representing an MFA challenge session."""
    claims = _base_claims(
        user_id=user_id,
        tenant_id=tenant_id,
        role=role,
        token_type="mfa_challenge",
        ttl=timedelta(minutes=max(1, settings.JWT_MFA_CHALLENGE_TTL_MINUTES)),
    )
    return _encode(claims), claims


def verify_jwt(token: str, expected_type: str = "access") -> dict[str, Any]:
    """Decode and validate token signature, issuer/audience and token type."""
    header = jwt.get_unverified_header(token)
    algorithm = header.get("alg", "")
    kid = header.get("kid")
    if algorithm not in _allowed_algorithms():
        raise jwt.InvalidAlgorithmError("JWT algorithm is not allowed")

    key = _resolve_verify_key(algorithm, str(kid) if kid else None)

    payload = jwt.decode(
        token,
        key,
        algorithms=[algorithm],
        audience=settings.JWT_AUDIENCE,
        issuer=settings.JWT_ISSUER,
    )

    token_type = payload.get("type")
    if expected_type and token_type != expected_type:
        raise jwt.InvalidTokenError(f"Unexpected token type: {token_type}")
    return payload


def token_expiry_from_claims(payload: dict[str, Any]) -> datetime:
    """Convert `exp` claim to timezone-aware UTC datetime."""
    return datetime.fromtimestamp(int(payload["exp"]), tz=timezone.utc)


# Backward-compatible aliases used by older modules.
def create_Ajwt(user_id, tenant_id, role):
    token, _ = create_access_token(str(user_id), str(tenant_id), str(role))
    return token


def create_Rt(user_id, tenant_id, algorithm: str = "HS256"):
    token, _ = create_refresh_token(str(user_id), str(tenant_id), "user")
    return token