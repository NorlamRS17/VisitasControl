/**
 * Componente Badge para estados y etiquetas.
 */
import { Clock, RefreshCw, CheckCircle } from 'lucide-react'

const variants = {
  pendiente: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: Clock,
  },
  en_progreso: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: RefreshCw,
  },
  completado: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: CheckCircle,
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    icon: null,
  },
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: null,
  },
}

export default function Badge({
  children,
  variant = 'primary',
  showIcon = true,
  className = '',
}) {
  const config = variants[variant] || variants.primary
  const Icon = config.icon
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1
        rounded-full text-sm font-medium
        ${config.bg} ${config.text}
        ${className}
      `}
    >
      {showIcon && Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  )
}
