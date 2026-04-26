"""Session lifecycle management (refresh rotation, expiry policies)."""

from app.security.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    token_expiry_from_claims,
)
from app.security.auth.token_store import persist_refresh_token


class SessionManager:
    def create_session(
        self,
        db,
        *,
        user_id: str,
        tenant_id: str,
        role: str,
        first_name: str,
        last_name: str,
        email: str,
        tenant_name: str,
        is_2fa_enabled: bool = False,
        login_mfa_enabled: bool = True,
        ip_address: str | None = None,
        user_agent: str | None = None,
        refresh_family: str | None = None,
        parent_refresh_jti: str | None = None,
    ):
        access_token, access_claims = create_access_token(user_id, tenant_id, role)
        refresh_token, refresh_claims = create_refresh_token(
            user_id,
            tenant_id,
            role,
            family_id=refresh_family,
        )

        persist_refresh_token(
            db,
            raw_token=refresh_token,
            jti=refresh_claims["jti"],
            user_id=user_id,
            tenant_id=tenant_id,
            family_id=refresh_claims["family"],
            expires_at=token_expiry_from_claims(refresh_claims),
            parent_jti=parent_refresh_jti,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "refresh_jti": refresh_claims["jti"],
            "refresh_family": refresh_claims["family"],
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "role": role,
                "tenant_id": tenant_id,
                "tenant_name": tenant_name,
                "is_2fa_enabled": is_2fa_enabled,
                "login_mfa_enabled": login_mfa_enabled,
            },
            "access_claims": access_claims,
            "refresh_claims": refresh_claims,
        }



