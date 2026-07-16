import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket, Sparkles, Volume2, Armchair, Box, Projector, Check } from 'lucide-react'
import { fetchMovies } from '../lib/api'
import BlurCircle from '../components/BlurCircle'
import TiltCard from '../components/ui/TiltCard'
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal'

// Premium formats mirror the pricing tiers used by the booking seed
// (server/seed.js BASE_PRICES). Each lounge highlights one signature format.
const LOUNGES = [
  {
    key: 'imax',
    name: 'IMAX Laser',
    format: 'IMAX',
    icon: Projector,
    price: 600,
    tagline: 'The biggest screen in the city.',
    description:
      'A floor-to-ceiling screen paired with crystal-clear IMAX Laser projection — every frame is bigger, brighter, and sharper than life.',
    perks: ['4K laser projection', '12-channel immersive sound', 'Floor-to-ceiling screen'],
    accent: '#4ea1ff',
  },
  {
    key: 'dolby',
    name: 'Dolby Atmos Suite',
    format: 'Dolby',
    icon: Volume2,
    price: 450,
    tagline: 'Sound that moves all around you.',
    description:
      'Object-based Dolby Atmos audio flows above and around you, while Dolby Vision HDR delivers deep blacks and dazzling highlights.',
    perks: ['Dolby Atmos 3D audio', 'Dolby Vision HDR', 'Acoustically tuned hall'],
    accent: '#c07bff',
  },
  {
    key: '4dx',
    name: '4DX Motion Lounge',
    format: '4DX',
    icon: Box,
    price: 750,
    tagline: 'Feel every scene in your seat.',
    description:
      'Motion seats sync to the action with wind, water, scent, and rumble effects — the most physical way to watch a blockbuster.',
    perks: ['Motion-synced seats', 'Wind, water & scent FX', 'Best for action epics'],
    accent: '#ff7a5f',
  },
  {
    key: 'recliner',
    name: 'Recliner Premiere',
    format: 'Dolby',
    icon: Armchair,
    price: 500,
    tagline: 'First-class comfort, gourmet service.',
    description:
      'Fully-reclining leather loungers with a personal side table, in-seat gourmet dining, and unlimited legroom for the ultimate slow evening.',
    perks: ['Full-recline leather loungers', 'In-seat gourmet dining', 'Priority entry & parking'],
    accent: '#ffc24a',
  },
]

const CineLounges = () => {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])

  useEffect(() => {
    let alive = true
    fetchMovies().then((data) => alive && setMovies(data))
    return () => {
      alive = false
    }
  }, [])

  // Top-rated titles supply the featured artwork behind each lounge card.
  const featured = useMemo(
    () =>
      [...movies]
        .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
        .slice(0, LOUNGES.length),
    [movies]
  )

  const goBook = () => {
    navigate('/movies')
    window.scrollTo(0, 0)
  }

  return (
    <section className="relative section-shell overflow-hidden pt-30 md:pt-34 pb-24 min-h-[80vh]">
      <BlurCircle top="120px" left="-40px" />
      <BlurCircle bottom="50px" right="-40px" />

      <div className="reveal-up">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#f4b98d]">
          <Sparkles className="h-3.5 w-3.5" />
          Premium experiences
        </p>
        <h1 className="mt-2 text-4xl md:text-6xl">Cine Lounges</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-300 md:text-base">
          Go beyond the ordinary screen. Pick a signature format — IMAX, Dolby Atmos, 4DX motion,
          or a fully-reclining premiere lounge — and turn your next movie into an event.
        </p>
      </div>

      <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2" stagger={0.08}>
        {LOUNGES.map((lounge, i) => {
          const Icon = lounge.icon
          const art = featured[i]
          return (
            <StaggerItem key={lounge.key} className="h-full">
              <TiltCard max={8} glare className="h-full">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/12 bg-[#0f1628]/90">
                  {/* featured artwork header */}
                  <div className="relative h-44 overflow-hidden">
                    {art && (
                      <img
                        src={art.backdrop_path || art.poster_path}
                        alt={art.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1628] via-[#0f1628]/50 to-transparent" />
                    <div
                      className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl backdrop-blur-md"
                      style={{ backgroundColor: `${lounge.accent}26`, color: lounge.accent }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                      {lounge.format}
                    </span>
                    {art && (
                      <p className="absolute bottom-3 left-4 text-xs text-white/70">
                        Now playing in {lounge.name}: <span className="text-white">{art.title}</span>
                      </p>
                    )}
                  </div>

                  {/* body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-2xl">{lounge.name}</h3>
                    <p className="mt-1 text-sm font-medium" style={{ color: lounge.accent }}>
                      {lounge.tagline}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-300">
                      {lounge.description}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {lounge.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2 text-sm text-gray-200">
                          <Check className="h-4 w-4 shrink-0" style={{ color: lounge.accent }} />
                          {perk}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <div>
                        <p className="text-xs text-gray-400">Starting from</p>
                        <p className="text-2xl font-semibold">
                          ₹{lounge.price}
                          <span className="text-sm font-normal text-gray-400"> / seat</span>
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ y: -2 }}
                        onClick={goBook}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff5a3d] to-[#ffc24a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff5a3d]/25"
                      >
                        <Ticket className="h-4 w-4" />
                        Book Experience
                      </motion.button>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </StaggerItem>
          )
        })}
      </StaggerGroup>

      {/* closing CTA */}
      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-12 text-center">
          <h3 className="text-2xl md:text-3xl">Can't decide? Browse every show.</h3>
          <p className="mt-2 max-w-md text-sm text-gray-400">
            Explore the full lineup and choose your format at checkout.
          </p>
          <button onClick={goBook} className="btn-cinesnap mt-6 px-7">
            Explore all movies
          </button>
        </div>
      </Reveal>
    </section>
  )
}

export default CineLounges
