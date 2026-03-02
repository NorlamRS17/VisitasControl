/**
 * Tarjeta de compromiso arrastrable para el tablero Kanban.
 * Soporta drag & drop en desktop y touch en móvil.
 */
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '../../utils/formatters'

export default function KanbanCard({ compromiso, isDragging = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: compromiso.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  // Normalizar fechas a solo día (sin hora) para comparaciones correctas
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const fechaEntrega = compromiso.fecha_entrega 
    ? new Date(compromiso.fecha_entrega + 'T12:00:00') 
    : null
  
  // Vencido: fecha de entrega es ANTES de hoy (no incluye hoy)
  const isOverdue = fechaEntrega && 
    fechaEntrega < today &&
    compromiso.estado !== 'completado'
  
  // Próximo: fecha de entrega es hoy o en los próximos 3 días
  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  
  const isDueSoon = fechaEntrega && 
    !isOverdue &&
    fechaEntrega <= threeDaysFromNow &&
    compromiso.estado !== 'completado'
  
  const isBeingDragged = isDragging || isSortableDragging
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group bg-white rounded-xl border border-primary/10 overflow-hidden
        shadow-sm hover:shadow-md
        transition-all duration-200 touch-manipulation
        ${isBeingDragged 
          ? 'opacity-0 scale-95' 
          : 'hover:border-primary/20 cursor-grab active:cursor-grabbing'
        }
      `}
      {...attributes}
      {...listeners}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-muted/40 group-hover:text-muted/70 transition-colors">
            <GripVertical className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-dark leading-snug line-clamp-2">
              {compromiso.titulo}
            </h4>
            
            {compromiso.descripcion && (
              <p className="mt-1.5 text-sm text-muted line-clamp-2">
                {compromiso.descripcion}
              </p>
            )}
            
            {compromiso.fecha_entrega && (
              <div className={`
                mt-3 flex items-center gap-1.5 text-xs font-medium
                ${isOverdue 
                  ? 'text-accent' 
                  : isDueSoon 
                    ? 'text-primary' 
                    : 'text-muted'
                }
              `}>
                {isOverdue ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : isDueSoon ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                <span>
                  {isOverdue ? 'Vencido: ' : isDueSoon ? 'Próximo: ' : ''}
                  {formatDate(compromiso.fecha_entrega)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Indicador de estado (dentro del overflow:hidden para respetar border-radius) */}
      <div className={`
        h-1.5 w-full
        ${compromiso.estado === 'pendiente' ? 'bg-dark/20' : ''}
        ${compromiso.estado === 'en_progreso' ? 'bg-primary' : ''}
        ${compromiso.estado === 'completado' ? 'bg-accent' : ''}
      `} />
    </div>
  )
}

/** Componente para el overlay mientras se arrastra */
export function KanbanCardOverlay({ compromiso }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const fechaEntrega = compromiso.fecha_entrega 
    ? new Date(compromiso.fecha_entrega + 'T12:00:00') 
    : null
  
  const isOverdue = fechaEntrega && 
    fechaEntrega < today &&
    compromiso.estado !== 'completado'
  
  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  
  const isDueSoon = fechaEntrega && 
    !isOverdue &&
    fechaEntrega <= threeDaysFromNow &&
    compromiso.estado !== 'completado'

  return (
    <div className="bg-white rounded-xl border-2 border-primary/30 overflow-hidden shadow-2xl 
                    scale-105 rotate-2 cursor-grabbing">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-primary/50">
            <GripVertical className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-dark leading-snug line-clamp-2">
              {compromiso.titulo}
            </h4>
            
            {compromiso.descripcion && (
              <p className="mt-1.5 text-sm text-muted line-clamp-2">
                {compromiso.descripcion}
              </p>
            )}
            
            {compromiso.fecha_entrega && (
              <div className={`
                mt-3 flex items-center gap-1.5 text-xs font-medium
                ${isOverdue ? 'text-accent' : isDueSoon ? 'text-primary' : 'text-muted'}
              `}>
                {isOverdue ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : isDueSoon ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                <span>
                  {isOverdue ? 'Vencido: ' : isDueSoon ? 'Próximo: ' : ''}
                  {formatDate(compromiso.fecha_entrega)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={`
        h-1.5 w-full
        ${compromiso.estado === 'pendiente' ? 'bg-dark/20' : ''}
        ${compromiso.estado === 'en_progreso' ? 'bg-primary' : ''}
        ${compromiso.estado === 'completado' ? 'bg-accent' : ''}
      `} />
    </div>
  )
}
