"""
Configuration settings for AI services
"""

import os
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "iLLuMinate AI Services"
    version: str = "1.0.0"
    environment: str = "development"
    port: int = 8000
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    
    # Database
    database_url: str = ""
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "illuminate_db"
    db_user: str = "illuminate"
    db_password: str = ""
    
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"
    openai_max_tokens: int = 1000
    openai_temperature: float = 0.7
    
    # Backend API
    backend_api_url: str = "http://localhost:3000"
    backend_api_timeout: int = 30
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Security
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    
    # AI Models
    model_cache_size: int = 100
    model_timeout: int = 60
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_burst: int = 100
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Build database URL if not provided
        if not self.database_url and all([
            self.db_host, self.db_port, self.db_name, self.db_user, self.db_password
        ]):
            self.database_url = (
                f"postgresql://{self.db_user}:{self.db_password}"
                f"@{self.db_host}:{self.db_port}/{self.db_name}"
            )
        
        # Parse CORS origins string to list
        if hasattr(self, 'cors_origins') and isinstance(self.cors_origins, str):
            self.cors_origins = [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    
    Returns:
        Settings: Application settings
    """
    return Settings()

