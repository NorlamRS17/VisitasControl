/**
 * Servicio de autenticación.
 * Maneja login, registro y estado del usuario.
 */
import api from './api'

export const authService = {
  async login(email, password) {
    // #region agent log
    fetch('http://127.0.0.1:7570/ingest/2e0c1354-05f9-46b6-82ff-8d85dcc7279b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5ec78d'},body:JSON.stringify({sessionId:'5ec78d',location:'auth.service.js:login-start',message:'Login initiated',data:{email},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    const { access_token } = response.data
    
    // #region agent log
    fetch('http://127.0.0.1:7570/ingest/2e0c1354-05f9-46b6-82ff-8d85dcc7279b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5ec78d'},body:JSON.stringify({sessionId:'5ec78d',location:'auth.service.js:token-received',message:'Token received from API',data:{tokenPreview:access_token?.substring(0,30)+'...',tokenLength:access_token?.length},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    localStorage.setItem('token', access_token)
    
    // #region agent log
    const storedToken = localStorage.getItem('token')
    fetch('http://127.0.0.1:7570/ingest/2e0c1354-05f9-46b6-82ff-8d85dcc7279b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5ec78d'},body:JSON.stringify({sessionId:'5ec78d',location:'auth.service.js:token-stored',message:'Token stored in localStorage',data:{storedTokenPreview:storedToken?.substring(0,30)+'...',storedLength:storedToken?.length,tokensMatch:storedToken===access_token},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    const userResponse = await api.get('/usuarios/me')
    localStorage.setItem('user', JSON.stringify(userResponse.data))
    
    return userResponse.data
  },
  
  async register(data) {
    const response = await api.post('/auth/register', data)
    return response.data
  },
  
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
  
  getToken() {
    return localStorage.getItem('token')
  },
  
  isAuthenticated() {
    return !!this.getToken()
  },
}

export default authService
