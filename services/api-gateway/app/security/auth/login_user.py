from fastapi import HTTPException
from app.models.tenant import Tenant
from app.models.user import User
from app.core.security import verify_password
from app.security.auth.session_manager import SessionManager
from app.security.auth.mfa_handler import requires_mfa
from app.security.auth.jwt_handler import create_mfa_challenge_token
import logging
import traceback

logger = logging.getLogger(__name__)

async def login_user(db, email: str, password: str, ip_address: str | None = None, user_agent: str | None = None):
    user = db.query(User).filter(User.email == email.strip().lower()).first()
    if not user :
        print("wrong mail")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(user.password_hash, password):
        print("Invalid pswd")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.is_verified == False:
        print("Not Verified")
        raise HTTPException(status_code=403, detail="Please verify your email")
    if not user.is_active:
        print("Account Disabled")
        raise HTTPException(status_code=403, detail="User account is disabled")
    if requires_mfa(user):
        mfa_token, _ = create_mfa_challenge_token(user.id, user.tenant_id, user.role)
        return {
            "mfa_required": True,
            "mfa_token": mfa_token,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                "tenant_id": user.tenant_id,
                "tenant_name": "",
            },
        }
    tenant_id = user.tenant_id
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    manager = SessionManager()
    try:
        return manager.create_session(
            db,
            user_id=user.id,
            tenant_id=tenant_id,
            role=user.role,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            tenant_name=tenant.name if tenant else "Unknown Tenant",
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("Failed to create session for user %s: %s", user.id if user else None, exc)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")