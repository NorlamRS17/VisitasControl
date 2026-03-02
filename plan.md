# ACT AS: Senior Fullstack Engineer & UI/UX Specialist
# PROJECT: Sistema de Control de Visitas y Seguimiento (V&C Control)

---

## 1. TECH STACK (NUNCA CAMBIAR)

### 🎨 FRONTEND (Prioridad Visual)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v3.4
- **Animaciones:** GSAP 3 + ScrollTrigger (transiciones cinematográficas)
- **Icons:** Lucide React
- **Router:** React Router v6
- **HTTP Client:** Axios o Fetch API
- **Fuentes:** Google Fonts (Plus Jakarta Sans + Cormorant Garamond)

### 🐍 BACKEND
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy 2.0
- **Validación:** Pydantic v2
- **Migraciones:** Alembic
- **Auth:** JWT (python-jose)

### 🗄️ DATABASE
- **Motor:** PostgreSQL 16 (Dockerizado)
- **Admin:** pgAdmin o DBeaver

---

## 2. THEME: "Tech Orgánico" (Sistema de Diseño)

### Paleta de Colores
| Token | Hex | Uso |
|-------|-----|-----|
| `--bg` | `#F2F0E9` | Fondo principal (crema cálido) |
| `--primary` | `#2E4036` | Textos, headers, botones principales (musgo) |
| `--accent` | `#CC5833` | CTAs, alertas, estados activos (arcilla) |
| `--dark` | `#1A1A1A` | Texto secundario, footers (carbón) |
| `--muted` | `#8B8B7A` | Textos deshabilitados, placeholders |

### Tipografía
```css
--font-heading: 'Plus Jakarta Sans', sans-serif;  /* Títulos */
--font-body: 'Outfit', sans-serif;                /* Cuerpo */
--font-accent: 'Cormorant Garamond', serif;       /* Énfasis dramático */
--font-mono: 'IBM Plex Mono', monospace;          /* Datos, códigos */
```

### Textura Visual
- Superposición de ruido SVG (`feTurbulence`) a **0.03 opacidad** sobre el fondo.
- Elimina la sensación "plana" de los gradientes digitales.

### Radios y Sombras
```css
--radius-sm: 0.75rem;   /* Botones pequeños, inputs */
--radius-md: 1.5rem;    /* Cards, modales */
--radius-lg: 2rem;      /* Contenedores principales */
--radius-xl: 3rem;      /* Secciones hero */

--shadow-card: 0 4px 20px rgba(0,0,0,0.06);
--shadow-hover: 0 8px 30px rgba(0,0,0,0.1);
```

---

## 3. UI/UX CINEMATOGRÁFICO

### Micro-Interacciones (OBLIGATORIAS)
- **Botones:** Efecto magnético `scale(1.02)` + desplazamiento de fondo en hover.
- **Cards:** Elevación sutil `translateY(-4px)` + sombra expandida en hover.
- **Links:** Subrayado animado que crece desde el centro.
- **Inputs:** Borde que transiciona de `muted` a `primary` en focus.
- **Transiciones:** Usar `cubic-bezier(0.25, 0.46, 0.45, 0.94)` para todo.

### Animaciones de Entrada (GSAP)
- Elementos aparecen con `fade-up` escalonado (y: 30 → 0, opacity: 0 → 1).
- Stagger: `0.08s` entre elementos de lista.
- Easing: `power3.out` para entradas.

### Componentes Premium

#### Sidebar de Navegación
- Fondo `--primary` con texto claro.
- Logo en la parte superior.
- Iconos + labels con hover que ilumina con `--accent`.
- Indicador activo: barra vertical de `--accent` a la izquierda.

#### Cards de Visitas
- Fondo blanco, borde sutil `1px solid rgba(0,0,0,0.06)`.
- Badge de fecha en `--accent` si es reciente.
- Contador de compromisos con pill redondeado.
- Hover: sombra expandida + escala sutil.

#### Formularios
- Labels flotantes que se animan al focus.
- Inputs con padding generoso y bordes redondeados.
- Botón principal con gradiente sutil de `--primary` a un tono más oscuro.

#### Estados de Compromisos (Visual)
- **Pendiente:** Badge gris con icono de reloj.
- **En Progreso:** Badge azul/verde con icono de flecha circular.
- **Completado:** Badge verde con check animado.

#### Empty States
- Ilustraciones SVG minimalistas.
- Texto guía con CTA claro.
- Nunca pantallas vacías sin contexto.

---

