"""Application configuration (Pydantic settings)."""
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
    
class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="allow")  
    DATABASE_URL: str
    REDIS_URL: str
    RABBITMQ_URL: str
    FRONTEND_URL: str = "http://localhost:3000"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "changeme"
    JWT_SECRET: str = "changeme"
    JWT_ISSUER: str = "https://auth.example.com/"
    VAULT_ADDR: str = "http://127.0.0.1:8200"
    EMAIL_VERIFICATION_TTL_MINUTES: int = 30
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "TAI Platform"
