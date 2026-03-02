"""
Core module: configuración, seguridad y conexión a base de datos.
"""
from .config import settings
from .database import get_db, engine, Base
