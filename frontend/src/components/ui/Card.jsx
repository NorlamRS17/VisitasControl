/**
 * Componente Card con hover y variantes.
 */
export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'md',
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  return (
    <div
      className={`
        bg-white rounded-xl shadow-card
        transition-all duration-200 ease-smooth
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-1' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-heading font-semibold text-primary ${className}`}>
      {children}
    </h3>
  )
}

Card.Description = function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-muted mt-1 ${className}`}>
      {children}
    </p>
  )
}

Card.Content = function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  )
}
