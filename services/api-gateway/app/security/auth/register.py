from fastapi import HTTPException
from app.models.tenant import Tenant
from app.models.user import User
from app.core.security import hash_password
from app.security.auth.email_verif import issue_verification_token, send_verification_email
from app.security.auth.rate_limit import auth_rate_limiter
import logging
from sqlalchemy.exc import IntegrityError, ProgrammingError

logger = logging.getLogger(__name__)

async def register_tenant(db, tenant_name: str, email: str, password: str, first_name: str, last_name: str):
    try:
        normalized_email = email.strip().lower()
        if not auth_rate_limiter.allow(f"signup:{normalized_email}", max_attempts=5, window_seconds=15 * 60):
            raise HTTPException(status_code=429, detail="Too many signup attempts. Please try again later.")

        tenant = db.query(Tenant).filter(Tenant.name == tenant_name).first()
        # Check if tenant exists with a verified owner, only if tenant exists
        tenant_conflict = False
        if tenant:
            tenants_user = db.query(User).filter(User.tenant_id == tenant.id).first()
            if tenants_user and tenants_user.is_verified:
                tenant_conflict = True
        
        user = db.query(User).filter(User.email == normalized_email).first()
        email_conflict = user and user.is_verified

        if tenant_conflict or email_conflict:
            # Build specific message based on what conflicts
            if tenant_conflict and email_conflict:
                message = "An account already exists with that tenant name and email."
            elif tenant_conflict:
                message = "An account already exists with that tenant name."
            else:
                message = "An account already exists with that email address."
                print(message)
            return {
                "status": "already_exists",
                "message": "Tenant or email already in use.",
            }

        if user and not user.is_verified:
            # User exists but not verified - update their info and optionally change tenant
            print("User exists but not verified, updating info")
            if not tenant:
                # Create new tenant if it doesn't exist
                tenant = Tenant(name=tenant_name)
                db.add(tenant)
                db.flush()
            user.first_name = first_name
            user.last_name = last_name
            user.password_hash = hash_password(password)
            user.tenant_id = tenant.id
            user.role = "owner"
            user.is_active = True
        else:
            # New user - create tenant if it doesn't exist
            if not tenant:
                tenant = Tenant(name=tenant_name)
                db.add(tenant)
                db.flush()
            user = User(
                first_name=first_name,
                last_name=last_name,
                email=normalized_email,
                password_hash=hash_password(password),
                tenant_id=tenant.id,
                role="owner",
                is_active=True,
                is_verified=False,
            )
            db.add(user)

        db.flush()
        verification_token = issue_verification_token(db, user.id, user.email) 
        email_sent = await send_verification_email(user.email, user.id, verification_token)
        if not email_sent:
            raise HTTPException(
                status_code=502,
                detail="Unable to send verification email right now. Please try again later.",
            )

        return {
            "status": "verification_required",
            "message": "If an account can be created, we've sent verification instructions.",
        }

    except IntegrityError as exc:
        db.rollback()
        logger.warning("Registration conflict for %s: %s", email, exc)
        raise HTTPException(status_code=409, detail="Unable to process registration")
    except ProgrammingError as exc:
        db.rollback()
        if "email_verification_tokens" in str(exc):
            logger.error("Auth verification table missing. Run alembic upgrade head.")
            raise HTTPException(
                status_code=503,
                detail="Service not ready: database migration missing. Please run alembic upgrade head.",
            )
        raise
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to register user %s: %s", email, exc)
        raise HTTPException(status_code=500, detail="Internal server error")
