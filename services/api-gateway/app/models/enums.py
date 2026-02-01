"""Database enums used across models (TenantPlan, UserRole, DocumentStatus)."""
import enum

class TenantPlan(enum.Enum):
    free = "free"
    pro = "pro"
    enterprise = "enterprise"

class UserRole(enum.Enum):
    user = "user"
    admin = "admin"

class DocumentStatus(enum.Enum):
    uploaded = "uploaded"
    processed = "processed"
    failed = "failed"
