import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * RotatingWord
 * Premium word-swapper for hero headlines. Designed to sit on its OWN line so
 * it can never collide with surrounding text. One word fully slides out before
 * the next slides in (mode="wait"), inside a clipped slot — no overlap, no
 * mid-word fragments, no reflow of the lines around it.
 *
 * Reduced-motion users see the first word statically.
 */
const RotatingWord = ({
  words = [],
  interval = 2600,
  className = '',
}) => {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce || words.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, interval)
    return () => clearInterval(id)
  }, [reduce, words.length, interval])

  if (reduce) {
    return <span className={className}>{words[0]}</span>
  }

  return (
    <span
      className="relative inline-grid overflow-hidden pb-[0.12em] align-bottom"
      style={{ gridAutoColumns: '100%' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          className={`col-start-1 row-start-1 ${className}`}
          style={{ whiteSpace: 'nowrap', willChange: 'transform, opacity' }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 0.9, 0.31, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default RotatingWord
