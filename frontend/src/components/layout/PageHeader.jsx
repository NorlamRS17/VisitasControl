/**
 * Header de página con título, descripción y acciones.
 */
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted mb-2">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-dark">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      
      {/* Title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-primary">
            {title}
          </h1>
          {description && (
            <p className="text-muted mt-1">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
