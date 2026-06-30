import React, { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

/**
 * TiltCard
 * 3D tilt that tracks the cursor with spring physics, plus an optional
 * mouse-following sheen highlight. Children render flat above the tilt plane.
 */
const TiltCard = ({
  children,
  className = '',
  max = 10, // max tilt in degrees
  glare = true,
  scale = 1.02,
  ...rest
}) => {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const sx = useSpring(px, { stiffness: 150, damping: 18 })
  const sy = useSpring(py, { stiffness: 150, damping: 18 })

  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const glareX = useTransform(sx, [0, 1], ['0%', '100%'])
  const glareY = useTransform(sy, [0, 1], ['0%', '100%'])
  // computed unconditionally to keep hook order stable
  const glareBg = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.16), transparent 45%)`
  )

  const handleMove = useCallback(
    (e) => {
      if (reduce || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      px.set((e.clientX - rect.left) / rect.width)
      py.set((e.clientY - rect.top) / rect.height)
    },
    [reduce, px, py]
  )

  const handleLeave = useCallback(() => {
    px.set(0.5)
    py.set(0.5)
  }, [px, py])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={reduce ? {} : { scale }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
      }}
      className={`relative ${className}`}
      {...rest}
    >
      {glare && !reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-60"
          style={{ background: glareBg }}
        />
      )}
      <div
        style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}
        className="relative h-full"
      >
        {children}
      </div>
    </motion.div>
  )
}

export default TiltCard
