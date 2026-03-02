/**
 * Componente Select con búsqueda (Combobox).
 * Permite escribir para filtrar las opciones disponibles.
 */
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'

export default function SearchableSelect({
  label,
  error,
  options = [],
  value,
  onChange,
  placeholder = 'Buscar...',
  required = false,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  
  const selectedOption = options.find(opt => String(opt.value) === String(value))
  
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSelect = (option) => {
    onChange({ target: { value: option.value } })
    setIsOpen(false)
    setSearchTerm('')
  }
  
  const handleClear = (e) => {
    e.stopPropagation()
    onChange({ target: { value: '' } })
    setSearchTerm('')
  }
  
  const handleInputClick = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }
  
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Campo principal */}
        <div
          onClick={handleInputClick}
          className={`
            w-full px-4 py-3 bg-white border rounded-lg
            font-body text-dark cursor-pointer
            transition-all duration-200 ease-smooth
            flex items-center justify-between gap-2
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isOpen ? 'border-primary ring-2 ring-primary/10' : ''}
            ${error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 hover:border-primary/50'
            }
          `}
        >
          {selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
          
          <div className="flex items-center gap-1">
            {selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted" />
              </button>
            )}
            <ChevronDown className={`w-5 h-5 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Campo de búsqueda */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escribir para buscar..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            {/* Lista de opciones */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted text-center">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = String(option.value) === String(value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm
                        flex items-center justify-between gap-2
                        transition-colors
                        ${isSelected 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-gray-50 text-dark'
                        }
                      `}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Input oculto para validación del formulario */}
      <input
        type="hidden"
        value={value || ''}
        required={required}
      />
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
