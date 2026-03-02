/**
 * Componente Select estilizado.
 * Acepta options como prop o como children.
 */
import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
  children,
  ...props
}, ref) => {
  const hasChildren = Boolean(children)
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 pr-10 bg-white border rounded-lg
            font-body text-dark
            appearance-none cursor-pointer
            transition-all duration-200 ease-smooth
            focus:outline-none focus:ring-2 focus:ring-primary/10
            ${error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 focus:border-primary'
            }
          `}
          {...props}
        >
          {!hasChildren && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {hasChildren
            ? children
            : options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
          }
        </select>
        
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none"
        />
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
