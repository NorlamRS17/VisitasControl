"""
Endpoints CRUD para Compromisos.
Permite gestionar compromisos individualmente y cambiar su estado.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models.compromiso import Compromiso, EstadoCompromiso
from app.models.visita import Visita
from app.models.usuario import Usuario
from app.schemas.compromiso import (
    CompromisoCreate,
    CompromisoCreateWithVisita,
    CompromisoUpdate,
    CompromisoResponse
)
from app.api.deps import get_current_user


router = APIRouter()


@router.get("", response_model=List[CompromisoResponse])
def list_compromisos(
    skip: int = 0,
    limit: int = 100,
    estado: str = None,
    id_visita: int = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Listar compromisos con filtros opcionales.
    - Admin: ve todos los compromisos
    - Operador: solo ve compromisos de sus visitas asignadas
    """
    query = db.query(Compromiso).options(
        joinedload(Compromiso.visita).joinedload(Visita.cliente)
    )
    
    # Operadores solo ven compromisos de sus visitas
    if current_user.rol != "admin":
        query = query.join(Visita).filter(Visita.id_visitante == current_user.id)
    
    if estado:
        query = query.filter(Compromiso.estado == estado)
    
    if id_visita:
        query = query.filter(Compromiso.id_visita == id_visita)
    
    compromisos = query.order_by(
        Compromiso.fecha_entrega.asc().nullslast()
    ).offset(skip).limit(limit).all()
    
    return compromisos


@router.get("/pendientes", response_model=List[CompromisoResponse])
def get_compromisos_pendientes(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener compromisos pendientes ordenados por fecha de entrega.
    - Admin: ve todos
    - Operador: solo ve los de sus visitas
    """
    query = db.query(Compromiso).options(
        joinedload(Compromiso.visita).joinedload(Visita.cliente)
    ).filter(
        Compromiso.estado.in_([
            EstadoCompromiso.PENDIENTE.value,
            EstadoCompromiso.EN_PROGRESO.value
        ])
    )
    
    # Operadores solo ven compromisos de sus visitas
    if current_user.rol != "admin":
        query = query.join(Visita).filter(Visita.id_visitante == current_user.id)
    
    compromisos = query.order_by(
        Compromiso.fecha_entrega.asc().nullslast()
    ).limit(limit).all()
    
    return compromisos


@router.get("/stats")
def get_compromisos_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener estadísticas de compromisos para el dashboard.
    - Admin: ve estadísticas globales
    - Operador: solo ve estadísticas de sus compromisos
    """
    base_query = db.query(Compromiso)
    
    # Operadores solo ven sus compromisos
    if current_user.rol != "admin":
        base_query = base_query.join(Visita).filter(Visita.id_visitante == current_user.id)
    
    pendientes = base_query.filter(
        Compromiso.estado == EstadoCompromiso.PENDIENTE.value
    ).count()
    
    # Reconstruir query para cada filtro (SQLAlchemy no permite reusar queries filtradas)
    base_query2 = db.query(Compromiso)
    if current_user.rol != "admin":
        base_query2 = base_query2.join(Visita).filter(Visita.id_visitante == current_user.id)
    
    en_progreso = base_query2.filter(
        Compromiso.estado == EstadoCompromiso.EN_PROGRESO.value
    ).count()
    
    base_query3 = db.query(Compromiso)
    if current_user.rol != "admin":
        base_query3 = base_query3.join(Visita).filter(Visita.id_visitante == current_user.id)
    
    completados = base_query3.filter(
        Compromiso.estado == EstadoCompromiso.COMPLETADO.value
    ).count()
    
    return {
        "pendientes": pendientes,
        "en_progreso": en_progreso,
        "completados": completados,
        "total": pendientes + en_progreso + completados
    }


@router.get("/{compromiso_id}", response_model=CompromisoResponse)
def get_compromiso(
    compromiso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener un compromiso por ID."""
    compromiso = db.query(Compromiso).filter(Compromiso.id == compromiso_id).first()
    if not compromiso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compromiso no encontrado"
        )
    return compromiso


@router.post("", response_model=CompromisoResponse, status_code=status.HTTP_201_CREATED)
def create_compromiso(
    compromiso_data: CompromisoCreateWithVisita,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear un nuevo compromiso asociado a una visita existente."""
    compromiso = Compromiso(
        id_visita=compromiso_data.id_visita,
        titulo=compromiso_data.titulo,
        descripcion=compromiso_data.descripcion,
        fecha_entrega=compromiso_data.fecha_entrega
    )
    db.add(compromiso)
    db.commit()
    db.refresh(compromiso)
    return compromiso


@router.put("/{compromiso_id}", response_model=CompromisoResponse)
def update_compromiso(
    compromiso_id: int,
    compromiso_data: CompromisoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar un compromiso (título, descripción, fecha o estado)."""
    compromiso = db.query(Compromiso).filter(Compromiso.id == compromiso_id).first()
    if not compromiso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compromiso no encontrado"
        )
    
    update_data = compromiso_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(compromiso, field, value)
    
    db.commit()
    db.refresh(compromiso)
    return compromiso


@router.patch("/{compromiso_id}/estado", response_model=CompromisoResponse)
def update_compromiso_estado(
    compromiso_id: int,
    estado: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Cambiar el estado de un compromiso rápidamente."""
    if estado not in [e.value for e in EstadoCompromiso]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado inválido. Debe ser: {[e.value for e in EstadoCompromiso]}"
        )
    
    compromiso = db.query(Compromiso).filter(Compromiso.id == compromiso_id).first()
    if not compromiso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compromiso no encontrado"
        )
    
    compromiso.estado = estado
    db.commit()
    db.refresh(compromiso)
    return compromiso


@router.delete("/{compromiso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_compromiso(
    compromiso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Eliminar un compromiso."""
    compromiso = db.query(Compromiso).filter(Compromiso.id == compromiso_id).first()
    if not compromiso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compromiso no encontrado"
        )
    
    db.delete(compromiso)
    db.commit()
    return None
