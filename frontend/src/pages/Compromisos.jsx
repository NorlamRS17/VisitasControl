/**
 * Página de gestión de compromisos con tablero Kanban.
 * Muestra todos los compromisos de todas las visitas.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RefreshCw,
  Columns3,
  List,
  Filter,
  Building2,
  Calendar,
  ExternalLink
} from 'lucide-react'
import {
  Card,
  Badge,
  Button,
  PageLoader
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { KanbanBoard } from '../components/kanban'
import { compromisosService } from '../services'
import { formatDateShort } from '../utils/formatters'

export default function Compromisos() {
  const navigate = useNavigate()
  const [compromisos, setCompromisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [viewMode, setViewMode] = useState('kanban')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  
  useEffect(() => {
    loadCompromisos()
  }, [])
  
  const loadCompromisos = async () => {
    try {
      setLoading(true)
      const data = await compromisosService.getAll()
      setCompromisos(data)
    } catch (error) {
      console.error('Error cargando compromisos:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdateEstado = async (compromisoId, nuevoEstado) => {
    try {
      setUpdating(true)
      await compromisosService.updateEstado(compromisoId, nuevoEstado)
      
      setCompromisos(prev =>
        prev.map(c =>
          c.id === compromisoId ? { ...c, estado: nuevoEstado } : c
        )
      )
    } catch (error) {
      console.error('Error actualizando estado:', error)
      loadCompromisos()
    } finally {
      setUpdating(false)
    }
  }
  
  const getStats = () => {
    return {
      total: compromisos.length,
      pendientes: compromisos.filter(c => c.estado === 'pendiente').length,
      enProgreso: compromisos.filter(c => c.estado === 'en_progreso').length,
      completados: compromisos.filter(c => c.estado === 'completado').length,
    }
  }
  
  const getCompromisosFiltrados = () => {
    if (filtroEstado === 'todos') return compromisos
    return compromisos.filter(c => c.estado === filtroEstado)
  }
  
  const stats = getStats()
  const compromisosFiltrados = getCompromisosFiltrados()
  
  if (loading) return <PageLoader />
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Compromisos"
        description="Gestión visual de todos los compromisos"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Compromisos' }
        ]}
        actions={
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={loadCompromisos}
            className={updating ? 'animate-spin' : ''}
          >
            Actualizar
          </Button>
        }
      />
      
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="!p-4">
          <p className="text-sm text-muted">Total</p>
          <p className="text-2xl font-heading font-bold text-dark">{stats.total}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-dark/20">
          <p className="text-sm text-muted">Pendientes</p>
          <p className="text-2xl font-heading font-bold text-dark">{stats.pendientes}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-primary">
          <p className="text-sm text-muted">En Progreso</p>
          <p className="text-2xl font-heading font-bold text-primary">{stats.enProgreso}</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-accent">
          <p className="text-sm text-muted">Completados</p>
          <p className="text-2xl font-heading font-bold text-accent">{stats.completados}</p>
        </Card>
      </div>
      
      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Filtros rápidos */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-lg border border-primary/10">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'pendiente', label: 'Pendientes' },
              { id: 'en_progreso', label: 'En Progreso' },
              { id: 'completado', label: 'Completados' },
            ].map((filtro) => (
              <button
                key={filtro.id}
                onClick={() => setFiltroEstado(filtro.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filtroEstado === filtro.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Toggle vista */}
        <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-lg border border-primary/10">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'kanban' ? 'bg-white text-primary shadow-sm' : 'text-muted'
            }`}
            title="Vista Kanban"
          >
            <Columns3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted'
            }`}
            title="Vista Lista"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Indicador de actualización */}
      {updating && (
        <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          <span className="text-sm">Actualizando...</span>
        </div>
      )}
      
      {/* Contenido */}
      {compromisos.length === 0 ? (
        <Card className="text-center py-12">
          <Columns3 className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted mb-2">No hay compromisos registrados</p>
          <p className="text-sm text-muted">
            Los compromisos se crean desde el detalle de cada visita
          </p>
        </Card>
      ) : viewMode === 'kanban' ? (
        <>
          <KanbanBoard
            compromisos={compromisosFiltrados}
            onUpdateEstado={handleUpdateEstado}
            loading={loading}
          />
          <p className="mt-4 text-center text-sm text-muted">
            Arrastra las tarjetas entre columnas para cambiar su estado
          </p>
        </>
      ) : (
        <div className="space-y-3">
          {compromisosFiltrados.map((compromiso) => (
            <Card key={compromiso.id} className="group hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-dark">{compromiso.titulo}</h4>
                    <Badge variant={compromiso.estado}>
                      {compromiso.estado.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {compromiso.descripcion && (
                    <p className="text-sm text-muted mb-2">{compromiso.descripcion}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    {compromiso.visita?.cliente?.nombre_empresa && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {compromiso.visita.cliente.nombre_empresa}
                      </span>
                    )}
                    {compromiso.fecha_entrega && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Entrega: {formatDateShort(compromiso.fecha_entrega)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Botones de cambio de estado */}
                  {compromiso.estado !== 'completado' && (
                    <button
                      onClick={() => handleUpdateEstado(
                        compromiso.id,
                        compromiso.estado === 'pendiente' ? 'en_progreso' : 'completado'
                      )}
                      className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary 
                                 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      {compromiso.estado === 'pendiente' ? 'Iniciar' : 'Completar'}
                    </button>
                  )}
                  
                  {/* Link a la visita */}
                  {compromiso.id_visita && (
                    <button
                      onClick={() => navigate(`/visitas/${compromiso.id_visita}`)}
                      className="p-1.5 text-muted hover:text-primary transition-colors"
                      title="Ver visita"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
