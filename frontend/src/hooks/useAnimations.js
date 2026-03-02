/**
 * Hook para animaciones GSAP.
 * Gestiona el ciclo de vida de las animaciones.
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useFadeIn(options = {}) {
  const ref = useRef(null)
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        ...options
      })
    })
    
    return () => ctx.revert()
  }, [])
  
  return ref
}

export function useStaggerFadeIn(selector, options = {}) {
  const containerRef = useRef(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const ctx = gsap.context(() => {
      gsap.from(selector, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power3.out',
        ...options
      })
    }, containerRef)
    
    return () => ctx.revert()
  }, [selector])
  
  return containerRef
}

export function useHoverScale(scale = 1.02) {
  const ref = useRef(null)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const handleMouseEnter = () => {
      gsap.to(element, {
        scale,
        duration: 0.2,
        ease: 'power2.out'
      })
    }
    
    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      })
    }
    
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [scale])
  
  return ref
}
