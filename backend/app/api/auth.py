"""
Endpoints de autenticación: login y registro.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.schemas.token import Token


router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Autenticación de usuario.
    Recibe email y password, retorna token JWT si las credenciales son válidas.
    """
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """
    Registro de nuevo usuario.
    Verifica que el email no exista y crea el usuario.
    """
    existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    new_user = Usuario(
        email=user_data.email,
        nombre=user_data.nombre,
        password_hash=get_password_hash(user_data.password),
        rol=user_data.rol or "operador"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user
