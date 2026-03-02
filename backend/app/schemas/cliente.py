"""
Schemas Pydantic para Cliente.
Define validación de entrada/salida para endpoints de clientes.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ClienteBase(BaseModel):
    """Campos comunes de cliente."""
    nombre_empresa: str
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClienteCreate(ClienteBase):
    """Schema para crear un cliente."""
    pass


class ClienteUpdate(BaseModel):
    """Schema para actualizar un cliente. Todos los campos opcionales."""
    nombre_empresa: Optional[str] = None
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClienteResponse(ClienteBase):
    """Schema de respuesta con datos del cliente."""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
