from fastapi import HTTPException
from app.models.user import User
from app.core.security import verify_password
from app.security.auth.session_manager import SessionManager
from app.security.auth.mfa_handler import requires_mfa
import logging
import traceback

logger = logging.getLogger(__name__)


async def login_user(db, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(user.password_hash, password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled")
    if requires_mfa(user):
        # TODO: Implement temporary MFA token generation
        raise HTTPException(status_code=403, detail="MFA required")

    tenant_id = user.tenant_id
    manager = SessionManager()
    try:
        return manager.create_session(user.id, tenant_id)
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("Failed to create session for user %s: %s", user.id if user else None, exc)
        # Return a 500 with a short message; full traceback is in the logs
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}")
