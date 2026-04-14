"""User schemas."""
from app.schemas.base import StrictSchema

class UserResponse(StrictSchema):
    id: str
    email: str

class UserCreate(StrictSchema):
    email: str
    password: str


class UserListItem(StrictSchema):
    id: str
    email: str
    first_name: str
    last_name: str
    tenant_id: str
    role: str
    is_active: bool
    is_verified: bool
    is_2fa_enabled: bool


class UserListResponse(StrictSchema):
    users: list[UserListItem]


class InviteUserRequest(StrictSchema):
    email: str
    first_name: str
    last_name: str
    role: str


class InviteUserResponse(StrictSchema):
    status: str
    message: str


class UpdateUserRoleRequest(StrictSchema):
    role: str


class UpdateUserRoleResponse(StrictSchema):
    status: str
    message: str
    user: UserListItem | None = None


class ToggleUserStatusRequest(StrictSchema):
    is_active: bool


class ToggleUserStatusResponse(StrictSchema):
    status: str
    message: str
    user: UserListItem | None = None


class DeleteUserResponse(StrictSchema):
    status: str
    message: str
