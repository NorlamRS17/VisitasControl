/**
 * Layout principal con Sidebar + área de contenido.
 * Usado para todas las páginas protegidas.
 */
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-0 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
