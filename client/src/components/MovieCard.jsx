import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StarIcon, Ticket, Heart, Play, Clock3, Flame } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import TiltCard from './ui/TiltCard'
import useFavorites from '../hooks/useFavorites'
import TrailerModal from './TrailerModal'

const depth = (z) => ({ transform: `translateZ(${z}px)`, transformStyle: 'preserve-3d' })

const MovieCard = ({ movie, index = 0, rank }) => {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(movie._id)
  const [showTrailer, setShowTrailer] = useState(false)

  const goToMovie = () => {
    navigate(`/movies/${movie._id}`)
    window.scrollTo(0, 0)
  }

  // "Book" takes the user straight into the booking flow (date/showtime picker),
  // not just the top of the details page.
  const goToBooking = (e) => {
    e.stopPropagation()
    navigate(`/movies/${movie._id}`, { state: { scrollToBooking: true } })
    window.scrollTo(0, 0)
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : ''
  const genreText = (movie.genres || []).slice(0, 2).map((g) => g.name).join(' · ')
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—'
  const isHot = movie.vote_average >= 7

  return (
    <div className="group/card relative" style={{ perspective: 1100 }}>
      {/* hover glow halo */}
      <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-[radial-gradient(circle_at_50%_30%,rgba(255,90,61,0.35),transparent_70%)] opacity-0 blur-xl transition-opacity duration-500 group-hover/card:opacity-100" />

      <TiltCard max={11} glare scale={1.03} className="h-full">
        <article className="relative h-full overflow-hidden rounded-[22px] border border-white/12 bg-[#0f1628]/90 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]">
          {/* ===== poster ===== */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              onClick={goToMovie}
              src={movie.poster_path}
              alt={movie.title}
              loading="lazy"
              className="h-full w-full cursor-pointer object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
            />
            {/* base gradient for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/15 to-transparent" />

            {/* top badges */}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3" style={depth(36)}>
              <button
                type="button"
                aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={faved}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(movie)
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
                  faved
                    ? 'border-[#ff5a3d]/60 bg-[#ff5a3d]/25 text-[#ff7a5f]'
                    : 'border-white/20 bg-black/40 text-white/80 hover:text-white'
                }`}
              >
                <motion.span
                  key={faved ? 'on' : 'off'}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: faved ? [1.4, 1] : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                >
                  <Heart className="h-4 w-4" fill={faved ? 'currentColor' : 'none'} />
                </motion.span>
              </button>

              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                <StarIcon className="h-3.5 w-3.5 fill-[#ffc24a] text-[#ffc24a]" />
                {rating}
              </span>
            </div>

            {/* rank / trending chip */}
            {(rank || isHot) && (
              <div className="absolute left-3 top-14 flex flex-col gap-1.5" style={depth(30)}>
                {rank && (
                  <span className="w-fit rounded-md bg-white/95 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[#0b1120]">
                    #{rank}
                  </span>
                )}
                {isHot && (
                  <span className="inline-flex w-fit items-center gap-1 rounded-md bg-[#ff5a3d]/90 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
                    <Flame className="h-3 w-3" />
                    Trending
                  </span>
                )}
              </div>
            )}

            {/* hover quick-actions panel */}
            <div
              className="absolute inset-x-0 bottom-0 translate-y-4 p-4 opacity-0 transition-all duration-400 group-hover/card:translate-y-0 group-hover/card:opacity-100"
              style={depth(48)}
            >
              <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-white/75">
                {movie.overview}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToBooking}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff5a3d] to-[#ffc24a] py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff5a3d]/30 transition-transform hover:-translate-y-0.5"
                >
                  <Ticket className="h-4 w-4" />
                  Book
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (movie.trailer_url) setShowTrailer(true)
                    else goToMovie()
                  }}
                  aria-label="Watch trailer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  <Play className="h-4 w-4 translate-x-0.5 fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* ===== meta (always visible) ===== */}
          <div className="p-4">
            <h3 className="truncate text-base font-semibold leading-tight text-white">{movie.title}</h3>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
              <span>{year}</span>
              {genreText && <span className="text-gray-600">•</span>}
              <span className="truncate">{genreText}</span>
            </div>
            <p className="mt-1 inline-flex items-center gap-1 text-[0.7rem] text-gray-500">
              <Clock3 className="h-3 w-3" />
              {timeFormat(movie.runtime)}
            </p>
          </div>
        </article>
      </TiltCard>

      {showTrailer && (
        <TrailerModal
          url={movie.trailer_url}
          title={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  )
}

export default MovieCard
