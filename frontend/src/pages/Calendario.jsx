/**
 * Página de calendario para visualizar visitas y compromisos.
 * Muestra un calendario mensual con indicadores de eventos.
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Building2,
  CheckSquare,
  Clock,
  X,
  ExternalLink
} from 'lucide-react'
import { Card, Badge, Button, PageLoader } from '../components/ui'
import { PageHeader } from '../components/layout'
import { visitasService, compromisosService } from '../services'
import { formatDate, formatDateShort } from '../utils/formatters'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function Calendario() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [visitas, setVisitas] = useState([])
  const [compromisos, setCompromisos] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showPanel, setShowPanel] = useState(false)
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  useEffect(() => {
    loadData()
  }, [year, month])
  
  const loadData = async () => {
    try {
      setRefreshing(true)
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const fechaDesde = firstDay.toISOString().split('T')[0]
      const fechaHasta = lastDay.toISOString().split('T')[0]
      
      const [visitasData, compromisosData] = await Promise.all([
        visitasService.getAll({ fecha_desde: fechaDesde, fecha_hasta: fechaHasta }),
        compromisosService.getAll()
      ])
      
      // Eliminar duplicados por ID (por si acaso)
      const uniqueVisitas = visitasData.filter((v, i, arr) => 
        arr.findIndex(x => x.id === v.id) === i
      )
      
      const filteredCompromisos = compromisosData.filter(c => {
        if (!c.fecha_entrega) return false
        const fecha = new Date(c.fecha_entrega)
        return fecha >= firstDay && fecha <= lastDay
      })
      
      // Eliminar duplicados por ID
      const uniqueCompromisos = filteredCompromisos.filter((c, i, arr) => 
        arr.findIndex(x => x.id === c.id) === i
      )
      
      setVisitas(uniqueVisitas)
      setCompromisos(uniqueCompromisos)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setInitialLoading(false)
      setRefreshing(false)
    }
  }
  
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const startDay = firstDayOfMonth.getDay()
    const totalDays = lastDayOfMonth.getDate()
    
    const days = []
    
    for (let i = 0; i < startDay; i++) {
      const prevDate = new Date(year, month, -startDay + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    
    return days
  }, [year, month])
  
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    const dayVisitas = visitas.filter(v => {
      const visitaDate = new Date(v.fecha_visita).toISOString().split('T')[0]
      return visitaDate === dateStr
    })
    
    const dayCompromisos = compromisos.filter(c => {
      if (!c.fecha_entrega) return false
      const compromisoDate = new Date(c.fecha_entrega).toISOString().split('T')[0]
      return compromisoDate === dateStr
    })
    
    return { visitas: dayVisitas, compromisos: dayCompromisos }
  }
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const handleToday = () => {
    setCurrentDate(new Date())
  }
  
  const handleDayClick = (date) => {
    setSelectedDate(date)
    setShowPanel(true)
  }
  
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : { visitas: [], compromisos: [] }
  
  if (initialLoading) return <PageLoader />
  
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Calendario"
        description="Visualiza visitas y compromisos por fecha"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Calendario' }
        ]}
      />
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <Card>
            {/* Header del calendario */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-heading font-bold text-primary">
                  {MESES[month]} {year}
                </h2>
                {refreshing && (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary 
                                  rounded-full animate-spin" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 
                             rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Hoy
                </button>
                <button
                  onClick={handlePrevMonth}
                  disabled={refreshing}
                  className="p-2 text-muted hover:text-primary hover:bg-primary/5 
                             rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  disabled={refreshing}
                  className="p-2 text-muted hover:text-primary hover:bg-primary/5 
                             rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className="text-center text-sm font-medium text-muted py-2"
                >
                  {dia}
                </div>
              ))}
            </div>
            
            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const events = getEventsForDate(day.date)
                const hasVisitas = events.visitas.length > 0
                const hasCompromisos = events.compromisos.length > 0
                const hasEvents = hasVisitas || hasCompromisos
                const today = isToday(day.date)
                const isSelected = selectedDate?.toDateString() === day.date.toDateString()
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day.date)}
                    className={`
                      relative aspect-square p-1 rounded-xl transition-all
                      flex flex-col items-center justify-start pt-2
                      ${day.isCurrentMonth 
                        ? 'hover:bg-primary/5' 
                        : 'opacity-40'
                      }
                      ${today 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : ''
                      }
                      ${isSelected && !today
                        ? 'bg-primary/10 ring-2 ring-primary/30' 
                        : ''
                      }
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${today ? 'text-white' : day.isCurrentMonth ? 'text-dark' : 'text-muted'}
                    `}>
                      {day.date.getDate()}
                    </span>
                    
                    {/* Indicadores de eventos */}
                    {hasEvents && day.isCurrentMonth && (
                      <div className="flex items-center gap-1 mt-1">
                        {hasVisitas && (
                          <span className={`
                            w-1.5 h-1.5 rounded-full
                            ${today ? 'bg-white' : 'bg-primary'}
                          `} />
                        )}
                        {hasCompromisos && (
                          <span className={`
                            w-1.5 h-1.5 rounded-full
                            ${today ? 'bg-white/70' : 'bg-accent'}
                          `} />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Leyenda */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-primary/10">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Visitas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span>Compromisos</span>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Panel lateral de eventos */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-primary">
                    {formatDate(selectedDate)}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1 text-muted hover:text-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {selectedEvents.visitas.length === 0 && selectedEvents.compromisos.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                    <p className="text-sm text-muted">Sin eventos este día</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Visitas del día */}
                    {selectedEvents.visitas.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                          Visitas ({selectedEvents.visitas.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedEvents.visitas.map((visita) => (
                            <button
                              key={visita.id}
                              onClick={() => navigate(`/visitas/${visita.id}`)}
                              className="w-full p-3 text-left bg-primary/5 rounded-xl 
                                         hover:bg-primary/10 transition-colors group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-primary" />
                                  <span className="font-medium text-dark text-sm">
                                    {visita.cliente?.nombre_empresa}
                                  </span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-muted 
                                                         group-hover:text-primary transition-colors" />
                              </div>
                              {visita.observaciones && (
                                <p className="text-xs text-muted mt-1 line-clamp-1 pl-6">
                                  {visita.observaciones}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Compromisos del día */}
                    {selectedEvents.compromisos.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                          Compromisos ({selectedEvents.compromisos.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedEvents.compromisos.map((compromiso) => (
                            <button
                              key={compromiso.id}
                              onClick={() => {
                                if (compromiso.id_visita) {
                                  navigate(`/visitas/${compromiso.id_visita}`)
                                }
                              }}
                              className="w-full p-3 text-left bg-accent/5 rounded-xl 
                                         hover:bg-accent/10 transition-colors group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-accent flex-shrink-0" />
                                    <span className="font-medium text-dark text-sm truncate">
                                      {compromiso.titulo}
                                    </span>
                                  </div>
                                  {/* Mostrar cliente para diferenciar */}
                                  {compromiso.visita?.cliente?.nombre_empresa && (
                                    <p className="text-xs text-primary/70 mt-1 pl-6 flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {compromiso.visita.cliente.nombre_empresa}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={compromiso.estado} className="text-xs flex-shrink-0 ml-2">
                                  {compromiso.estado.replace('_', ' ')}
                                </Badge>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted/30 mx-auto mb-3" />
                <p className="text-muted">Selecciona un día</p>
                <p className="text-sm text-muted/70 mt-1">
                  para ver visitas y compromisos
                </p>
              </div>
            )}
          </Card>
          
          {/* Resumen del mes */}
          <Card className="mt-4">
            <h4 className="text-sm font-medium text-muted mb-3">
              Resumen de {MESES[month]}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary/5 rounded-xl text-center">
                <p className="text-2xl font-bold text-primary">{visitas.length}</p>
                <p className="text-xs text-muted">Visitas</p>
              </div>
              <div className="p-3 bg-accent/5 rounded-xl text-center">
                <p className="text-2xl font-bold text-accent">{compromisos.length}</p>
                <p className="text-xs text-muted">Compromisos</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
