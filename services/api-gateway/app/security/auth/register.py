from fastapi import HTTPException
from app.models.tenant import Tenant
from app.models.user import User
from app.core.security import hash_password
# from app.security.auth.session_manager import SessionManager
import logging
import traceback
from sqlalchemy.exc import IntegrityError
# import uuid
logger = logging.getLogger(__name__)

async def register_tenant(db, tenant_name: str, email: str, password: str, first_name: str, last_name: str):
    try:
        # tenant = Tenant(name=tenant_name)
        tenant = db.query(Tenant).filter(Tenant.name == tenant_name).first()
        if not tenant:
            tenant = Tenant(name=tenant_name)
            db.add(tenant)
            db.flush()
            # raise HTTPException(status_code=409, detail="Tenant with this name already exists")
        
        user = User(first_name=first_name, last_name=last_name, email=email, password_hash=hash_password(password), tenant_id=tenant.id, role='owner', is_active=True, is_verified=False)
        db.add(user)
        db.commit()

        # tokens = manager.create_session(user.id, tenant.id)
        print(f"id: {user.id}, email: {user.email}, tenant_id: {tenant.id}")  
        return {
            "id": user.id,
            "email": user.email,
            "tenant_id": tenant.id,
            "access_token": "temporary_token", # Replace with actual token logic
            "refresh_token": "temporary_token"
        }     
        # return {"msg": "Registration successful"}
    
    except IntegrityError as exc:
        db.rollback()
        logger.warning("Registration conflict for %s: %s", email, exc)
        raise HTTPException(status_code=409, detail="Email already registered")
    except Exception as exc:
        db.rollback() # Ensure we rollback on any exception to avoid leaving the session in an error state
        tb = traceback.format_exc()
        logger.exception("Failed to register user %s: %s", email, exc)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(exc)}") #to be removed in Prod
