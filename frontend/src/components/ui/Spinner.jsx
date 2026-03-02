/**
 * Componente Spinner para estados de carga.
 */
export default function Spinner({
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  
  return (
    <div
      className={`
        animate-spin rounded-full
        border-4 border-primary/20 border-t-primary
        ${sizes[size]}
        ${className}
      `}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  )
}
