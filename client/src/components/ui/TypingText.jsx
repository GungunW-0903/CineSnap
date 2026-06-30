import React, { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * TypingText
 * Cinematic typewriter that cycles through a list of phrases:
 * types, holds, deletes, advances. Includes a blinking caret.
 * Reduced-motion users see the first phrase statically.
 *
 *   <TypingText words={['Blockbusters.', 'Premieres.', 'Date Nights.']} />
 */
const TypingText = ({
  words = [],
  className = '',
  typeSpeed = 75,
  deleteSpeed = 38,
  holdTime = 1500,
  caretClassName = '',
}) => {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState('typing') // typing | holding | deleting

  useEffect(() => {
    if (reduce) {
      setText(words[0] || '')
      return
    }
    const current = words[index % words.length] || ''
    let timeout

    if (phase === 'typing') {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed)
      } else {
        timeout = setTimeout(() => setPhase('deleting'), holdTime)
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed)
      } else {
        setPhase('typing')
        setIndex((i) => (i + 1) % words.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [text, phase, index, words, typeSpeed, deleteSpeed, holdTime, reduce])

  return (
    <span className={className}>
      {text || '​'}
      <span
        aria-hidden
        className={`cs-caret ${caretClassName}`}
      />
    </span>
  )
}

export default TypingText
