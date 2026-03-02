/**
 * Página de Login.
 * Diseño minimalista con el tema Tech Orgánico.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, AlertCircle } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="text-2xl font-heading font-bold text-white">V&C</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-primary">
            V&C Control
          </h1>
          <p className="text-muted mt-2">
            Sistema de Control de Visitas
          </p>
        </div>
        
        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-xl font-heading font-semibold text-primary mb-6">
            Iniciar Sesión
          </h2>
          
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              icon={LogIn}
            >
              Ingresar
            </Button>
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-sm text-muted mt-6">
          Sistema de seguimiento de visitas y compromisos
        </p>
      </div>
    </div>
  )
}
