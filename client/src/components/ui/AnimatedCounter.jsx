import React, { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/**
 * AnimatedCounter
 * Counts up from 0 to `value` when scrolled into view, with spring easing.
 * Supports decimals, prefix/suffix, and thousands formatting.
 *
 *   <AnimatedCounter value={1.2} suffix="M" decimals={1} />
 *   <AnimatedCounter value={120} suffix="+" />
 */
const AnimatedCounter = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.6,
  className = '',
}) => {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.6 })

  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, {
    duration: duration * 1000,
    bounce: 0,
  })

  useEffect(() => {
    if (inView) motionVal.set(value)
  }, [inView, value, motionVal])

  useEffect(() => {
    if (reduce && ref.current) {
      ref.current.textContent = `${prefix}${formatNumber(value, decimals)}${suffix}`
      return
    }
    const unsub = spring.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${formatNumber(latest, decimals)}${suffix}`
      }
    })
    return () => unsub()
  }, [spring, prefix, suffix, decimals, reduce, value])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(0, decimals)}
      {suffix}
    </span>
  )
}

function formatNumber(n, decimals) {
  const fixed = Number(n).toFixed(decimals)
  const [intPart, dec] = fixed.split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec ? `${withCommas}.${dec}` : withCommas
}

export default AnimatedCounter
