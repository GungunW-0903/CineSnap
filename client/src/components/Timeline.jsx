import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'
import { Search, MousePointerClick, Armchair, Ticket } from 'lucide-react'
import Reveal from './ui/Reveal'

const steps = [
  {
    icon: Search,
    title: 'Discover what to watch',
    text: 'Browse trending premieres, filter by genre and rating, and watch trailers in-line before you commit.',
  },
  {
    icon: MousePointerClick,
    title: 'Pick your perfect show',
    text: 'Choose a date and showtime across partner theaters with live availability — no guesswork.',
  },
  {
    icon: Armchair,
    title: 'Lock your favorite seats',
    text: 'A visual seat map with express seat-lock holds your picks while you finish checkout.',
  },
  {
    icon: Ticket,
    title: 'Snap your ticket',
    text: 'Instant digital tickets land in My Bookings — scan at the door and enjoy the show.',
  },
]

const Timeline = () => {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 60%'],
  })
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 24 })

  return (
    <section id="how-it-works" className="relative section-shell py-16 md:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[#f4b98d]">How CineSnap Works</p>
        <h2 className="mt-2 text-4xl md:text-5xl">From craving to curtain in four steps</h2>
        <p className="mt-4 text-gray-300">
          A booking flow designed to feel effortless — most users go from open to booked in under a
          minute.
        </p>
      </Reveal>

      <div ref={ref} className="relative mt-14 md:mt-20">
        {/* the rail */}
        <div className="absolute left-[26px] top-2 bottom-2 w-[2px] bg-white/10 md:left-1/2 md:-translate-x-1/2" />
        {/* animated fill */}
        <motion.div
          className="absolute left-[26px] top-2 w-[2px] origin-top bg-gradient-to-b from-[#ff5a3d] via-[#ffc24a] to-[#ff5a3d] md:left-1/2 md:-translate-x-1/2"
          style={{ height: '100%', scaleY: reduce ? 1 : fill }}
          aria-hidden
        />

        <div className="space-y-10 md:space-y-16">
          {steps.map((step, i) => {
            const Icon = step.icon
            const isRight = i % 2 === 1
            return (
              <div
                key={step.title}
                className={`relative grid gap-6 md:grid-cols-2 md:items-center ${
                  isRight ? '' : ''
                }`}
              >
                {/* node */}
                <div className="absolute left-[26px] top-1 z-10 -translate-x-1/2 md:left-1/2">
                  <motion.span
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ffc24a]/40 bg-[#0c1322] text-[#ffc24a] shadow-[0_0_22px_rgba(255,194,74,0.35)]"
                    initial={{ scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>
                </div>

                {/* card */}
                <Reveal
                  direction={isRight ? 'right' : 'left'}
                  className={`ml-16 md:ml-0 ${
                    isRight ? 'md:col-start-2' : 'md:col-start-1 md:text-right'
                  }`}
                >
                  <div className="rounded-2xl border border-white/10 bg-[#0d1424]/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#ffc24a]/30">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#ff8a63]">
                      Step {i + 1}
                    </span>
                    <h3 className="mt-1 text-2xl">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">{step.text}</p>
                  </div>
                </Reveal>

                {/* spacer for alternating layout */}
                <div className={`hidden md:block ${isRight ? 'md:col-start-1 md:row-start-1' : ''}`} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Timeline
