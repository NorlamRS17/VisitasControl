/**
 * Componente Modal con overlay y animaciones.
 */
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  const modalRef = useRef(null)
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  }
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizes[size]}
          bg-white rounded-2xl shadow-xl
          animate-fade-up
          max-h-[90vh] overflow-hidden flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && (
              <h2 className="text-xl font-heading font-semibold text-primary">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted hover:text-dark hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-4 ${className}`}>
      {children}
    </div>
  )
}
