"""
Modelo Cliente - Empresas o personas que se visitan.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Cliente(Base):
    """
    Tabla de clientes/empresas.
    Almacena información de contacto de las entidades visitadas.
    """
    __tablename__ = "clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre_empresa = Column(String(200), nullable=False, index=True)
    contacto = Column(String(100), nullable=True)
    telefono = Column(String(20), nullable=True)
    direccion = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relación: un cliente puede tener muchas visitas
    visitas = relationship("Visita", back_populates="cliente")
    
    def __repr__(self):
        return f"<Cliente {self.nombre_empresa}>"
