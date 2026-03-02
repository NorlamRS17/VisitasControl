/**
 * Hook y contexto para autenticación.
 * Provee estado del usuario y funciones de login/logout.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    const currentUser = authService.getCurrentUser()
    
    console.log('[Auth] Verificando sesión:', { 
      tieneToken: !!token, 
      tieneUser: !!currentUser 
    })
    
    if (currentUser && token) {
      console.log('[Auth] Usuario encontrado:', currentUser.email)
      setUser(currentUser)
    } else {
      console.log('[Auth] No hay sesión activa')
    }
    setLoading(false)
  }, [])
  
  const login = async (email, password) => {
    const userData = await authService.login(email, password)
    setUser(userData)
    return userData
  }
  
  const logout = () => {
    authService.logout()
    setUser(null)
  }
  
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
