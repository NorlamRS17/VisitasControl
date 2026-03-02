"""
Modelo Visita - Registro de visitas realizadas a clientes.
"""
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Visita(Base):
    """
    Tabla de visitas.
    Cada visita está asociada a un cliente y un visitante (usuario).
    De cada visita pueden derivarse múltiples compromisos.
    """
    __tablename__ = "visitas"
    
    id = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    id_visitante = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha_visita = Column(DateTime(timezone=True), server_default=func.now())
    observaciones = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    cliente = relationship("Cliente", back_populates="visitas")
    visitante = relationship("Usuario", back_populates="visitas")
    compromisos = relationship(
        "Compromiso",
        back_populates="visita",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Visita {self.id} - Cliente {self.id_cliente}>"
