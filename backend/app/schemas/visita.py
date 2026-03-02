"""
Schemas Pydantic para Visita.
Define validación de entrada/salida para endpoints de visitas.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from .compromiso import CompromisoCreate, CompromisoResponse
from .cliente import ClienteResponse
from .usuario import UsuarioResponse


class VisitaBase(BaseModel):
    """Campos comunes de visita."""
    id_cliente: int
    observaciones: Optional[str] = None


class VisitaCreate(VisitaBase):
    """
    Schema para crear una visita.
    Permite crear compromisos al mismo tiempo que la visita.
    - fecha_visita: opcional, si no se proporciona se usa la fecha actual
    - id_visitante: opcional, si no se proporciona se usa el usuario actual
    """
    fecha_visita: Optional[datetime] = None
    id_visitante: Optional[int] = None
    compromisos: Optional[List[CompromisoCreate]] = []


class VisitaUpdate(BaseModel):
    """Schema para actualizar una visita."""
    observaciones: Optional[str] = None


class VisitaResponse(VisitaBase):
    """Schema de respuesta básico de visita."""
    id: int
    id_visitante: int
    fecha_visita: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class VisitaConCompromisos(VisitaResponse):
    """Schema de respuesta con visita + compromisos + cliente + visitante."""
    compromisos: List[CompromisoResponse] = []
    cliente: Optional[ClienteResponse] = None
    visitante: Optional[UsuarioResponse] = None
    
    class Config:
        from_attributes = True
