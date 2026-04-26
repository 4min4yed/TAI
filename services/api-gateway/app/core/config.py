"""Application configuration (Pydantic settings)."""
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
    
class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="allow")  
    DATABASE_URL: str
    REDIS_URL: str
    RABBITMQ_URL: str
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "changeme"
    JWT_SECRET: str = "changeme"
    JWT_ISSUER: str = "https://auth.example.com/"
    JWT_AUDIENCE: str = "tai-api"
    JWT_ALGORITHMS: str = "HS256,RS256,EdDSA"
    JWT_ACTIVE_KID: str = "default"
    JWT_KEY_RING_JSON: str = ""
    JWT_ACCESS_TTL_MINUTES: int = 15
    JWT_REFRESH_TTL_DAYS: int = 30
    JWT_MFA_CHALLENGE_TTL_MINUTES: int = 5
    JWT_RS256_PRIVATE_KEY: str = ""
    JWT_RS256_PUBLIC_KEY: str = ""
    JWT_EDDSA_PRIVATE_KEY: str = ""
    JWT_EDDSA_PUBLIC_KEY: str = ""
    AUTH_COOKIE_DOMAIN: str = ""
    AUTH_COOKIE_SECURE: bool = False
    AUTH_COOKIE_SAMESITE: str = "lax"
    REFRESH_COOKIE_NAME: str = "refresh_token"
    CSRF_COOKIE_NAME: str = "csrf_token"
    PASSWORD_RESET_TTL_MINUTES: int = 30
    PASSWORD_PEPPER: str = ""
    ARGON2_TIME_COST: int = 3
    ARGON2_MEMORY_COST_KIB: int = 65536
    ARGON2_PARALLELISM: int = 4
    TOTP_ISSUER: str = "TAI Platform"
    EMAIL_LOGIN_2FA_TTL_MINUTES: int = 10
    EMAIL_LOGIN_2FA_MAX_ATTEMPTS: int = 5
    EMAIL_LOGIN_2FA_SEND_LIMIT_PER_10_MIN: int = 5
    EMAIL_LOGIN_2FA_VERIFY_LIMIT_IP_PER_5_MIN: int = 20
    EMAIL_LOGIN_2FA_VERIFY_LIMIT_USER_PER_5_MIN: int = 8
    AUTH_RATE_LIMIT_AUTH_PER_MIN: int = 100
    AUTH_RATE_LIMIT_ANON_PER_MIN: int = 10
    VAULT_ADDR: str = "http://127.0.0.1:8200"
    EMAIL_VERIFICATION_TTL_MINUTES: int = 30
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "TAI Platform"
    MINIO_ENDPOINT: str = "127.0.0.1:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "tai-documents"
    MINIO_SECURE: bool = False
    DOCUMENT_AV_SCAN_ENABLED: bool = False  #kif yerka7 AV, 7ell
