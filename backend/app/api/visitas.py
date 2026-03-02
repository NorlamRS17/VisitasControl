"""
Endpoints CRUD para Visitas.
Incluye creación de visitas con compromisos en una sola operación.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime, timedelta

from app.core.database import get_db
from app.models.visita import Visita
from app.models.compromiso import Compromiso
from app.models.usuario import Usuario
from app.schemas.visita import VisitaCreate, VisitaUpdate, VisitaResponse, VisitaConCompromisos
from app.api.deps import get_current_user


router = APIRouter()


@router.get("", response_model=List[VisitaConCompromisos])
def list_visitas(
    skip: int = 0,
    limit: int = 50,
    id_cliente: Optional[int] = None,
    fecha_desde: Optional[date] = Query(None, description="Filtrar desde esta fecha (YYYY-MM-DD)"),
    fecha_hasta: Optional[date] = Query(None, description="Filtrar hasta esta fecha (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Listar visitas con sus compromisos, cliente y visitante.
    - Admin: ve todas las visitas
    - Operador: solo ve sus visitas asignadas
    """
    query = db.query(Visita).options(
        joinedload(Visita.compromisos),
        joinedload(Visita.cliente),
        joinedload(Visita.visitante)
    )
    
    # Operadores solo ven sus propias visitas
    if current_user.rol != "admin":
        query = query.filter(Visita.id_visitante == current_user.id)
    
    if id_cliente:
        query = query.filter(Visita.id_cliente == id_cliente)
    
    if fecha_desde:
        fecha_desde_dt = datetime.combine(fecha_desde, datetime.min.time())
        query = query.filter(Visita.fecha_visita >= fecha_desde_dt)
    
    if fecha_hasta:
        fecha_hasta_dt = datetime.combine(fecha_hasta, datetime.max.time())
        query = query.filter(Visita.fecha_visita <= fecha_hasta_dt)
    
    visitas = query.order_by(Visita.fecha_visita.desc()).offset(skip).limit(limit).all()
    return visitas


@router.get("/recientes", response_model=List[VisitaConCompromisos])
def get_visitas_recientes(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener las visitas más recientes para el dashboard.
    - Admin: ve todas las visitas
    - Operador: solo ve sus visitas asignadas
    """
    query = db.query(Visita).options(
        joinedload(Visita.compromisos),
        joinedload(Visita.cliente),
        joinedload(Visita.visitante)
    )
    
    # Operadores solo ven sus propias visitas
    if current_user.rol != "admin":
        query = query.filter(Visita.id_visitante == current_user.id)
    
    visitas = query.order_by(Visita.fecha_visita.desc()).limit(limit).all()
    return visitas


@router.get("/{visita_id}", response_model=VisitaConCompromisos)
def get_visita(
    visita_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener una visita con todos sus compromisos.
    - Admin: puede ver cualquier visita
    - Operador: solo puede ver sus visitas asignadas
    """
    visita = db.query(Visita).options(
        joinedload(Visita.compromisos),
        joinedload(Visita.cliente),
        joinedload(Visita.visitante)
    ).filter(Visita.id == visita_id).first()
    
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita no encontrada"
        )
    
    # Operadores solo pueden ver sus propias visitas
    if current_user.rol != "admin" and visita.id_visitante != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta visita"
        )
    
    return visita


@router.post("", response_model=VisitaConCompromisos, status_code=status.HTTP_201_CREATED)
def create_visita(
    visita_data: VisitaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crear una nueva visita.
    Permite incluir compromisos en la misma operación.
    - fecha_visita: si no se proporciona, usa la fecha/hora actual
    - id_visitante: si no se proporciona, usa el usuario autenticado
    """
    visita = Visita(
        id_cliente=visita_data.id_cliente,
        id_visitante=visita_data.id_visitante or current_user.id,
        fecha_visita=visita_data.fecha_visita,  # Si es None, el modelo usa default
        observaciones=visita_data.observaciones
    )
    db.add(visita)
    db.flush()
    
    if visita_data.compromisos:
        for compromiso_data in visita_data.compromisos:
            compromiso = Compromiso(
                id_visita=visita.id,
                titulo=compromiso_data.titulo,
                descripcion=compromiso_data.descripcion,
                fecha_entrega=compromiso_data.fecha_entrega
            )
            db.add(compromiso)
    
    db.commit()
    
    return db.query(Visita).options(
        joinedload(Visita.compromisos),
        joinedload(Visita.cliente),
        joinedload(Visita.visitante)
    ).filter(Visita.id == visita.id).first()


@router.put("/{visita_id}", response_model=VisitaConCompromisos)
def update_visita(
    visita_id: int,
    visita_data: VisitaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar observaciones de una visita."""
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita no encontrada"
        )
    
    if visita_data.observaciones is not None:
        visita.observaciones = visita_data.observaciones
    
    db.commit()
    
    return db.query(Visita).options(
        joinedload(Visita.compromisos),
        joinedload(Visita.cliente),
        joinedload(Visita.visitante)
    ).filter(Visita.id == visita_id).first()


@router.delete("/{visita_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visita(
    visita_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Eliminar una visita (y sus compromisos en cascada)."""
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita no encontrada"
        )
    
    db.delete(visita)
    db.commit()
    return None
