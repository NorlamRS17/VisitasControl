/**
 * Tablero Kanban para gestión visual de compromisos.
 * Permite arrastrar y soltar tarjetas entre columnas de estado.
 * Soporta interacción táctil para dispositivos móviles.
 */
import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import KanbanCard, { KanbanCardOverlay } from './KanbanCard'

const COLUMNS = [
  { id: 'pendiente', title: 'Pendiente', color: 'bg-bg', dotColor: 'bg-dark/30' },
  { id: 'en_progreso', title: 'En Progreso', color: 'bg-primary/5', dotColor: 'bg-primary' },
  { id: 'completado', title: 'Completado', color: 'bg-primary/10', dotColor: 'bg-accent' },
]

export default function KanbanBoard({ compromisos, onUpdateEstado, loading }) {
  const [activeId, setActiveId] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  const getCompromisosByEstado = (estado) => {
    return compromisos.filter(c => c.estado === estado)
  }
  
  const findCompromiso = (id) => {
    return compromisos.find(c => c.id === parseInt(id))
  }
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }
  
  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    
    if (!over) return
    
    const activeCompromiso = findCompromiso(active.id)
    if (!activeCompromiso) return
    
    // Determinar la columna destino
    let newEstado = over.id
    
    // Si soltamos sobre otra tarjeta, obtener su estado
    if (over.id !== 'pendiente' && over.id !== 'en_progreso' && over.id !== 'completado') {
      const overCompromiso = findCompromiso(over.id)
      if (overCompromiso) {
        newEstado = overCompromiso.estado
      }
    }
    
    // Solo actualizar si el estado cambió
    if (activeCompromiso.estado !== newEstado) {
      onUpdateEstado(activeCompromiso.id, newEstado)
    }
  }
  
  const handleDragCancel = () => {
    setActiveId(null)
  }
  
  const activeCompromiso = activeId ? findCompromiso(activeId) : null
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => {
          const columnCompromisos = getCompromisosByEstado(column.id)
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              compromisos={columnCompromisos}
              loading={loading}
            />
          )
        })}
      </div>
      
      {/* Overlay flotante de la tarjeta mientras se arrastra */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeCompromiso ? (
          <KanbanCardOverlay compromiso={activeCompromiso} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
