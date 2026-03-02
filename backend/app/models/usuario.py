"""
Modelo Usuario - Usuarios del sistema (operadores, administradores).
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class RolUsuario(str, enum.Enum):
    """Roles disponibles en el sistema."""
    ADMIN = "admin"
    OPERADOR = "operador"


class Usuario(Base):
    """
    Tabla de usuarios del sistema.
    Almacena credenciales y datos básicos de los operadores.
    """
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nombre = Column(String(100), nullable=False)
    rol = Column(String(20), default=RolUsuario.OPERADOR.value)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relación: un usuario puede realizar muchas visitas
    visitas = relationship("Visita", back_populates="visitante")
    
    def __repr__(self):
        return f"<Usuario {self.email}>"
