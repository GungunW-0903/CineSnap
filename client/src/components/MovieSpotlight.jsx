import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { StarIcon, Ticket, Play, Clock3, CalendarDays, Heart } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import useFavorites from '../hooks/useFavorites'

/**
 * MovieSpotlight
 * A cinematic auto-rotating hero for the Movies page. Crossfades through the
 * top picks with a slow Ken-Burns zoom on the backdrop and a staggered info
 * panel. Thumbnail rail lets users jump to any feature.
 */
const MovieSpotlight = ({ movies = [], interval = 6000 }) => {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [active, setActive] = useState(0)

  const list = movies.slice(0, 5)

  useEffect(() => {
    if (reduce || list.length <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % list.length), interval)
    return () => clearInterval(id)
  }, [reduce, list.length, interval])

  if (list.length === 0) return null
  const movie = list[active]
  const faved = isFavorite(movie._id)
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : ''

  const book = () => {
    navigate(`/movies/${movie._id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black">
      {/* ===== backdrop layer (crossfade + ken burns) ===== */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={movie._id + active}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: reduce ? 1.08 : 1.18 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1 }, scale: { duration: interval / 1000 + 1, ease: 'linear' } }}
            style={{
              backgroundImage: `url(${movie.backdrop_path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>
        {/* legibility scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/85 to-[#070b14]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent" />
      </div>

      {/* ===== content ===== */}
      <div className="relative z-10 grid gap-6 p-6 sm:p-9 md:p-12 lg:grid-cols-[1.5fr_1fr]">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie._id + active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 0.9, 0.31, 1] }}
            className="flex max-w-xl flex-col justify-center"
          >
            <span className="cs-kicker">Featured tonight</span>
            <h2 className="display-font mt-2 text-3xl leading-[1.05] sm:text-4xl md:text-5xl">
              {movie.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-200">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ffc24a]/30 bg-[#ffc24a]/10 px-2.5 py-1">
                <StarIcon className="h-3.5 w-3.5 fill-[#ffc24a] text-[#ffc24a]" />
                {typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-[#ffc24a]" />
                {year}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-[#ffc24a]" />
                {timeFormat(movie.runtime)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(movie.genres || []).slice(0, 3).map((g) => (
                <span
                  key={g.id || g.name}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-gray-200"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-300 line-clamp-3">
              {movie.overview}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={book}
                className="btn-cinesnap px-6"
              >
                <Ticket className="h-4 w-4" />
                Book tickets
              </button>
              <button
                onClick={book}
                className="btn-cinesnap btn-cinesnap-ghost px-6"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch trailer
              </button>
              <button
                onClick={() => toggleFavorite(movie)}
                aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                  faved
                    ? 'border-[#ff5a3d]/60 bg-[#ff5a3d]/20 text-[#ff7a5f]'
                    : 'border-white/20 bg-white/5 text-white/80 hover:text-white'
                }`}
              >
                <Heart className="h-5 w-5" fill={faved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ===== thumbnail rail ===== */}
        <div className="flex items-end justify-start gap-3 lg:justify-end">
          {list.map((m, i) => (
            <button
              key={m._id + i}
              onClick={() => setActive(i)}
              aria-label={`Show ${m.title}`}
              className={`relative h-24 w-16 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 sm:h-28 sm:w-20 ${
                i === active
                  ? 'border-[#ffc24a] scale-105 shadow-lg shadow-[#ffc24a]/20'
                  : 'border-white/15 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={m.poster_path} alt={m.title} loading="lazy" className="h-full w-full object-cover" />
              {i === active && !reduce && (
                <motion.span
                  className="absolute bottom-0 left-0 h-1 bg-[#ffc24a]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: interval / 1000, ease: 'linear' }}
                  key={active}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MovieSpotlight
