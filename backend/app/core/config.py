"""
Configuración centralizada del backend usando Pydantic Settings.
Lee variables de entorno desde .env o del sistema.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación cargada desde variables de entorno."""
    
    # Database
    POSTGRES_USER: str = "vccontrol"
    POSTGRES_PASSWORD: str = "vccontrol123"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "vccontrol_db"
    DATABASE_URL: Optional[str] = None
    
    # JWT Authentication
    SECRET_KEY: str = "tu_clave_secreta_muy_segura_cambiar_en_produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 días
    
    # App
    APP_NAME: str = "V&C Control"
    DEBUG: bool = True
    
    @property
    def database_url(self) -> str:
        """Construye la URL de conexión a PostgreSQL."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
