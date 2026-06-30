import React, { useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/**
 * MouseGlow
 * A soft radial spotlight that follows the cursor inside its container.
 * Drop it as the first child of any `position: relative` section and place
 * your content above it. Pointer-events-none; disabled for reduced-motion.
 *
 *   <section className="relative">
 *     <MouseGlow />
 *     ...content...
 *   </section>
 */
const MouseGlow = ({ size = 520, color = 'rgba(255,90,61,0.18)', className = '' }) => {
  const reduce = useReducedMotion()
  const wrapRef = useRef(null)
  const x = useMotionValue(-9999)
  const y = useMotionValue(-9999)
  const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.5 })

  useEffect(() => {
    if (reduce) return
    const handleMove = (e) => {
      const host = wrapRef.current?.parentElement
      if (!host) return
      const rect = host.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (inside) {
        x.set(e.clientX - rect.left)
        y.set(e.clientY - rect.top)
      } else {
        x.set(-9999)
        y.set(-9999)
      }
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [reduce, x, y])

  if (reduce) return null

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-0 overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          left: sx,
          top: sy,
          x: '-50%',
          y: '-50%',
          background: `radial-gradient(circle, ${color}, transparent 65%)`,
          filter: 'blur(10px)',
        }}
      />
    </div>
  )
}

export default MouseGlow
