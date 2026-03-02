/**
 * Componente principal de la aplicación.
 * Define las rutas y el layout general.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Visitas from './pages/Visitas'
import NuevaVisita from './pages/NuevaVisita'
import DetalleVisita from './pages/DetalleVisita'
import Compromisos from './pages/Compromisos'
import Calendario from './pages/Calendario'
import Clientes from './pages/Clientes'
import Usuarios from './pages/Usuarios'
import Notificaciones from './pages/Notificaciones'
import { AuthProvider, useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="visitas" element={<Visitas />} />
        <Route path="visitas/nueva" element={<NuevaVisita />} />
        <Route path="visitas/:id" element={<DetalleVisita />} />
        <Route path="compromisos" element={<Compromisos />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="noise-overlay" />
      <AppRoutes />
    </AuthProvider>
  )
}
