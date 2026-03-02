/**
 * Página de Notificaciones a Clientes (Mockup).
 * Permite configurar envío de mensajes por teléfono/WhatsApp.
 * Solo visible para administradores.
 * NOTA: Funcionalidad de envío pendiente de implementar.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone,
  MessageSquare,
  Calendar,
  Users,
  Send,
  Eye,
  Clock,
  CheckSquare,
  Square,
  AlertCircle,
  Building2
} from 'lucide-react'
import {
  Card,
  Button,
  Input,
  TextArea,
  Select,
  PageLoader
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { clientesService, visitasService } from '../services'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/formatters'

export default function Notificaciones() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState([])
  const [visitasProgramadas, setVisitasProgramadas] = useState([])
  const [selectedClientes, setSelectedClientes] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const [config, setConfig] = useState({
    fechaDesde: '',
    fechaHasta: '',
    frecuencia: 'unica',
    anticipacion: '1',
    mensaje: `Estimado cliente,

Le recordamos que tiene una visita programada para el {fecha_visita}.

Nuestro representante {visitante} le contactará en el horario acordado.

Saludos cordiales,
Equipo Aglomerados Cotopaxi`
  })
  
  useEffect(() => {
    if (user?.rol !== 'admin') {
      navigate('/')
      return
    }
    loadData()
  }, [user, navigate])
  
  const loadData = async () => {
    try {
      const [clientesData, visitasData] = await Promise.all([
        clientesService.getAll(),
        visitasService.getAll()
      ])
      setClientes(clientesData)
      setVisitasProgramadas(visitasData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Filtrar clientes con visitas en el rango de fechas
  const clientesFiltrados = clientes.filter(cliente => {
    if (!config.fechaDesde && !config.fechaHasta) return true
    
    const visitasCliente = visitasProgramadas.filter(v => v.id_cliente === cliente.id)
    
    return visitasCliente.some(visita => {
      const fechaVisita = new Date(visita.fecha_visita)
      const desde = config.fechaDesde ? new Date(config.fechaDesde) : null
      const hasta = config.fechaHasta ? new Date(config.fechaHasta) : null
      
      if (desde && hasta) {
        return fechaVisita >= desde && fechaVisita <= hasta
      } else if (desde) {
        return fechaVisita >= desde
      } else if (hasta) {
        return fechaVisita <= hasta
      }
      return true
    })
  })
  
  const toggleCliente = (clienteId) => {
    setSelectedClientes(prev => 
      prev.includes(clienteId)
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId]
    )
  }
  
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedClientes([])
    } else {
      setSelectedClientes(clientesFiltrados.map(c => c.id))
    }
    setSelectAll(!selectAll)
  }
  
  const handleEnviar = () => {
    alert('🚧 Funcionalidad próximamente\n\nEl envío de mensajes por teléfono/WhatsApp estará disponible en una futura actualización.')
  }
  
  const handleProgramar = () => {
    alert('🚧 Funcionalidad próximamente\n\nLa programación de envíos automáticos estará disponible en una futura actualización.')
  }
  
  if (loading) return <PageLoader />
  
  if (user?.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="text-center py-12 px-8">
          <AlertCircle className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-primary mb-2">
            Acceso restringido
          </h2>
          <p className="text-muted">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notificaciones"
        description="Envía mensajes a clientes sobre visitas programadas"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Notificaciones' }
        ]}
      />
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Configuración */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuración de fechas */}
          <Card>
            <h3 className="text-lg font-heading font-semibold text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Rango de Visitas
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Desde"
                type="date"
                value={config.fechaDesde}
                onChange={(e) => setConfig({ ...config, fechaDesde: e.target.value })}
              />
              <Input
                label="Hasta"
                type="date"
                value={config.fechaHasta}
                onChange={(e) => setConfig({ ...config, fechaHasta: e.target.value })}
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Select
                label="Frecuencia de envío"
                value={config.frecuencia}
                onChange={(e) => setConfig({ ...config, frecuencia: e.target.value })}
              >
                <option value="unica">Envío único</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="antes_visita">Antes de cada visita</option>
              </Select>
              
              <Select
                label="Anticipación"
                value={config.anticipacion}
                onChange={(e) => setConfig({ ...config, anticipacion: e.target.value })}
              >
                <option value="0">El mismo día</option>
                <option value="1">1 día antes</option>
                <option value="2">2 días antes</option>
                <option value="3">3 días antes</option>
                <option value="7">1 semana antes</option>
              </Select>
            </div>
          </Card>
          
          {/* Plantilla del mensaje */}
          <Card>
            <h3 className="text-lg font-heading font-semibold text-primary mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Plantilla del Mensaje
            </h3>
            
            <TextArea
              label="Mensaje"
              value={config.mensaje}
              onChange={(e) => setConfig({ ...config, mensaje: e.target.value })}
              rows={8}
              placeholder="Escribe el mensaje..."
            />
            
            <div className="mt-3 p-3 bg-primary/5 rounded-lg">
              <p className="text-xs text-primary font-medium mb-2">Variables disponibles:</p>
              <div className="flex flex-wrap gap-2">
                <code className="px-2 py-1 bg-white rounded text-xs text-primary">{'{cliente}'}</code>
                <code className="px-2 py-1 bg-white rounded text-xs text-primary">{'{fecha_visita}'}</code>
                <code className="px-2 py-1 bg-white rounded text-xs text-primary">{'{visitante}'}</code>
                <code className="px-2 py-1 bg-white rounded text-xs text-primary">{'{empresa}'}</code>
              </div>
            </div>
          </Card>
          
          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              icon={Eye}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Ocultar' : 'Vista'} Previa
            </Button>
            <Button
              variant="outline"
              icon={Clock}
              onClick={handleProgramar}
            >
              Programar Envío
            </Button>
            <Button
              icon={Send}
              onClick={handleEnviar}
              disabled={selectedClientes.length === 0}
            >
              Enviar Ahora ({selectedClientes.length})
            </Button>
          </div>
          
          {/* Vista previa */}
          {showPreview && (
            <Card className="bg-green-50 border-green-200">
              <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Vista previa del mensaje (WhatsApp)
              </h4>
              <div className="bg-white rounded-xl p-4 shadow-sm max-w-sm">
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {config.mensaje
                    .replace('{cliente}', 'Juan Pérez')
                    .replace('{fecha_visita}', '15 de marzo de 2026')
                    .replace('{visitante}', 'Carlos García')
                    .replace('{empresa}', 'Empresa ABC')}
                </p>
              </div>
            </Card>
          )}
        </div>
        
        {/* Columna derecha: Lista de destinatarios */}
        <div>
          <Card className="sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Destinatarios
              </h3>
              <span className="text-sm text-muted">
                {selectedClientes.length} de {clientesFiltrados.length}
              </span>
            </div>
            
            {/* Seleccionar todos */}
            <button
              onClick={toggleSelectAll}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors mb-3"
            >
              {selectAll ? (
                <CheckSquare className="w-5 h-5 text-primary" />
              ) : (
                <Square className="w-5 h-5 text-muted" />
              )}
              <span className="font-medium text-primary">Seleccionar todos</span>
            </button>
            
            {/* Lista de clientes */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {clientesFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="text-muted text-sm">
                    No hay clientes con visitas en el rango seleccionado
                  </p>
                </div>
              ) : (
                clientesFiltrados.map(cliente => {
                  const isSelected = selectedClientes.includes(cliente.id)
                  const tieneNumero = Boolean(cliente.telefono)
                  
                  return (
                    <button
                      key={cliente.id}
                      onClick={() => toggleCliente(cliente.id)}
                      disabled={!tieneNumero}
                      className={`
                        w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors
                        ${isSelected ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50 hover:bg-gray-100'}
                        ${!tieneNumero ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark truncate flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          {cliente.nombre_empresa}
                        </p>
                        
                        {cliente.telefono ? (
                          <p className="text-sm text-muted flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {cliente.telefono}
                          </p>
                        ) : (
                          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            Sin teléfono registrado
                          </p>
                        )}
                        
                        {cliente.contacto && (
                          <p className="text-xs text-muted mt-1">
                            Contacto: {cliente.contacto}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
            
            {/* Resumen */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted">Con teléfono:</div>
                <div className="text-right font-medium text-primary">
                  {clientesFiltrados.filter(c => c.telefono).length}
                </div>
                <div className="text-muted">Sin teléfono:</div>
                <div className="text-right font-medium text-red-500">
                  {clientesFiltrados.filter(c => !c.telefono).length}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
