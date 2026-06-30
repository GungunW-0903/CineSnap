import React, { useEffect, useRef } from 'react'

/**
 * Particles
 * Lightweight canvas particle field — floating embers/dust drifting upward.
 * GPU-cheap: a single canvas, capped DPR, pauses when tab hidden, and
 * fully disabled for prefers-reduced-motion users.
 */
const Particles = ({
  className = '',
  count = 46,
  color = '255, 194, 74', // gold rgb
  speed = 0.18,
  maxSize = 2.6,
}) => {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let particles = []

    const resize = () => {
      const parent = canvas.parentElement
      w = parent.clientWidth
      h = parent.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      particles = Array.from({ length: count }, (_, i) => ({
        x: pseudo(i * 1.3) * w,
        y: pseudo(i * 2.7) * h,
        r: pseudo(i * 3.9) * maxSize + 0.5,
        vy: -(pseudo(i * 4.4) * speed + speed * 0.4),
        vx: (pseudo(i * 5.1) - 0.5) * speed * 0.6,
        a: pseudo(i * 6.6) * 0.5 + 0.15,
        tw: pseudo(i * 7.2) * 0.02 + 0.004,
        phase: pseudo(i * 8.8) * Math.PI * 2,
      }))
    }

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.y += p.vy
        p.x += p.vx
        if (p.y < -10) {
          p.y = h + 10
          p.x = pseudo(p.phase + p.y) * w
        }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        const flicker = 0.5 + 0.5 * Math.sin(t * p.tw + p.phase)
        ctx.beginPath()
        ctx.fillStyle = `rgba(${color}, ${p.a * flicker})`
        ctx.shadowColor = `rgba(${color}, ${p.a})`
        ctx.shadowBlur = p.r * 3
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    resize()
    seed()
    rafRef.current = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [count, color, speed, maxSize])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}

// deterministic pseudo-random so particles don't reshuffle on re-render
function pseudo(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export default Particles
