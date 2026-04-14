"""User management endpoints (CRUD, profile)."""
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.dependencies import get_db_dep
from app.models.user import User
from app.schemas.user import (
    InviteUserRequest,
    InviteUserResponse,
    UserListResponse,
    UpdateUserRoleRequest,
    UpdateUserRoleResponse,
    ToggleUserStatusRequest,
    ToggleUserStatusResponse,
    DeleteUserResponse,
)
from app.security.auth.email_verif import issue_verification_token, send_verification_email
from app.security.auth.jwt_handler import verify_jwt
from app.security.rbac import can

router = APIRouter(prefix="/users", tags=["users"])

ALLOWED_INVITE_ROLES = {"owner", "admin", "manager", "editor", "viewer", "user"}
PENDING_PASSWORD_PREFIX = "!pending!"


def _get_auth_payload(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    try:
        return verify_jwt(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid bearer token") from exc


def _require_permission(request: Request, db, permission: str) -> tuple[str, User]:
    payload = _get_auth_payload(request)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session payload")

    tenant_id = payload.get("tenant_id") or getattr(request.state, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Invalid session payload")

    current_user = db.query(User).filter(User.id == str(user_id)).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="User does not exist")
    if str(current_user.tenant_id) != str(tenant_id):
        raise HTTPException(status_code=403, detail="Cross-tenant access denied")
    if not current_user.is_active or not current_user.is_verified:
        raise HTTPException(status_code=403, detail="User is not active")
    if not can(current_user.role, permission):
        raise HTTPException(status_code=403, detail="Insufficient role permissions")

    return str(tenant_id), current_user


def _new_pending_password_hash() -> str:
    return f"{PENDING_PASSWORD_PREFIX}{secrets.token_urlsafe(24)}"


@router.get("/", response_model=UserListResponse)
async def list_users(request: Request, db=Depends(get_db_dep)):
    tenant_id, _ = _require_permission(request, db, "users.read")

    users = db.query(User).filter(User.tenant_id == tenant_id).all()
    return {
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "tenant_id": user.tenant_id,
                "role": user.role,
                "is_active": bool(user.is_active),
                "is_verified": bool(user.is_verified),
                "is_2fa_enabled": bool(user.is_2fa_enabled),
            }
            for user in users
        ]
    }


@router.post("/invite", response_model=InviteUserResponse)
async def invite_user(payload: InviteUserRequest, request: Request, db=Depends(get_db_dep)):
    tenant_id, _ = _require_permission(request, db, "users.invite")

    normalized_email = payload.email.strip().lower()
    normalized_role = payload.role.strip().lower()
    if not normalized_email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not payload.first_name.strip() or not payload.last_name.strip():
        raise HTTPException(status_code=400, detail="First and last name are required")
    if normalized_role not in ALLOWED_INVITE_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = db.query(User).filter(User.email == normalized_email).first()
    if user and str(user.tenant_id) != str(tenant_id):
        raise HTTPException(status_code=409, detail="Email is already in use")

    if user and user.is_verified:
        raise HTTPException(status_code=409, detail="User already exists")

    if user:
        user.first_name = payload.first_name.strip()
        user.last_name = payload.last_name.strip()
        user.role = normalized_role
        user.is_active = False
        user.is_verified = False
        user.is_2fa_enabled = False
        user.password_hash = _new_pending_password_hash()
    else:
        user = User(
            first_name=payload.first_name.strip(),
            last_name=payload.last_name.strip(),
            email=normalized_email,
            password_hash=_new_pending_password_hash(),
            tenant_id=tenant_id,
            role=normalized_role,
            is_active=False,
            is_verified=False,
            is_2fa_enabled=False,
        )
        db.add(user)

    db.flush()
    verification_token = issue_verification_token(db, user.id, user.email)
    email_sent = await send_verification_email(user.email, user.id, verification_token)
    if not email_sent:
        raise HTTPException(status_code=502, detail="Unable to send verification email")

    return {
        "status": "verification_required",
        "message": "Invitation sent. The user must verify email and set a password.",
    }


@router.put("/{user_id}/role", response_model=UpdateUserRoleResponse)
async def update_user_role(user_id: str, payload: UpdateUserRoleRequest, request: Request, db=Depends(get_db_dep)):
    """Update a user's role. Requires users.manage permission."""
    tenant_id, current_user = _require_permission(request, db, "users.manage")

    normalized_role = payload.role.strip().lower()
    if normalized_role not in ALLOWED_INVITE_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(target_user.tenant_id) != str(tenant_id):
        raise HTTPException(status_code=403, detail="Cross-tenant access denied")

    # Prevent self-demotion from owner/admin
    if target_user.id == current_user.id and current_user.role in ["owner", "admin"]:
        if normalized_role not in ["owner", "admin"]:
            raise HTTPException(status_code=403, detail="Cannot demote yourself from owner/admin role")

    target_user.role = normalized_role
    db.commit()

    return {
        "status": "success",
        "message": f"User role updated to {normalized_role}",
        "user": {
            "id": target_user.id,
            "email": target_user.email,
            "first_name": target_user.first_name,
            "last_name": target_user.last_name,
            "tenant_id": target_user.tenant_id,
            "role": target_user.role,
            "is_active": bool(target_user.is_active),
            "is_verified": bool(target_user.is_verified),
            "is_2fa_enabled": bool(target_user.is_2fa_enabled),
        },
    }


@router.put("/{user_id}/status", response_model=ToggleUserStatusResponse)
async def toggle_user_status(user_id: str, payload: ToggleUserStatusRequest, request: Request, db=Depends(get_db_dep)):
    """Activate or deactivate a user. Requires users.manage permission."""
    tenant_id, current_user = _require_permission(request, db, "users.manage")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(target_user.tenant_id) != str(tenant_id):
        raise HTTPException(status_code=403, detail="Cross-tenant access denied")

    # Prevent self-deactivation
    if target_user.id == current_user.id and not payload.is_active:
        raise HTTPException(status_code=403, detail="Cannot deactivate yourself")

    target_user.is_active = payload.is_active
    db.commit()

    status_text = "activated" if payload.is_active else "deactivated"
    return {
        "status": "success",
        "message": f"User {status_text}",
        "user": {
            "id": target_user.id,
            "email": target_user.email,
            "first_name": target_user.first_name,
            "last_name": target_user.last_name,
            "tenant_id": target_user.tenant_id,
            "role": target_user.role,
            "is_active": bool(target_user.is_active),
            "is_verified": bool(target_user.is_verified),
            "is_2fa_enabled": bool(target_user.is_2fa_enabled),
        },
    }


@router.delete("/{user_id}", response_model=DeleteUserResponse)
async def delete_user(user_id: str, request: Request, db=Depends(get_db_dep)):
    """Delete a user. Requires users.delete permission."""
    tenant_id, current_user = _require_permission(request, db, "users.delete")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(target_user.tenant_id) != str(tenant_id):
        raise HTTPException(status_code=403, detail="Cross-tenant access denied")

    # Prevent self-deletion
    if target_user.id == current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete yourself")

    # Prevent deletion of owner if they are the only owner
    if target_user.role == "owner":
        owner_count = db.query(User).filter(
            User.tenant_id == tenant_id,
            User.role == "owner",
            User.is_active == True,
        ).count()
        if owner_count <= 1:
            raise HTTPException(status_code=403, detail="Cannot delete the last active owner")

    db.delete(target_user)
    db.commit()

    return {
        "status": "success",
        "message": "User deleted successfully",
    }
