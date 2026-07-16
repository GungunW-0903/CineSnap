import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Reveal
 * Scroll-triggered entrance with spring physics. Honors reduced-motion.
 *
 *   <Reveal>           // fade + rise
 *   <Reveal direction="left" delay={0.1}>
 *   <Reveal as="li" once={false}>
 */
const directions = {
  up: { y: 38, x: 0 },
  down: { y: -38, x: 0 },
  left: { x: 48, y: 0 },
  right: { x: -48, y: 0 },
  none: { x: 0, y: 0 },
}

const Reveal = ({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  once = true,
  amount = 0.25,
  as = 'div',
  ...rest
}) => {
  const reduce = useReducedMotion()
  const offset = directions[direction] || directions.up
  const Tag = motion[as] || motion.div

  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        type: 'spring',
        stiffness: 90,
        damping: 18,
        mass: 0.7,
        delay,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/**
 * Stagger — wraps a group; children using <Reveal> inside get sequenced
 * by their own delay, but for arrays this convenience container staggers
 * direct motion children.
 *
 * `amount` is intentionally tiny: for tall grids (many rows) a large
 * threshold can exceed the fraction of the element that ever fits in the
 * viewport, so the reveal would never fire and content stays invisible.
 */
export const StaggerGroup = ({ children, className = '', stagger = 0.08, amount = 0.05, ...rest }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount }}
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: stagger } },
    }}
    {...rest}
  >
    {children}
  </motion.div>
)

export const StaggerItem = ({ children, className = '', direction = 'up', ...rest }) => {
  const reduce = useReducedMotion()
  const offset = directions[direction] || directions.up
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, ...offset },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { type: 'spring', stiffness: 90, damping: 18 },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
