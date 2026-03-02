/**
 * Página de gestión de usuarios.
 * Solo accesible para administradores.
 * CRUD completo con modal de creación/edición.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCircle,
  Mail,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  PageLoader,
  Badge
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { usuariosService } from '../services'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/formatters'

export default function Usuarios() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'operador'
  })
  
  useEffect(() => {
    if (user?.rol !== 'admin') {
      navigate('/')
      return
    }
    loadUsuarios()
  }, [user, navigate])
  
  const loadUsuarios = async () => {
    try {
      const data = await usuariosService.getAll()
      setUsuarios(data)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const openCreateModal = () => {
    setEditingUsuario(null)
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'operador'
    })
    setShowPassword(false)
    setError('')
    setShowModal(true)
  }
  
  const openEditModal = (usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol
    })
    setShowPassword(false)
    setError('')
    setShowModal(true)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim() || !formData.email.trim()) return
    
    if (!editingUsuario && !formData.password) {
      setError('La contraseña es requerida para nuevos usuarios')
      return
    }
    
    setSaving(true)
    setError('')
    
    try {
      if (editingUsuario) {
        const updateData = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        await usuariosService.update(editingUsuario.id, updateData)
      } else {
        await usuariosService.create(formData)
      }
      setShowModal(false)
      loadUsuarios()
    } catch (error) {
      console.error('Error guardando usuario:', error)
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Error al guardar el usuario')
      }
    } finally {
      setSaving(false)
    }
  }
  
  const handleDelete = async (usuario) => {
    if (usuario.id === user.id) {
      alert('No puedes eliminar tu propio usuario')
      return
    }
    
    if (!confirm(`¿Eliminar al usuario "${usuario.nombre}"?`)) return
    
    try {
      await usuariosService.delete(usuario.id)
      loadUsuarios()
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      alert('Error al eliminar el usuario')
    }
  }
  
  const filteredUsuarios = usuarios.filter((usuario) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      usuario.nombre.toLowerCase().includes(search) ||
      usuario.email.toLowerCase().includes(search)
    )
  })
  
  const getRolBadge = (rol) => {
    if (rol === 'admin') {
      return <Badge variant="accent" showIcon={false}>Administrador</Badge>
    }
    return <Badge variant="primary" showIcon={false}>Operador</Badge>
  }
  
  if (loading) return <PageLoader />
  
  if (user?.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="text-center py-12 px-8">
          <Shield className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-primary mb-2">
            Acceso restringido
          </h2>
          <p className="text-muted">
            Solo los administradores pueden gestionar usuarios.
          </p>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Usuarios' }
        ]}
        actions={
          <Button icon={Plus} onClick={openCreateModal}>
            Nuevo Usuario
          </Button>
        }
      />
      
      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10
                       transition-all duration-200"
          />
        </div>
      </div>
      
      {/* Resumen rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card hover={false} className="text-center py-4">
          <p className="text-2xl font-heading font-bold text-primary">
            {usuarios.length}
          </p>
          <p className="text-sm text-muted">Total usuarios</p>
        </Card>
        <Card hover={false} className="text-center py-4">
          <p className="text-2xl font-heading font-bold text-accent">
            {usuarios.filter(u => u.rol === 'admin').length}
          </p>
          <p className="text-sm text-muted">Administradores</p>
        </Card>
        <Card hover={false} className="text-center py-4 col-span-2 sm:col-span-1">
          <p className="text-2xl font-heading font-bold text-primary">
            {usuarios.filter(u => u.rol === 'operador').length}
          </p>
          <p className="text-sm text-muted">Operadores</p>
        </Card>
      </div>
      
      {/* Grid de usuarios */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsuarios.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3 text-center py-12">
            <UserCircle className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchTerm ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
            </p>
          </Card>
        ) : (
          filteredUsuarios.map((usuario) => (
            <Card key={usuario.id} hover={false}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCircle className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(usuario)}
                    className="p-2 text-muted hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {usuario.id !== user.id && (
                    <button
                      onClick={() => handleDelete(usuario)}
                      className="p-2 text-muted hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="font-heading font-semibold text-primary truncate">
                {usuario.nombre}
              </h3>
              
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{usuario.email}</span>
                </p>
                
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted flex-shrink-0" />
                  {getRolBadge(usuario.rol)}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-muted">
                  Registrado: {formatDate(usuario.created_at)}
                </p>
              </div>
              
              {usuario.id === user.id && (
                <div className="mt-2">
                  <Badge variant="primary" showIcon={false} className="text-xs">
                    Tu cuenta
                  </Badge>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
      
      {/* Modal de creación/edición */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <Input
            label="Nombre completo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Juan Pérez"
            required
          />
          
          <Input
            label="Correo electrónico"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="usuario@ejemplo.com"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {editingUsuario ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUsuario ? '••••••••' : 'Mínimo 6 caracteres'}
                required={!editingUsuario}
                className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-lg
                         font-body text-dark transition-all duration-200 ease-smooth
                         focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <Select
            label="Rol"
            value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
            required
          >
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
          </Select>
          
          <Modal.Footer>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingUsuario ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}
