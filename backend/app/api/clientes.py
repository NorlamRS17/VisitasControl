"""
Endpoints CRUD para Clientes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.cliente import Cliente
from app.models.usuario import Usuario
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from app.api.deps import get_current_user


router = APIRouter()


@router.get("", response_model=List[ClienteResponse])
def list_clientes(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar todos los clientes (con búsqueda opcional)."""
    query = db.query(Cliente)
    
    if search:
        query = query.filter(Cliente.nombre_empresa.ilike(f"%{search}%"))
    
    clientes = query.order_by(Cliente.nombre_empresa).offset(skip).limit(limit).all()
    return clientes


@router.get("/{cliente_id}", response_model=ClienteResponse)
def get_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener un cliente por ID."""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    return cliente


@router.post("", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def create_cliente(
    cliente_data: ClienteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear un nuevo cliente."""
    cliente = Cliente(**cliente_data.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.put("/{cliente_id}", response_model=ClienteResponse)
def update_cliente(
    cliente_id: int,
    cliente_data: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar un cliente."""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    
    update_data = cliente_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cliente, field, value)
    
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Eliminar un cliente."""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    
    db.delete(cliente)
    db.commit()
    return None
