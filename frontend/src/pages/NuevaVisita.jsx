/**
 * Página para crear una nueva visita.
 * Permite agregar múltiples compromisos dinámicamente.
 * Soporta selección de fecha y asignación de visitante (admin).
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, Calendar, User } from 'lucide-react'
import {
  Card,
  Button,
  Input,
  TextArea,
  SearchableSelect,
  Badge
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { visitasService, clientesService, usuariosService } from '../services'
import { useAuth } from '../hooks/useAuth'

export default function NuevaVisita() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'
  
  const [clientes, setClientes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  
  // Fecha actual formateada para el input date
  const today = new Date().toISOString().split('T')[0]
  
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_visitante: '',
    fecha_visita: today,
    observaciones: '',
  })
  
  const [compromisos, setCompromisos] = useState([])
  
  useEffect(() => {
    loadClientes()
    if (isAdmin) {
      loadUsuarios()
    } else {
      setLoadingUsuarios(false)
    }
  }, [isAdmin])
  
  const loadClientes = async () => {
    try {
      const data = await clientesService.getAll()
      setClientes(data)
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setLoadingClientes(false)
    }
  }
  
  const loadUsuarios = async () => {
    try {
      const data = await usuariosService.getAll()
      setUsuarios(data)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoadingUsuarios(false)
    }
  }
  
  const addCompromiso = () => {
    setCompromisos([
      ...compromisos,
      { titulo: '', descripcion: '', fecha_entrega: '' }
    ])
  }
  
  const removeCompromiso = (index) => {
    setCompromisos(compromisos.filter((_, i) => i !== index))
  }
  
  const updateCompromiso = (index, field, value) => {
    const updated = [...compromisos]
    updated[index][field] = value
    setCompromisos(updated)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.id_cliente) {
      alert('Por favor selecciona un cliente')
      return
    }
    
    setLoading(true)
    
    try {
      const payload = {
        id_cliente: parseInt(formData.id_cliente),
        fecha_visita: formData.fecha_visita ? `${formData.fecha_visita}T12:00:00` : null,
        id_visitante: formData.id_visitante ? parseInt(formData.id_visitante) : null,
        observaciones: formData.observaciones,
        compromisos: compromisos
          .filter(c => c.titulo.trim())
          .map(c => ({
            titulo: c.titulo,
            descripcion: c.descripcion || null,
            fecha_entrega: c.fecha_entrega,
          }))
      }
      
      const visita = await visitasService.create(payload)
      navigate(`/visitas/${visita.id}`)
    } catch (error) {
      console.error('Error creando visita:', error)
      alert('Error al crear la visita')
    } finally {
      setLoading(false)
    }
  }
  
  const clienteOptions = clientes.map(c => ({
    value: c.id.toString(),
    label: c.nombre_empresa
  }))
  
  const usuarioOptions = usuarios.map(u => ({
    value: u.id.toString(),
    label: `${u.nombre} (${u.rol})`
  }))
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Nueva Visita"
        description="Registra una visita y sus compromisos"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Visitas', href: '/visitas' },
          { label: 'Nueva Visita' }
        ]}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Datos de la visita */}
        <Card>
          <h3 className="text-lg font-heading font-semibold text-primary mb-4">
            Datos de la Visita
          </h3>
          
          <div className="space-y-4">
            <SearchableSelect
              label="Cliente"
              value={formData.id_cliente}
              onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
              options={clienteOptions}
              placeholder={loadingClientes ? 'Cargando clientes...' : 'Buscar cliente...'}
              required
              disabled={loadingClientes}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fecha de la visita"
                type="date"
                value={formData.fecha_visita}
                onChange={(e) => setFormData({ ...formData, fecha_visita: e.target.value })}
                required
              />
              
              {isAdmin && (
                <SearchableSelect
                  label="Asignar visitante"
                  value={formData.id_visitante}
                  onChange={(e) => setFormData({ ...formData, id_visitante: e.target.value })}
                  options={usuarioOptions}
                  placeholder={loadingUsuarios ? 'Cargando...' : 'Buscar visitante...'}
                  disabled={loadingUsuarios}
                />
              )}
            </div>
            
            <TextArea
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={4}
              placeholder="Notas sobre la visita..."
            />
          </div>
        </Card>
        
        {/* Compromisos */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold text-primary">
              Compromisos
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={addCompromiso}
            >
              Agregar
            </Button>
          </div>
          
          {compromisos.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-muted mb-3">No hay compromisos agregados</p>
              <Button
                type="button"
                variant="ghost"
                icon={Plus}
                onClick={addCompromiso}
              >
                Agregar compromiso
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {compromisos.map((compromiso, index) => (
                <div
                  key={index}
                  className="p-4 bg-bg rounded-xl border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="primary" showIcon={false}>
                      Compromiso {index + 1}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => removeCompromiso(index)}
                      className="p-1 text-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid gap-3">
                    <Input
                      label="Título del compromiso"
                      value={compromiso.titulo}
                      onChange={(e) => updateCompromiso(index, 'titulo', e.target.value)}
                      required
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Descripción (opcional)"
                        value={compromiso.descripcion}
                        onChange={(e) => updateCompromiso(index, 'descripcion', e.target.value)}
                      />
                      
                      <Input
                        label="Fecha de entrega"
                        type="date"
                        value={compromiso.fecha_entrega}
                        onChange={(e) => updateCompromiso(index, 'fecha_entrega', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        {/* Acciones */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            icon={Save}
            loading={loading}
          >
            Guardar Visita
          </Button>
        </div>
      </form>
    </div>
  )
}
