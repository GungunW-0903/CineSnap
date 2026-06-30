import React from 'react'

/**
 * Marquee
 * Seamless infinite horizontal scroller (CSS-driven, GPU compositor only).
 * Duplicates children once for a continuous loop; pauses on hover.
 * Add `reverse` to flip direction.
 *
 *   <Marquee speed={28}>{logos}</Marquee>
 */
const Marquee = ({ children, speed = 30, reverse = false, className = '', pauseOnHover = true }) => {
  return (
    <div className={`cs-marquee group relative overflow-hidden ${className}`}>
      <div
        className={`cs-marquee-track flex w-max items-center gap-12 ${
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Marquee
