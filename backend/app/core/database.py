"""
Configuración de la conexión a PostgreSQL con SQLAlchemy.
Provee el engine, SessionLocal y Base para los modelos.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator

from .config import settings


engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db() -> Generator:
    """
    Dependency que provee una sesión de base de datos.
    Se usa en los endpoints con Depends(get_db).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
