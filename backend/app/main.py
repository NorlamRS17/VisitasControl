"""
Entry point de la aplicación FastAPI.
Configura CORS, incluye routers y define endpoints base.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, usuarios, clientes, visitas, compromisos


app = FastAPI(
    title=settings.APP_NAME,
    description="Sistema de Control de Visitas y Seguimiento de Compromisos",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False  # Evita redirecciones 307 que pierden headers de auth
)

# Configuración de CORS para permitir requests del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers de la API
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuarios"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(visitas.router, prefix="/api/visitas", tags=["Visitas"])
app.include_router(compromisos.router, prefix="/api/compromisos", tags=["Compromisos"])


@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz para verificar que la API está funcionando."""
    return {
        "message": "V&C Control API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Endpoint de salud para monitoreo."""
    return {"status": "healthy"}
