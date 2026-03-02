/**
 * Página de gestión de clientes.
 * CRUD completo con modal de creación/edición.
 */
import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Phone,
  User
} from 'lucide-react'
import {
  Card,
  Button,
  Input,
  Modal,
  PageLoader
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { clientesService } from '../services'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    contacto: '',
    telefono: '',
    direccion: ''
  })
  
  useEffect(() => {
    loadClientes()
  }, [])
  
  const loadClientes = async () => {
    try {
      const data = await clientesService.getAll()
      setClientes(data)
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const openCreateModal = () => {
    setEditingCliente(null)
    setFormData({
      nombre_empresa: '',
      contacto: '',
      telefono: '',
      direccion: ''
    })
    setShowModal(true)
  }
  
  const openEditModal = (cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nombre_empresa: cliente.nombre_empresa,
      contacto: cliente.contacto || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || ''
    })
    setShowModal(true)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre_empresa.trim()) return
    
    setSaving(true)
    try {
      if (editingCliente) {
        await clientesService.update(editingCliente.id, formData)
      } else {
        await clientesService.create(formData)
      }
      setShowModal(false)
      loadClientes()
    } catch (error) {
      console.error('Error guardando cliente:', error)
    } finally {
      setSaving(false)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    
    try {
      await clientesService.delete(id)
      loadClientes()
    } catch (error) {
      console.error('Error eliminando cliente:', error)
    }
  }
  
  const filteredClientes = clientes.filter((cliente) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      cliente.nombre_empresa.toLowerCase().includes(search) ||
      cliente.contacto?.toLowerCase().includes(search)
    )
  })
  
  if (loading) return <PageLoader />
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Clientes"
        description="Gestión de empresas y contactos"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Clientes' }
        ]}
        actions={
          <Button icon={Plus} onClick={openCreateModal}>
            Nuevo Cliente
          </Button>
        }
      />
      
      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10
                       transition-all duration-200"
          />
        </div>
      </div>
      
      {/* Grid de clientes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3 text-center py-12">
            <Building2 className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchTerm ? 'No se encontraron resultados' : 'No hay clientes registrados'}
            </p>
          </Card>
        ) : (
          filteredClientes.map((cliente) => (
            <Card key={cliente.id} hover={false}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cliente)}
                    className="p-2 text-muted hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className="p-2 text-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-heading font-semibold text-primary truncate">
                {cliente.nombre_empresa}
              </h3>
              
              <div className="mt-3 space-y-2 text-sm">
                {cliente.contacto && (
                  <p className="flex items-center gap-2 text-muted">
                    <User className="w-4 h-4" />
                    {cliente.contacto}
                  </p>
                )}
                {cliente.telefono && (
                  <p className="flex items-center gap-2 text-muted">
                    <Phone className="w-4 h-4" />
                    {cliente.telefono}
                  </p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
      
      {/* Modal de creación/edición */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la empresa"
            value={formData.nombre_empresa}
            onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value })}
            required
          />
          
          <Input
            label="Contacto"
            value={formData.contacto}
            onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
          />
          
          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
          
          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          />
          
          <Modal.Footer>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingCliente ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}
