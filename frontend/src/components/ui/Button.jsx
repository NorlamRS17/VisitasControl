/**
 * Componente Button con variantes y estados.
 * Incluye efecto magnético en hover.
 */
import { forwardRef } from 'react'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  accent: 'bg-accent text-white hover:bg-accent/90',
  outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'bg-transparent text-primary hover:bg-primary/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-heading font-semibold
    rounded-lg
    transition-all duration-200 ease-smooth
    hover:scale-[1.02] hover:shadow-button
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
  `
  
  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-5 h-5" />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-5 h-5" />
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
