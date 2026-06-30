import React, { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/**
 * MagneticButton
 * A premium CTA that:
 *  - magnetically follows the cursor (spring physics)
 *  - emits a material-style ripple on click
 *  - carries an animated glow halo
 *
 * Usage:
 *   <MagneticButton onClick={...}>Explore Movies</MagneticButton>
 *   <MagneticButton as="a" href="#trailers" variant="ghost">Watch</MagneticButton>
 */
const MagneticButton = ({
  children,
  className = '',
  variant = 'solid', // 'solid' | 'ghost'
  strength = 0.35,
  as = 'button',
  glow = true,
  onClick,
  ...rest
}) => {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [ripples, setRipples] = useState([])

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 })

  const handleMove = useCallback(
    (e) => {
      if (reduce || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      x.set(relX * strength)
      y.set(relY * strength)
    },
    [reduce, strength, x, y]
  )

  const handleLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const handleClick = useCallback(
    (e) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const id = `${e.clientX}-${e.clientY}-${rect.top}`
        const ripple = {
          id,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          size: Math.max(rect.width, rect.height) * 2,
        }
        setRipples((prev) => [...prev, ripple])
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id))
        }, 650)
      }
      onClick?.(e)
    },
    [onClick]
  )

  const Tag = motion[as] || motion.button

  const base =
    'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-bold tracking-[0.01em] cursor-pointer select-none will-change-transform'
  const variants = {
    solid:
      'text-white bg-[linear-gradient(95deg,var(--cs-accent),var(--cs-accent-strong))] shadow-[0_10px_28px_rgba(255,90,61,0.32)]',
    ghost:
      'text-white border border-white/22 bg-white/8 backdrop-blur-md hover:bg-white/14',
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {/* animated glow halo */}
      {glow && variant === 'solid' && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-full"
          style={{
            background:
              'linear-gradient(95deg,var(--cs-accent),var(--cs-gold),var(--cs-accent-strong))',
            filter: 'blur(14px)',
            opacity: 0.55,
          }}
          animate={reduce ? {} : { opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/35"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            transform: 'translate(-50%, -50%) scale(0)',
            animation: 'cs-ripple 0.62s ease-out forwards',
          }}
        />
      ))}

      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Tag>
  )
}

export default MagneticButton
