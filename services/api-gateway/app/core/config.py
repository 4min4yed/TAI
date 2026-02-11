"""Application configuration (Pydantic settings)."""
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
    
class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="allow")  
    DATABASE_URL: str
    REDIS_URL: str
    RABBITMQ_URL: str
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "changeme"
    JWT_SECRET: str = "changeme"
    JWT_ISSUER: str = "https://auth.example.com/"
    VAULT_ADDR: str = "http://127.0.0.1:8200"
