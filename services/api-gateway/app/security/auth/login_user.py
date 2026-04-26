from fastapi import HTTPException
from sqlalchemy.exc import OperationalError, ProgrammingError, SQLAlchemyError
from app.models.user import User
from app.models.tenant import Tenant
from app.core.security import verify_password
from app.security.auth.jwt_handler import create_mfa_challenge_token
from app.security.auth.login_email_2fa import issue_login_email_code, send_login_email_code
from app.security.auth.session_manager import SessionManager
import logging

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

    if not user.email:
        raise HTTPException(status_code=400, detail="User email is missing")

    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    tenant_name = tenant.name if tenant else ""

    if not bool(getattr(user, "login_mfa_enabled", True)):
        manager = SessionManager()
        result = manager.create_session(
            db,
            user_id=user.id,
            tenant_id=user.tenant_id,
            role=user.role,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            tenant_name=tenant_name,
            is_2fa_enabled=bool(user.is_2fa_enabled),
            login_mfa_enabled=bool(getattr(user, "login_mfa_enabled", True)),
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return {
            "mfa_required": False,
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "user": result["user"],
        }

    mfa_token, challenge_claims = create_mfa_challenge_token(user.id, user.tenant_id, user.role)
    challenge_jti = str(challenge_claims.get("jti", ""))
    if not challenge_jti:
        raise HTTPException(status_code=500, detail="Unable to create MFA challenge")

    try:
        code = issue_login_email_code(
            db,
            challenge_jti=challenge_jti,
            user_id=user.id,
            email=user.email,
        )
        db.commit()
    except (ProgrammingError, OperationalError) as exc:
        db.rollback()
        if "login_email_codes" in str(exc).lower():
            logger.error("Login 2FA table missing. Run alembic upgrade head.")
            raise HTTPException(
                status_code=503,
                detail="Service not ready: database migration missing. Please run alembic upgrade head.",
            ) from exc
        logger.exception("Database error while issuing login email 2FA code for user %s", user.id)
        raise HTTPException(status_code=500, detail="Unable to start login verification") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Database error while issuing login email 2FA code for user %s", user.id)
        raise HTTPException(status_code=500, detail="Unable to start login verification") from exc

    email_sent = await send_login_email_code(user.email, code)
    if not email_sent:
        raise HTTPException(status_code=502, detail="Unable to send login verification code")

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
            "tenant_name": tenant_name,
            "is_2fa_enabled": bool(user.is_2fa_enabled),
            "login_mfa_enabled": bool(getattr(user, "login_mfa_enabled", True)),
        },
    }
