/**
 * Servicio para gestionar usuarios.
 * Usado para asignar visitantes a visitas y gestión de usuarios.
 */
import api from './api'

const usuariosService = {
  /**
   * Obtener lista de todos los usuarios
   */
  getAll: async () => {
    const { data } = await api.get('/usuarios')
    return data
  },
  
  /**
   * Obtener usuario por ID
   */
  getById: async (id) => {
    const { data } = await api.get(`/usuarios/${id}`)
    return data
  },
  
  /**
   * Obtener datos del usuario actual
   */
  getMe: async () => {
    const { data } = await api.get('/usuarios/me')
    return data
  },
  
  /**
   * Crear nuevo usuario (solo administradores)
   */
  create: async (userData) => {
    const { data } = await api.post('/usuarios', userData)
    return data
  },
  
  /**
   * Actualizar usuario
   */
  update: async (id, userData) => {
    const { data } = await api.put(`/usuarios/${id}`, userData)
    return data
  },
  
  /**
   * Eliminar usuario
   */
  delete: async (id) => {
    await api.delete(`/usuarios/${id}`)
  }
}

export default usuariosService
