/**
 * Funciones de formateo de datos.
 */

/**
 * Parsea una fecha evitando problemas de zona horaria.
 * Si es solo fecha (YYYY-MM-DD), la interpreta como local, no UTC.
 */
function parseDate(dateString) {
  if (!dateString) return null
  
  // Si es formato ISO con fecha solamente (YYYY-MM-DD), agregar T12:00 para evitar problemas de zona horaria
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString + 'T12:00:00')
  }
  
  return new Date(dateString)
}

export function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = parseDate(dateString)
  if (!date || isNaN(date.getTime())) return ''
  
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateString) {
  if (!dateString) return ''
  
  const date = parseDate(dateString)
  if (!date || isNaN(date.getTime())) return ''
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)  // DateTime siempre viene con zona horaria
  if (!date || isNaN(date.getTime())) return ''
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(dateString) {
  if (!dateString) return ''
  
  const date = parseDate(dateString)
  if (!date || isNaN(date.getTime())) return ''
  
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  
  return formatDateShort(dateString)
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str, length = 50) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
