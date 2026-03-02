/**
 * Servicio para operaciones CRUD de visitas.
 * Soporta filtros: id_cliente, fecha_desde, fecha_hasta
 */
import api from './api'

export const visitasService = {
  /**
   * Obtener todas las visitas con filtros opcionales.
   * @param {Object} params - Parámetros de filtro
   * @param {number} params.id_cliente - Filtrar por cliente
   * @param {string} params.fecha_desde - Fecha inicio (YYYY-MM-DD)
   * @param {string} params.fecha_hasta - Fecha fin (YYYY-MM-DD)
   */
  async getAll(params = {}) {
    const cleanParams = {}
    if (params.id_cliente) cleanParams.id_cliente = params.id_cliente
    if (params.fecha_desde) cleanParams.fecha_desde = params.fecha_desde
    if (params.fecha_hasta) cleanParams.fecha_hasta = params.fecha_hasta
    
    const response = await api.get('/visitas', { params: cleanParams })
    return response.data
  },
  
  async getRecientes(limit = 10) {
    const response = await api.get('/visitas/recientes', {
      params: { limit }
    })
    return response.data
  },
  
  async getById(id) {
    const response = await api.get(`/visitas/${id}`)
    return response.data
  },
  
  async create(data) {
    const response = await api.post('/visitas', data)
    return response.data
  },
  
  async update(id, data) {
    const response = await api.put(`/visitas/${id}`, data)
    return response.data
  },
  
  async delete(id) {
    await api.delete(`/visitas/${id}`)
  },
}

export default visitasService
