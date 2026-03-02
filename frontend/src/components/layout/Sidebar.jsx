/**
 * Sidebar de navegación principal.
 * Fondo oscuro (primary) con indicador activo en accent.
 * Los items con adminOnly solo se muestran a administradores.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  CheckSquare,
  CalendarDays,
  UserCog,
  MessageSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/visitas', label: 'Visitas', icon: ClipboardList },
  { path: '/compromisos', label: 'Compromisos', icon: CheckSquare },
  { path: '/calendario', label: 'Calendario', icon: CalendarDays },
  { path: '/clientes', label: 'Clientes', icon: Building2 },
  { path: '/notificaciones', label: 'Notificaciones', icon: MessageSquare, adminOnly: true },
  { path: '/usuarios', label: 'Usuarios', icon: UserCog, adminOnly: true },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-primary text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-dark/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-primary text-white
          flex flex-col
          transition-transform duration-300 ease-smooth
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold">V&C Control</h1>
            <p className="text-sm text-white/60 mt-0.5">Sistema de Visitas</p>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-1">
            {navItems
              .filter(item => !item.adminOnly || user?.rol === 'admin')
              .map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-accent text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-accent font-semibold">
                {user?.nombre?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-white/50 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-2
                       text-white/70 hover:bg-white/10 hover:text-white
                       rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
        
        {/* Status indicator */}
        <div className="px-6 py-4 bg-dark/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-dot" />
            <span className="text-xs font-mono text-white/50">
              Sistema operativo
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
