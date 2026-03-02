"""
Dependencias compartidas para los endpoints.
Incluye obtención del usuario actual desde el token JWT.
"""
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
import logging
import json

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.usuario import Usuario

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

LOG_PATH = "/home/marlon/Escritorio/Ambientes/AglomeradosCotopaxiV3/.cursor/debug-5ec78d.log"

def debug_log(location, message, data, hypothesis_id):
    """Escribe log de debug en formato NDJSON"""
    import time
    try:
        with open(LOG_PATH, "a") as f:
            entry = {
                "sessionId": "5ec78d",
                "location": location,
                "message": message,
                "data": data,
                "timestamp": int(time.time() * 1000),
                "hypothesisId": hypothesis_id
            }
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        logger.error(f"Error writing debug log: {e}")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Usuario:
    """
    Dependencia que extrae y valida el usuario actual desde el token JWT.
    Se usa en endpoints protegidos con Depends(get_current_user).
    """
    # #region agent log
    debug_log(
        "deps.py:get_current_user",
        "Token received in backend",
        {"hasToken": bool(token), "tokenPreview": token[:30] + "..." if token else "NULL", "tokenLength": len(token) if token else 0},
        "H4"
    )
    # #endregion
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = decode_access_token(token)
    
    # #region agent log
    debug_log(
        "deps.py:decode_result",
        "Token decode result",
        {"userId": user_id, "decodeSuccess": user_id is not None},
        "H5"
    )
    # #endregion
    
    if user_id is None:
        debug_log("deps.py:auth_failed", "Token invalid or expired", {"reason": "decode_failed"}, "H5")
        raise credentials_exception
    
    user = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    if user is None:
        debug_log("deps.py:user_not_found", "User not in database", {"userId": user_id}, "H5")
        raise credentials_exception
    
    debug_log("deps.py:auth_success", "User authenticated", {"userId": user_id, "email": user.email}, "H4,H5")
    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[Usuario]:
    """Versión opcional que no falla si no hay token."""
    if not token:
        return None
    try:
        return get_current_user(db, token)
    except HTTPException:
        return None
