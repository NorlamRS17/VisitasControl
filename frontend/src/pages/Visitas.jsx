/**
 * Página de listado de visitas.
 * Muestra todas las visitas con filtros por texto y fecha.
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ClipboardList, ChevronRight, Calendar, X, Filter } from 'lucide-react'
import { Card, Badge, Button, PageLoader } from '../components/ui'
import { PageHeader } from '../components/layout'
import { visitasService } from '../services'
import { formatDate } from '../utils/formatters'

export default function Visitas() {
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filtros de fecha
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [filtroActivo, setFiltroActivo] = useState('todos') // 'todos', 'hoy', 'semana', 'mes', 'personalizado'
  
  // Cargar visitas cuando cambian los filtros de fecha
  useEffect(() => {
    loadVisitas()
  }, [fechaDesde, fechaHasta])
  
  const loadVisitas = async () => {
    setLoading(true)
    try {
      const params = {}
      if (fechaDesde) params.fecha_desde = fechaDesde
      if (fechaHasta) params.fecha_hasta = fechaHasta
      
      const data = await visitasService.getAll(params)
      setVisitas(data)
    } catch (error) {
      console.error('Error cargando visitas:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Funciones para filtros rápidos de fecha
  const aplicarFiltroRapido = (tipo) => {
    const hoy = new Date()
    let desde = ''
    let hasta = ''
    
    switch (tipo) {
      case 'hoy':
        desde = hoy.toISOString().split('T')[0]
        hasta = desde
        break
      case 'semana':
        const inicioSemana = new Date(hoy)
        inicioSemana.setDate(hoy.getDate() - hoy.getDay())
        desde = inicioSemana.toISOString().split('T')[0]
        hasta = hoy.toISOString().split('T')[0]
        break
      case 'mes':
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
        hasta = hoy.toISOString().split('T')[0]
        break
      case 'todos':
      default:
        desde = ''
        hasta = ''
        break
    }
    
    setFiltroActivo(tipo)
    setFechaDesde(desde)
    setFechaHasta(hasta)
  }
  
  const limpiarFiltros = () => {
    setFechaDesde('')
    setFechaHasta('')
    setFiltroActivo('todos')
    setSearchTerm('')
  }
  
  // Filtrar por texto (cliente/observaciones) en el frontend
  const filteredVisitas = visitas.filter((visita) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      visita.cliente?.nombre_empresa?.toLowerCase().includes(search) ||
      visita.observaciones?.toLowerCase().includes(search)
    )
  })
  
  const hayFiltrosActivos = fechaDesde || fechaHasta || searchTerm
  
  if (loading && visitas.length === 0) return <PageLoader />
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Visitas"
        description="Historial de visitas realizadas"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Visitas' }
        ]}
        actions={
          <Link to="/visitas/nueva">
            <Button icon={Plus}>Nueva Visita</Button>
          </Link>
        }
      />
      
      {/* Filtros */}
      <div className="mb-6 space-y-4">
        {/* Filtros rápidos de fecha */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <span className="text-sm text-muted mr-2">Filtrar por:</span>
          
          {['todos', 'hoy', 'semana', 'mes'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => aplicarFiltroRapido(tipo)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                ${filtroActivo === tipo 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-dark hover:bg-gray-200'
                }`}
            >
              {tipo === 'todos' ? 'Todas' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
          
          <span className="text-muted mx-2">|</span>
          
          {/* Fechas personalizadas */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value)
                  setFiltroActivo('personalizado')
                }}
                className="pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Desde"
              />
            </div>
            <span className="text-muted">—</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value)
                  setFiltroActivo('personalizado')
                }}
                className="pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Hasta"
              />
            </div>
          </div>
          
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
        
        {/* Búsqueda por texto */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Buscar por cliente o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10
                       transition-all duration-200"
          />
        </div>
        
        {/* Contador de resultados */}
        <p className="text-sm text-muted">
          {loading ? 'Cargando...' : `${filteredVisitas.length} visita${filteredVisitas.length !== 1 ? 's' : ''} encontrada${filteredVisitas.length !== 1 ? 's' : ''}`}
          {hayFiltrosActivos && ' con los filtros aplicados'}
        </p>
      </div>
      
      {/* Lista */}
      <div className="grid gap-4">
        {filteredVisitas.length === 0 ? (
          <Card className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchTerm ? 'No se encontraron resultados' : 'No hay visitas registradas'}
            </p>
          </Card>
        ) : (
          filteredVisitas.map((visita) => (
            <Link key={visita.id} to={`/visitas/${visita.id}`}>
              <Card className="group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-heading font-semibold text-primary truncate">
                        {visita.cliente?.nombre_empresa || 'Cliente'}
                      </p>
                      {visita.compromisos?.length > 0 && (
                        <div className="flex items-center gap-3">
                          {/* Conteo por estado con etiquetas */}
                          <div className="hidden sm:flex items-center gap-3 text-xs">
                            {(() => {
                              const pendientes = visita.compromisos.filter(c => c.estado === 'pendiente').length
                              const enProgreso = visita.compromisos.filter(c => c.estado === 'en_progreso').length
                              const completados = visita.compromisos.filter(c => c.estado === 'completado').length
                              return (
                                <>
                                  {pendientes > 0 && (
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-dark/5 rounded-full">
                                      <span className="w-2 h-2 rounded-full bg-dark/30" />
                                      <span className="text-muted">{pendientes} pendiente{pendientes !== 1 ? 's' : ''}</span>
                                    </span>
                                  )}
                                  {enProgreso > 0 && (
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
                                      <span className="w-2 h-2 rounded-full bg-primary" />
                                      <span className="text-primary/80">{enProgreso} en progreso</span>
                                    </span>
                                  )}
                                  {completados > 0 && (
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 rounded-full">
                                      <span className="w-2 h-2 rounded-full bg-accent" />
                                      <span className="text-accent/80">{completados} completado{completados !== 1 ? 's' : ''}</span>
                                    </span>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                          {/* En móvil solo mostrar el total */}
                          <div className="sm:hidden">
                            <Badge variant="primary" showIcon={false}>
                              {visita.compromisos.length} compromiso{visita.compromisos.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      {formatDate(visita.fecha_visita)} · {visita.visitante?.nombre || 'Usuario'}
                    </p>
                    {visita.observaciones && (
                      <p className="text-sm text-dark/70 mt-2 line-clamp-1">
                        {visita.observaciones}
                      </p>
                    )}
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors ml-4" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
