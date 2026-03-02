/**
 * Página de detalle de una visita.
 * Muestra información y permite gestionar compromisos con Kanban.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  User,
  Building2,
  Plus,
  Columns3,
  List
} from 'lucide-react'
import {
  Card,
  Badge,
  Button,
  Modal,
  Input,
  PageLoader
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { KanbanBoard } from '../components/kanban'
import { visitasService, compromisosService } from '../services'
import { formatDate, formatDateShort } from '../utils/formatters'

export default function DetalleVisita() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [visita, setVisita] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'list'
  const [showAddModal, setShowAddModal] = useState(false)
  const [nuevoCompromiso, setNuevoCompromiso] = useState({
    titulo: '',
    descripcion: '',
    fecha_entrega: ''
  })
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    loadVisita()
  }, [id])
  
  const loadVisita = async () => {
    try {
      const data = await visitasService.getById(id)
      setVisita(data)
    } catch (error) {
      console.error('Error cargando visita:', error)
      navigate('/visitas')
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdateEstado = async (compromisoId, nuevoEstado) => {
    try {
      setUpdating(true)
      await compromisosService.updateEstado(compromisoId, nuevoEstado)
      
      // Actualizar localmente para respuesta inmediata
      setVisita(prev => ({
        ...prev,
        compromisos: prev.compromisos.map(c => 
          c.id === compromisoId ? { ...c, estado: nuevoEstado } : c
        )
      }))
    } catch (error) {
      console.error('Error actualizando estado:', error)
      loadVisita()
    } finally {
      setUpdating(false)
    }
  }
  
  const handleAddCompromiso = async (e) => {
    e.preventDefault()
    if (!nuevoCompromiso.titulo.trim()) return
    
    setSaving(true)
    try {
      await compromisosService.create({
        id_visita: parseInt(id),
        titulo: nuevoCompromiso.titulo,
        descripcion: nuevoCompromiso.descripcion || null,
        fecha_entrega: nuevoCompromiso.fecha_entrega,  // Obligatorio
      })
      setShowAddModal(false)
      setNuevoCompromiso({ titulo: '', descripcion: '', fecha_entrega: '' })
      loadVisita()
    } catch (error) {
      console.error('Error creando compromiso:', error)
    } finally {
      setSaving(false)
    }
  }
  
  const handleDeleteCompromiso = async (compromisoId) => {
    if (!confirm('¿Eliminar este compromiso?')) return
    
    try {
      await compromisosService.delete(compromisoId)
      loadVisita()
    } catch (error) {
      console.error('Error eliminando compromiso:', error)
    }
  }
  
  // Obtener stats de compromisos
  const getStats = () => {
    if (!visita?.compromisos) return { pendientes: 0, enProgreso: 0, completados: 0 }
    return {
      pendientes: visita.compromisos.filter(c => c.estado === 'pendiente').length,
      enProgreso: visita.compromisos.filter(c => c.estado === 'en_progreso').length,
      completados: visita.compromisos.filter(c => c.estado === 'completado').length,
    }
  }
  
  const stats = getStats()
  
  if (loading) return <PageLoader />
  if (!visita) return null
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title={visita.cliente?.nombre_empresa || 'Visita'}
        description={`Visita del ${formatDate(visita.fecha_visita)}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Visitas', href: '/visitas' },
          { label: 'Detalle' }
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)} icon={ArrowLeft}>
            Volver
          </Button>
        }
      />
      
      {/* Info de la visita - horizontal compacta */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted" />
            <span className="text-muted">Cliente:</span>
            <span className="font-medium">{visita.cliente?.nombre_empresa}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted" />
            <span className="text-muted">Visitante:</span>
            <span className="font-medium">{visita.visitante?.nombre}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted" />
            <span className="text-muted">Fecha:</span>
            <span className="font-medium">{formatDate(visita.fecha_visita)}</span>
          </div>
          {visita.observaciones && (
            <div className="w-full pt-3 mt-3 border-t border-primary/10">
              <span className="text-muted">Observaciones: </span>
              <span className="text-dark/80">{visita.observaciones}</span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Header de compromisos con stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-heading font-semibold text-primary">
            Compromisos ({visita.compromisos?.length || 0})
          </h3>
          
          {/* Mini stats */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-dark/30" />
              <span className="text-muted">{stats.pendientes} pendientes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted">{stats.enProgreso} en progreso</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-muted">{stats.completados} completados</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
          
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Agregar
          </Button>
        </div>
      </div>
      
      {/* Indicador de actualización */}
      {updating && (
        <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          <span className="text-sm">Actualizando...</span>
        </div>
      )}
      
      {/* Contenido: Kanban o Lista */}
      {visita.compromisos?.length === 0 ? (
        <Card className="text-center py-12">
          <Columns3 className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted mb-3">No hay compromisos en esta visita</p>
          <Button
            variant="outline"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Agregar primer compromiso
          </Button>
        </Card>
      ) : viewMode === 'kanban' ? (
        <>
          <KanbanBoard
            compromisos={visita.compromisos || []}
            onUpdateEstado={handleUpdateEstado}
            loading={loading}
          />
          <p className="mt-4 text-center text-sm text-muted">
            💡 Arrastra las tarjetas entre columnas para cambiar su estado
          </p>
        </>
      ) : (
        <div className="space-y-3">
          {visita.compromisos.map((compromiso) => (
            <Card key={compromiso.id} className="group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-dark">{compromiso.titulo}</h4>
                    <Badge variant={compromiso.estado}>
                      {compromiso.estado.replace('_', ' ')}
                    </Badge>
                  </div>
                  {compromiso.descripcion && (
                    <p className="text-sm text-muted">{compromiso.descripcion}</p>
                  )}
                  {compromiso.fecha_entrega && (
                    <p className="text-xs text-muted mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Entrega: {formatDateShort(compromiso.fecha_entrega)}
                    </p>
                  )}
                </div>
                
                {/* Botones de cambio de estado */}
                <div className="flex items-center gap-1 ml-4">
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal para agregar compromiso */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nuevo Compromiso"
      >
        <form onSubmit={handleAddCompromiso} className="space-y-4">
          <Input
            label="Título"
            value={nuevoCompromiso.titulo}
            onChange={(e) => setNuevoCompromiso({ ...nuevoCompromiso, titulo: e.target.value })}
            required
          />
          
          <Input
            label="Descripción (opcional)"
            value={nuevoCompromiso.descripcion}
            onChange={(e) => setNuevoCompromiso({ ...nuevoCompromiso, descripcion: e.target.value })}
          />
          
          <Input
            label="Fecha de entrega"
            type="date"
            value={nuevoCompromiso.fecha_entrega}
            onChange={(e) => setNuevoCompromiso({ ...nuevoCompromiso, fecha_entrega: e.target.value })}
            required
          />
          
          <Modal.Footer>
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}
