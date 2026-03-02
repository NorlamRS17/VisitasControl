"""
Schemas Pydantic para Compromiso.
Define validación de entrada/salida para endpoints de compromisos.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class CompromisoBase(BaseModel):
    """Campos comunes de compromiso."""
    titulo: str
    descripcion: Optional[str] = None


class CompromisoCreate(CompromisoBase):
    """Schema para crear un compromiso (se usa dentro de una visita)."""
    fecha_entrega: date  # Obligatorio al crear


class CompromisoCreateWithVisita(CompromisoBase):
    """Schema para crear un compromiso asociado a una visita existente."""
    id_visita: int
    fecha_entrega: date  # Obligatorio al crear


class CompromisoUpdate(BaseModel):
    """Schema para actualizar un compromiso."""
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_entrega: Optional[date] = None
    estado: Optional[str] = None


class ClienteMinimal(BaseModel):
    """Schema minimal de cliente para anidamiento."""
    id: int
    nombre_empresa: str
    
    class Config:
        from_attributes = True


class VisitaMinimal(BaseModel):
    """Schema minimal de visita para anidamiento."""
    id: int
    fecha_visita: datetime
    cliente: Optional[ClienteMinimal] = None
    
    class Config:
        from_attributes = True


class CompromisoResponse(CompromisoBase):
    """Schema de respuesta con datos del compromiso."""
    id: int
    id_visita: int
    fecha_entrega: Optional[date] = None  # Puede ser null en datos existentes
    estado: str
    created_at: datetime
    updated_at: datetime
    visita: Optional[VisitaMinimal] = None
    
    class Config:
        from_attributes = True
