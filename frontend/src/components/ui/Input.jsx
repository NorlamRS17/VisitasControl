/**
 * Componente Input con label estático y estados de validación.
 * Estilo consistente con Select y SearchableSelect.
 */
import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-4 py-3 bg-white border rounded-lg
          font-body text-dark
          transition-all duration-200 ease-smooth
          focus:outline-none focus:ring-2 focus:ring-primary/10
          ${error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-200 focus:border-primary'
          }
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