## 4. REGLA DE NEGOCIO PRINCIPAL

```
VISITA (1) ─────────────> COMPROMISOS (N)
   │                           │
   │ Una visita puede          │ Cada compromiso tiene:
   │ generar 0 o más           │ - Título
   │ compromisos               │ - Descripción
   │                           │ - Fecha de entrega
   │                           │ - Estado (pendiente/progreso/completado)
   └───────────────────────────┘
```

**El objetivo:** Trazabilidad total. Ningún compromiso debe quedar huérfano.

---

## 5. DATA MODEL (PostgreSQL)

```sql
-- Usuarios del sistema
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'operador',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Clientes/Empresas que se visitan
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Registro de visitas
CREATE TABLE visitas (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES clientes(id),
    id_visitante INTEGER REFERENCES usuarios(id),
    fecha_visita TIMESTAMP DEFAULT NOW(),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Compromisos derivados de visitas
CREATE TABLE compromisos (
    id SERIAL PRIMARY KEY,
    id_visita INTEGER REFERENCES visitas(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_entrega DATE,
    estado VARCHAR(20) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enum de estados
-- 'pendiente' | 'en_progreso' | 'completado'
```

---

## 6. ESTRUCTURA DE CARPETAS

```
📁 AglomeradosCotopaxiV3/
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes reutilizables
│   │   │   ├── ui/               # Botones, Inputs, Cards, Modals
│   │   │   ├── layout/           # Sidebar, Header, Footer
│   │   │   └── forms/            # Formularios específicos
│   │   ├── 📁 pages/             # Vistas principales
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Visitas.jsx
│   │   │   ├── NuevaVisita.jsx
│   │   │   ├── DetalleVisita.jsx
│   │   │   └── Login.jsx
│   │   ├── 📁 hooks/             # Custom hooks
│   │   ├── 📁 services/          # Llamadas a API
│   │   ├── 📁 utils/             # Helpers, formatters
│   │   ├── 📁 styles/            # CSS global, animaciones
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── 📁 backend/
│   ├── 📁 app/
│   │   ├── 📁 api/               # Endpoints (routers)
│   │   │   ├── usuarios.py
│   │   │   ├── clientes.py
│   │   │   ├── visitas.py
│   │   │   └── compromisos.py
│   │   ├── 📁 models/            # Modelos SQLAlchemy
│   │   ├── 📁 schemas/           # Schemas Pydantic
│   │   ├── 📁 services/          # Lógica de negocio
│   │   ├── 📁 core/              # Config, security, database
│   │   └── main.py               # Entry point FastAPI
│   ├── 📁 alembic/               # Migraciones
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml            # PostgreSQL + pgAdmin
└── README.md
```

---

## 7. PANTALLAS PRINCIPALES

| Pantalla | Descripción | Componentes clave |
|----------|-------------|-------------------|
| **Login** | Autenticación minimalista | Input flotante, botón animado |
| **Dashboard** | Vista general: stats + visitas recientes | Cards métricas, tabla/lista animada |
| **Visitas** | Listado completo filtrable | Búsqueda, filtros, paginación |
| **Nueva Visita** | Formulario de creación | Selector cliente, textarea, lista dinámica de compromisos |
| **Detalle Visita** | Info de visita + compromisos | Timeline, cards de compromisos con drag o switch de estado |
| **Clientes** | CRUD de clientes | Tabla editable, modal de creación |

---

## 8. INSTRUCCIONES DE IMPLEMENTACIÓN

1. **Configurar el entorno:**
   - Crear `docker-compose.yml` con PostgreSQL.
   - Scaffolding de frontend con Vite + React.
   - Scaffolding de backend con FastAPI.

2. **Backend primero:**
   - Configurar SQLAlchemy + Alembic.
   - Crear modelos y ejecutar migraciones.
   - Implementar endpoints CRUD.
   - Documentación automática en `/docs`.

3. **Frontend premium:**
   - Configurar Tailwind con theme personalizado.
   - Implementar sistema de ruido visual.
   - Crear componentes base (Button, Input, Card, Modal).
   - Implementar Sidebar + Layout principal.
   - Conectar con API usando servicios.
   - Añadir animaciones GSAP.

4. **Pulir:**
   - Estados de carga (skeletons animados).
   - Manejo de errores elegante.
   - Responsive en todas las vistas.
   - Transiciones entre páginas.

---

> "Construye un instrumento digital de alta fidelidad. Cada clic debe sentirse intencionado, cada transición debe tener peso visual. El frontend es la estrella."
