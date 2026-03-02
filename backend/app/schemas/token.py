"""
Schemas Pydantic para tokens JWT.
"""
from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """Schema de respuesta al hacer login exitoso."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Contenido decodificado del token."""
    sub: Optional[str] = None
