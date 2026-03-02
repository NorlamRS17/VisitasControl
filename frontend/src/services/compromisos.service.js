/**
 * Servicio para operaciones CRUD de compromisos.
 */
import api from './api'

export const compromisosService = {
  async getAll(params = {}) {
    const response = await api.get('/compromisos', { params })
    return response.data
  },
  
  async getPendientes(limit = 20) {
    const response = await api.get('/compromisos/pendientes', {
      params: { limit }
    })
    return response.data
  },
  
  async getStats() {
    const response = await api.get('/compromisos/stats')
    return response.data
  },
  
  async getById(id) {
    const response = await api.get(`/compromisos/${id}`)
    return response.data
  },
  
  async getByVisita(visitaId) {
    const response = await api.get('/compromisos', {
      params: { id_visita: visitaId }
    })
    return response.data
  },
  
  async create(data) {
    const response = await api.post('/compromisos', data)
    return response.data
  },
  
  async update(id, data) {
    const response = await api.put(`/compromisos/${id}`, data)
    return response.data
  },
  
  async updateEstado(id, estado) {
    const response = await api.patch(`/compromisos/${id}/estado`, null, {
      params: { estado }
    })
    return response.data
  },
  
  async delete(id) {
    await api.delete(`/compromisos/${id}`)
  },
}

export default compromisosService
