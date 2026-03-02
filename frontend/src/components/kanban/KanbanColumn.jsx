/**
 * Columna del tablero Kanban.
 * Zona donde se pueden soltar las tarjetas de compromisos.
 */
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

export default function KanbanColumn({ column, compromisos, loading }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })
  
  return (
    <div
      className={`
        flex flex-col rounded-2xl overflow-hidden
        bg-bg border border-primary/10
        transition-all duration-200
        ${isOver ? 'ring-2 ring-primary/30 border-primary/20' : ''}
      `}
    >
      {/* Header de columna */}
      <div className={`px-4 py-3 ${column.color} border-b border-primary/10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
            <h3 className="font-heading font-semibold text-primary">
              {column.title}
            </h3>
          </div>
          <span className="text-sm font-mono text-primary/70 bg-white/80 px-2 py-0.5 rounded-full border border-primary/10">
            {compromisos.length}
          </span>
        </div>
      </div>
      
      {/* Contenedor de tarjetas */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-3 space-y-3 min-h-[200px] bg-bg/50
          transition-colors duration-200
          ${isOver ? 'bg-primary/5' : ''}
        `}
      >
        <SortableContext
          items={compromisos.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-primary/5 rounded-xl animate-pulse"
              />
            ))
          ) : compromisos.length === 0 ? (
            <div className="h-full flex items-center justify-center py-8">
              <p className="text-sm text-muted italic">Sin compromisos</p>
            </div>
          ) : (
            compromisos.map((compromiso) => (
              <KanbanCard key={compromiso.id} compromiso={compromiso} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
