/**
 * Configuración base de Axios con interceptores.
 * Maneja autenticación JWT y errores globales.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: añade token JWT
api.interceptors.request.use(
  (config) => {
    // #region agent log
    const token = localStorage.getItem('token')
    const tokenPreview = token ? `${token.substring(0, 30)}...` : 'NULL'
    fetch('http://127.0.0.1:7570/ingest/2e0c1354-05f9-46b6-82ff-8d85dcc7279b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5ec78d'},body:JSON.stringify({sessionId:'5ec78d',location:'api.js:request-interceptor',message:'Token from localStorage',data:{hasToken:!!token,tokenPreview,tokenLength:token?.length,url:config.url},timestamp:Date.now(),hypothesisId:'H1,H3'})}).catch(()=>{});
    // #endregion
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // #region agent log
      fetch('http://127.0.0.1:7570/ingest/2e0c1354-05f9-46b6-82ff-8d85dcc7279b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5ec78d'},body:JSON.stringify({sessionId:'5ec78d',location:'api.js:auth-header-set',message:'Authorization header set',data:{authHeader:config.headers.Authorization?.substring(0,40)+'...',fullHeaderKeys:Object.keys(config.headers)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: maneja errores de autenticación
api.interceptors.response.use(
  (response) => {
    console.log('[API Response OK]', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('[API Error]', error.config?.url, error.response?.status, error.message)
    
    // NO redirigir automáticamente - dejar que cada página maneje el error
    // Esto evita el loop de redirección
    return Promise.reject(error)
  }
)

export default api
