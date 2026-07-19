import React from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, ClockIcon, ArrowRight, PlayCircleIcon, Sparkles } from 'lucide-react'
import MagneticButton from './ui/MagneticButton'
import RotatingWord from './ui/RotatingWord'
import Particles from './ui/Particles'
import MouseGlow from './ui/MouseGlow'
import TiltCard from './ui/TiltCard'
import Hero3DTicket from './ui/Hero3DTicket'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 16 } },
}

const HeroSection = () => {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()

  // parallax: background drifts slower than foreground on scroll
  const bgY = useTransform(scrollY, [0, 600], [0, 120])
  const contentY = useTransform(scrollY, [0, 600], [0, -40])
  const fade = useTransform(scrollY, [0, 480], [1, 0])

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated gradient + parallax cinematic background */}
      <motion.div style={{ y: reduce ? 0 : bgY }} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#ff5a3d]/30 via-[#ffc24a]/20 to-[#070b14] animate-gradient-x"
          style={{ backgroundSize: '200% 200%' }}
        />
        <div className='absolute inset-0 bg-[url("/backgroundImage.png")] bg-cover bg-center' />
        <div className="absolute inset-0 bg-linear-to-r from-[#060a14]/95 via-[#060a14]/72 to-[#060a14]/45" />
        <div className="absolute inset-0 bg-linear-to-t from-[#060a14] via-transparent to-transparent" />
      </motion.div>

      {/* Morphing aurora blobs */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <span className="cs-aurora left-[-6%] top-[12%] h-72 w-72 bg-[#ff5a3d]/40" />
        <span
          className="cs-aurora right-[2%] top-[-4%] h-80 w-80 bg-[#ffc24a]/30"
          style={{ animationDelay: '-6s' }}
        />
      </div>

      {/* Floating ember particles + cursor-tracking glow */}
      <Particles className="z-[2]" count={48} />
      <MouseGlow size={560} />

      <motion.div
        style={{ y: reduce ? 0 : contentY, opacity: reduce ? 1 : fade }}
        variants={container}
        initial="hidden"
        animate="show"
        className="section-shell relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 pt-34 md:pt-40 pb-18 md:pb-20"
      >
        <div className="flex flex-col items-start justify-center gap-5">
          <motion.img
            variants={item}
            src={assets.marvelLogo}
            alt="Featured movie brand"
            className="max-h-10 md:max-h-11 drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          />

          <motion.div variants={item}>
            <p className="inline-flex items-center gap-2 text-sm text-[#ffd7b4] px-4 py-2 rounded-full border border-[#f9bb8f]/30 bg-[#f9bb8f]/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#ffc24a]" />
              Fresh Premieres Every Week
            </p>
          </motion.div>

          <motion.h1
            variants={item}
            className="display-font text-[2.7rem] leading-[1.04] sm:text-[3.4rem] md:text-[4.3rem] lg:text-[5rem] max-w-2xl tracking-[-0.035em]"
          >
            <span className="block text-white/95">
              {'Your next'.split(' ').map((w, i) => (
                <motion.span
                  key={w}
                  className="inline-block mr-[0.28em]"
                  initial={reduce ? false : { opacity: 0, y: 34, rotateX: -55 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.25 + i * 0.09, type: 'spring', stiffness: 90, damping: 15 }}
                >
                  {w}
                </motion.span>
              ))}
            </span>
            <span className="relative block w-fit">
              <RotatingWord
                words={['blockbuster', 'premiere', 'date night', 'epic']}
                className="headline-highlight"
              />
              <span className="headline-underline" aria-hidden />
            </span>
            <span className="block text-white/95">
              {'booked in'.split(' ').map((w, i) => (
                <motion.span
                  key={w}
                  className="inline-block mr-[0.28em]"
                  initial={reduce ? false : { opacity: 0, y: 34, rotateX: -55 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.5 + i * 0.09, type: 'spring', stiffness: 90, damping: 15 }}
                >
                  {w}
                </motion.span>
              ))}
              <motion.span
                className="inline-block bg-linear-to-r from-white via-[#ffe9c9] to-white bg-clip-text text-transparent"
                style={{ backgroundSize: '200% 100%' }}
                initial={reduce ? false : { opacity: 0, y: 34, rotateX: -55 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  backgroundPosition: ['0% 50%', '200% 50%'],
                }}
                transition={{
                  delay: 0.68,
                  type: 'spring',
                  stiffness: 90,
                  damping: 15,
                  backgroundPosition: {
                    delay: 1.6,
                    duration: 3.2,
                    repeat: Infinity,
                    repeatDelay: 2.4,
                    ease: 'linear',
                  },
                }}
              >
                seconds.
              </motion.span>
            </span>
          </motion.h1>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3 text-gray-200">
            <span className="px-3 py-1.5 rounded-full border border-white/20 text-sm bg-white/10 backdrop-blur-md">
              Action | Adventure | Sci-Fi
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <CalendarIcon className="w-4 h-4 text-[#ffc24a]" />
              2026 Blockbusters
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <ClockIcon className="w-4 h-4 text-[#ffc24a]" />
              2h 15m Avg Duration
            </span>
          </motion.div>

          <motion.p
            variants={item}
            className="max-w-lg text-[0.95rem] sm:text-lg leading-relaxed text-gray-300/90"
          >
            Discover what's worth watching, lock your favorite seats in a tap, and walk in with a
            ticket on your phone — a booking flow built for people who love the movies.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3 pt-2">
            <MagneticButton onClick={() => navigate('/movies')}>
              Explore Movies
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton as="a" href="#trailers" variant="ghost">
              <PlayCircleIcon className="w-4 h-4" />
              Watch Trailers
            </MagneticButton>
          </motion.div>
        </div>

        {/* Floating layered 3D movie ticket */}
        <motion.div
          variants={item}
          className="flex items-center justify-center lg:justify-end"
          style={{ perspective: 1400 }}
        >
          <TiltCard className="w-full max-w-sm" max={12} glare={false} scale={1.03}>
            <Hero3DTicket />
          </TiltCard>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      {!reduce && (
        <motion.div
          className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1.5">
            <motion.span
              className="h-2 w-1 rounded-full bg-[#ffc24a]"
              animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </section>
  )
}

export default HeroSection
