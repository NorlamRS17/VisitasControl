/**
 * Dashboard principal.
 * Muestra estadísticas, compromisos próximos y visitas recientes.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Clock,
  RefreshCw,
  CheckCircle,
  Plus,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Building2,
  User
} from 'lucide-react'
import { Card, Badge, Button, PageLoader } from '../components/ui'
import { PageHeader } from '../components/layout'
import { visitasService, compromisosService } from '../services'
import { formatDate, formatDateShort } from '../utils/formatters'

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
  }
  
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="text-2xl font-heading font-bold text-dark">{value}</p>
      </div>
    </Card>
  )
}

function VisitaCard({ visita }) {
  // Contar compromisos por estado
  const pendientes = visita.compromisos?.filter(c => c.estado === 'pendiente').length || 0
  const enProgreso = visita.compromisos?.filter(c => c.estado === 'en_progreso').length || 0
  const completados = visita.compromisos?.filter(c => c.estado === 'completado').length || 0
  
  return (
    <Link to={`/visitas/${visita.id}`}>
      <Card className="group cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-primary truncate">
              {visita.cliente?.nombre_empresa || 'Cliente'}
            </p>
            <p className="text-sm text-muted mt-1">
              {formatDate(visita.fecha_visita)}
            </p>
            
            {/* Visitante asignado */}
            {visita.visitante && (
              <p className="text-xs text-muted mt-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                {visita.visitante.nombre}
              </p>
            )}
            
            {/* Estados de compromisos con etiquetas */}
            {visita.compromisos?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {pendientes > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-dark/5 rounded-full text-xs">
                    <span className="w-2 h-2 rounded-full bg-dark/30" />
                    <span className="text-muted">{pendientes} pendiente{pendientes !== 1 ? 's' : ''}</span>
                  </span>
                )}
                {enProgreso > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-primary/80">{enProgreso} en progreso</span>
                  </span>
                )}
                {completados > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 rounded-full text-xs">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-accent/80">{completados} completado{completados !== 1 ? 's' : ''}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
        </div>
      </Card>
    </Link>
  )
}

function CompromisoUrgente({ compromiso }) {
  // Normalizar ambas fechas a mediodía para comparación correcta
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  
  const fechaEntrega = compromiso.fecha_entrega 
    ? new Date(compromiso.fecha_entrega + 'T12:00:00') 
    : null
  
  // Calcular diferencia en días (redondeando)
  const diffDays = fechaEntrega 
    ? Math.round((fechaEntrega - today) / (1000 * 60 * 60 * 24))
    : null
  
  let urgencyLabel = ''
  let urgencyColor = ''
  
  if (diffDays !== null && diffDays < 0) {
    urgencyLabel = 'Vencido'
    urgencyColor = 'bg-red-100 text-red-700 border-red-200'
  } else if (diffDays === 0) {
    urgencyLabel = 'Hoy'
    urgencyColor = 'bg-accent/10 text-accent border-accent/20'
  } else if (diffDays === 1) {
    urgencyLabel = 'Mañana'
    urgencyColor = 'bg-amber-50 text-amber-700 border-amber-200'
  } else if (diffDays !== null && diffDays <= 7) {
    urgencyLabel = `En ${diffDays} días`
    urgencyColor = 'bg-primary/10 text-primary border-primary/20'
  }
  
  const isOverdue = diffDays !== null && diffDays < 0
  
  return (
    <Link to={`/visitas/${compromiso.id_visita}`}>
      <div className={`
        p-4 rounded-xl border transition-all cursor-pointer
        hover:shadow-md hover:-translate-y-0.5
        ${urgencyColor}
      `}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isOverdue && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              <p className="font-medium truncate">{compromiso.titulo}</p>
            </div>
            
            {compromiso.visita?.cliente?.nombre_empresa && (
              <p className="text-sm opacity-80 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {compromiso.visita.cliente.nombre_empresa}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/50">
              {urgencyLabel}
            </span>
            <span className="text-xs opacity-70 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateShort(compromiso.fecha_entrega)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [visitas, setVisitas] = useState([])
  const [compromisosProximos, setCompromisosProximos] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [statsData, visitasData, compromisosData] = await Promise.all([
        compromisosService.getStats(),
        visitasService.getRecientes(5),
        compromisosService.getAll()
      ])
      setStats(statsData)
      setVisitas(visitasData)
      
      // Filtrar compromisos próximos (vencidos, hoy, o próximos 7 días)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const sevenDaysFromNow = new Date(today)
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      
      const proximos = compromisosData
        .filter(c => {
          if (c.estado === 'completado') return false
          if (!c.fecha_entrega) return false
          
          const fecha = new Date(c.fecha_entrega + 'T12:00:00')
          return fecha <= sevenDaysFromNow
        })
        .sort((a, b) => {
          const fechaA = new Date(a.fecha_entrega)
          const fechaB = new Date(b.fecha_entrega)
          return fechaA - fechaB
        })
        .slice(0, 5)
      
      setCompromisosProximos(proximos)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <PageLoader />
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Resumen de visitas y compromisos"
        actions={
          <Link to="/visitas/nueva">
            <Button icon={Plus}>Nueva Visita</Button>
          </Link>
        }
      />
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Compromisos"
          value={stats?.total || 0}
          icon={ClipboardList}
          color="primary"
        />
        <StatCard
          title="Pendientes"
          value={stats?.pendientes || 0}
          icon={Clock}
          color="accent"
        />
        <StatCard
          title="En Progreso"
          value={stats?.en_progreso || 0}
          icon={RefreshCw}
          color="blue"
        />
        <StatCard
          title="Completados"
          value={stats?.completados || 0}
          icon={CheckCircle}
          color="green"
        />
      </div>
      
      {/* Grid de dos columnas en desktop */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Compromisos Próximos */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              Compromisos Próximos
            </h2>
            <Link to="/compromisos" className="text-accent hover:underline text-sm font-medium">
              Ver todos
            </Link>
          </div>
          
          <div className="space-y-3">
            {compromisosProximos.length === 0 ? (
              <Card className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-muted">Sin compromisos urgentes</p>
                <p className="text-sm text-muted/70 mt-1">
                  Todos los compromisos están al día
                </p>
              </Card>
            ) : (
              compromisosProximos.map((compromiso) => (
                <CompromisoUrgente key={compromiso.id} compromiso={compromiso} />
              ))
            )}
          </div>
        </div>
        
        {/* Visitas Recientes */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-primary">
              Visitas Recientes
            </h2>
            <Link to="/visitas" className="text-accent hover:underline text-sm font-medium">
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-3">
            {visitas.length === 0 ? (
              <Card className="text-center py-8">
                <ClipboardList className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-muted">No hay visitas registradas</p>
                <Link to="/visitas/nueva" className="mt-3 inline-block">
                  <Button variant="outline" size="sm" icon={Plus}>
                    Registrar primera visita
                  </Button>
                </Link>
              </Card>
            ) : (
              visitas.map((visita) => (
                <VisitaCard key={visita.id} visita={visita} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
