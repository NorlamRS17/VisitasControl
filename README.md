# V&C Control - Sistema de Control de Visitas y Seguimiento

Sistema para gestionar visitas a clientes y dar seguimiento a los compromisos derivados de cada visita.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19 + Vite + Tailwind CSS + GSAP |
| **Backend** | FastAPI + SQLAlchemy + Pydantic |
| **Database** | PostgreSQL 16 |

## Requisitos Previos

- Docker y Docker Compose
- Python 3.11+
- Node.js 18+
- npm o yarn

## Inicio Rápido

### 1. Clonar y configurar entorno

```bash
# Copiar variables de entorno (editar según necesidad)
cp .env.example .env
```

### 2. Levantar base de datos

```bash
docker-compose up -d
```

Esto levanta:
- **PostgreSQL** en `localhost:5432`
- **pgAdmin** en `http://localhost:5050` (admin@vccontrol.com / admin123)

### 3. Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o en Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload
```

El backend estará en `http://localhost:8000`
- Documentación Swagger: `http://localhost:8000/docs`
- Documentación ReDoc: `http://localhost:8000/redoc`

### 4. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en `http://localhost:5173`

## Estructura del Proyecto

```
AglomeradosCotopaxiV3/
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas/vistas
│   │   ├── services/        # Llamadas a API
│   │   ├── hooks/           # Custom hooks
│   │   └── styles/          # CSS global
│   └── ...
│
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── api/             # Endpoints REST
│   │   ├── models/          # Modelos SQLAlchemy
│   │   ├── schemas/         # Schemas Pydantic
│   │   ├── services/        # Lógica de negocio
│   │   └── core/            # Configuración
│   └── alembic/             # Migraciones
│
├── docker-compose.yml       # PostgreSQL + pgAdmin
└── README.md
```

## Regla de Negocio Principal

```
VISITA (1) ────────> COMPROMISOS (N)
```

- El flujo SIEMPRE inicia con una **VISITA**
- Una Visita puede generar 0 o más **COMPROMISOS**
- Cada compromiso tiene: título, descripción, fecha de entrega y estado
- Estados posibles: `pendiente`, `en_progreso`, `completado`

## Comandos Útiles

```bash
# Detener contenedores
docker-compose down

# Ver logs de la base de datos
docker-compose logs -f db

# Reiniciar todo
docker-compose down && docker-compose up -d

# Crear nueva migración (backend)
alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones
alembic upgrade head

# Cargar datos de prueba
cd backend
python -m scripts.seed
```

## Credenciales de Prueba

Después de ejecutar el seed:

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Admin | admin@vccontrol.com | admin123 |
| Operador | operador@vccontrol.com | operador123 |

## Tema Visual: "Tech Orgánico"

| Color | Hex | Uso |
|-------|-----|-----|
| Fondo | `#F2F0E9` | Background principal |
| Primario | `#2E4036` | Textos, headers |
| Acento | `#CC5833` | CTAs, alertas |
| Oscuro | `#1A1A1A` | Texto secundario |


matar todos los procesos
# Matar todo
pkill -f node
pkill -f vite
pkill -f uvicorncd ~/Escritorio/Ambientes/AglomeradosCotopaxiV3/frontend


# Esperar 2 segundos
sleep 2

# Verificar que los puertos están libres
lsof -i :5173 -i :8000