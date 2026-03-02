/**
 * Servicio para operaciones CRUD de clientes.
 */
import api from './api'

export const clientesService = {
  async getAll(params = {}) {
    const response = await api.get('/clientes', { params })
    return response.data
  },
  
  async getById(id) {
    const response = await api.get(`/clientes/${id}`)
    return response.data
  },
  
  async search(query) {
    const response = await api.get('/clientes', {
      params: { search: query }
    })
    return response.data
  },
  
  async create(data) {
    const response = await api.post('/clientes', data)
    return response.data
  },
  
  async update(id, data) {
    const response = await api.put(`/clientes/${id}`, data)
    return response.data
  },
  
  async delete(id) {
    await api.delete(`/clientes/${id}`)
  },
}

export default clientesService
