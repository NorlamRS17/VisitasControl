"""
Modelo Compromiso - Tareas/compromisos derivados de una visita.
"""
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class EstadoCompromiso(str, enum.Enum):
    """Estados posibles de un compromiso."""
    PENDIENTE = "pendiente"
    EN_PROGRESO = "en_progreso"
    COMPLETADO = "completado"


class Compromiso(Base):
    """
    Tabla de compromisos.
    Cada compromiso nace de una visita y tiene un estado de seguimiento.
    Esta es la entidad que se gestiona para asegurar cumplimiento.
    """
    __tablename__ = "compromisos"
    
    id = Column(Integer, primary_key=True, index=True)
    id_visita = Column(
        Integer,
        ForeignKey("visitas.id", ondelete="CASCADE"),
        nullable=False
    )
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha_entrega = Column(Date, nullable=True)  # Permitir null en datos existentes
    estado = Column(String(20), default=EstadoCompromiso.PENDIENTE.value)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    # Relación: cada compromiso pertenece a una visita
    visita = relationship("Visita", back_populates="compromisos")
    
    def __repr__(self):
        return f"<Compromiso {self.titulo} - {self.estado}>"
