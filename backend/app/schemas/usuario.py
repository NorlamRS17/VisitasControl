"""
Schemas Pydantic para Usuario.
Define validación de entrada/salida para endpoints de usuarios.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UsuarioBase(BaseModel):
    """Campos comunes de usuario."""
    email: EmailStr
    nombre: str


class UsuarioCreate(UsuarioBase):
    """Schema para crear un usuario."""
    password: str
    rol: Optional[str] = "operador"


class UsuarioUpdate(BaseModel):
    """Schema para actualizar un usuario. Todos los campos opcionales."""
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    password: Optional[str] = None
    rol: Optional[str] = None


class UsuarioResponse(UsuarioBase):
    """Schema de respuesta con datos del usuario (sin password)."""
    id: int
    rol: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UsuarioLogin(BaseModel):
    """Schema para login."""
    email: EmailStr
    password: str
