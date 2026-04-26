"""Auth request/response schemas."""
from app.schemas.base import StrictSchema

class LoginRequest(StrictSchema):
    email: str
    password: str
    rememberMe: bool | None = None


class LoginUserPayload(StrictSchema):
    id: str
    first_name: str
    last_name: str
    email: str
    role: str
    tenant_id: str
    tenant_name: str
    is_2fa_enabled: bool
    login_mfa_enabled: bool


class LoginResponse(StrictSchema):
    access_token: str | None = None
    refresh_token: str | None = None
    token_type: str = "bearer"
    mfa_required: bool = False
    mfa_token: str | None = None
    user: LoginUserPayload

class TokenResponse(StrictSchema):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(StrictSchema):
    tenant_name: str
    email: str
    password: str
    firstName: str
    lastName: str

class RegisterResponse(StrictSchema):
    status: str
    message: str


class VerifyEmailValidateRequest(StrictSchema):
    token: str


class VerifyEmailValidateResponse(StrictSchema):
    valid: bool
    message: str
    requires_password_setup: bool = False


class VerifyEmailConfirmRequest(StrictSchema):
    token: str
    password: str | None = None
    new_password: str | None = None
    confirm_password: str | None = None


class VerifyEmailConfirmResponse(StrictSchema):
    status: str
    message: str


class ResendVerificationRequest(StrictSchema):
    email: str


class GenericAuthActionResponse(StrictSchema):
    status: str
    message: str


class NotMeRequest(StrictSchema):
    token: str


class RefreshRequest(StrictSchema):
    refresh_token: str | None = None


class LogoutRequest(StrictSchema):
    refresh_token: str | None = None


class ForgotPasswordRequest(StrictSchema):
    email: str


class ForgotPasswordConfirmRequest(StrictSchema):
    token: str
    new_password: str
    confirm_password: str


class MFAVerifyLoginRequest(StrictSchema):
    mfa_token: str
    code: str


class MFASetupResponse(StrictSchema):
    secret: str
    otpauth_uri: str


class MFAEnableRequest(StrictSchema):
    code: str


class MFADisableRequest(StrictSchema):
    code: str


class MFALoginDisableRequest(StrictSchema):
    password: str
