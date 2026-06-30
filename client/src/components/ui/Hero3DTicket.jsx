import React from 'react'
import { motion } from 'framer-motion'
import { Star, Ticket, Clock3, MapPin, Play } from 'lucide-react'

/**
 * Hero3DTicket
 * A premium, layered movie boarding-pass that lives inside a <TiltCard>.
 * Each layer is pushed to a different translateZ depth, so when the parent
 * tilts, the layers parallax against each other for a real 3D feel.
 *
 * Depth map (translateZ):
 *   base panel ............  0px
 *   poster ................ 16px
 *   stub / barcode ........ 26px
 *   title block ........... 34px
 *   floating rating chip .. 72px
 *   floating play badge ... 86px
 */
const depth = (z) => ({ transform: `translateZ(${z}px)`, transformStyle: 'preserve-3d' })

const seatRow = ['A7', 'A8', 'A9']

const Hero3DTicket = ({
  poster = 'https://image.tmdb.org/t/p/w500/m9EtP1Yrzv6v7dMaC9mRaGhd1um.jpg',
  title = 'Thunderbolts*',
}) => {
  return (
    <div className="cs-ticket3d float-y relative w-full" style={{ transformStyle: 'preserve-3d' }}>
      {/* soft floor shadow that sells the float */}
      <div className="cs-ticket3d-shadow" aria-hidden />

      {/* ===== main glass panel ===== */}
      <div
        className="relative overflow-hidden rounded-[26px] border border-white/12 p-5 md:p-6"
        style={{
          ...depth(0),
          background:
            'linear-gradient(155deg, rgba(28,32,46,0.92) 0%, rgba(14,17,28,0.92) 60%, rgba(10,12,20,0.95) 100%)',
          boxShadow:
            '0 40px 90px -30px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* sheen sweep */}
        <span className="cs-ticket3d-sheen" aria-hidden />

        {/* header row */}
        <div className="flex items-center justify-between" style={depth(34)}>
          <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#ffce8a]">
            <Ticket className="h-3.5 w-3.5" />
            CineSnap Pass
          </span>
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-white/40">
            IMAX · Dolby
          </span>
        </div>

        {/* poster + details */}
        <div className="mt-4 flex gap-4" style={depth(16)}>
          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img
              src={poster}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5" style={depth(34)}>
            <div>
              <h3 className="truncate text-xl font-bold leading-tight text-white">{title}</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/55">
                <MapPin className="h-3 w-3 text-[#ffc24a]" />
                Screen 4 · Row A
              </p>
            </div>

            <div className="flex items-center gap-3 text-[0.7rem] text-white/70">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3 text-[#ffc24a]" />
                8:30 PM
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-[#ffc24a] text-[#ffc24a]" />
                7.4
              </span>
            </div>
          </div>
        </div>

        {/* seat chips */}
        <div className="mt-4 flex items-center gap-2" style={depth(30)}>
          <span className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">Seats</span>
          {seatRow.map((s) => (
            <span
              key={s}
              className="rounded-lg border border-[#ffb55e]/35 bg-[#ffb55e]/12 px-2 py-1 text-[0.7rem] font-semibold text-[#ffe0b3]"
            >
              {s}
            </span>
          ))}
        </div>

        {/* perforation divider */}
        <div className="relative my-4" style={depth(20)}>
          <span className="cs-perf-notch -left-8" aria-hidden />
          <span className="cs-perf-notch -right-8" aria-hidden />
          <div className="cs-perf-line" />
        </div>

        {/* stub: barcode + total */}
        <div className="flex items-end justify-between" style={depth(26)}>
          <div className="cs-barcode" aria-hidden />
          <div className="text-right">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Total</p>
            <p className="text-lg font-bold text-white">$37.50</p>
          </div>
        </div>
      </div>

      {/* ===== floating rating chip (pops toward viewer) ===== */}
      <motion.div
        className="absolute -left-5 top-8 flex items-center gap-2 rounded-2xl border border-white/15 bg-[#11131f]/85 px-3 py-2 backdrop-blur-xl"
        style={{ ...depth(72), boxShadow: '0 24px 50px -18px rgba(0,0,0,0.8)' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 90 }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/20 text-[#4ade80]">
          <Star className="h-4 w-4 fill-current" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">4.9 / 5</p>
          <p className="text-[0.6rem] text-white/50">12k reviews</p>
        </div>
      </motion.div>

      {/* ===== floating play badge ===== */}
      <motion.div
        className="absolute -right-4 bottom-12 flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          ...depth(86),
          background: 'linear-gradient(135deg, #ff5a3d, #ffc24a)',
          boxShadow: '0 18px 40px -10px rgba(255,90,61,0.6)',
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
      </motion.div>
    </div>
  )
}

export default Hero3DTicket
