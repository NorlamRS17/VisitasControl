/**
 * Componente TextArea con label y estados de validación.
 */
import { forwardRef } from 'react'

const TextArea = forwardRef(({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-4 py-3 bg-white border rounded-lg resize-none
          font-body text-dark
          transition-all duration-200 ease-smooth
          focus:outline-none focus:ring-2 focus:ring-primary/10
          placeholder:text-muted
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

TextArea.displayName = 'TextArea'

export default TextArea
