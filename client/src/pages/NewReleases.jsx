import React, { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { fetchMovies } from '../lib/api'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { StaggerGroup, StaggerItem } from '../components/ui/Reveal'

const CardSkeleton = () => (
  <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0f1628]/70">
    <div className="aspect-[2/3] animate-pulse bg-white/5" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
    </div>
  </div>
)

// Movies released within this many months are flagged as "NEW".
const NEW_WINDOW_MONTHS = 18

const NewReleases = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchMovies()
      // Unreleased titles belong on Coming Soon, not in the new-releases rail.
      .then((data) => alive && setMovies(data.filter((m) => m.status !== 'coming_soon')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  // Newest first. Undated titles sink to the bottom.
  const sorted = useMemo(
    () =>
      [...movies].sort(
        (a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0)
      ),
    [movies]
  )

  const newestYear = sorted.length
    ? new Date(sorted[0].release_date || 0).getFullYear()
    : null

  const isNew = (m) => {
    if (!m.release_date) return false
    const released = new Date(m.release_date)
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - NEW_WINDOW_MONTHS)
    return released >= cutoff
  }

  return (
    <section className="relative section-shell overflow-hidden pt-30 md:pt-34 pb-24 min-h-[80vh]">
      <BlurCircle top="120px" right="-40px" />
      <BlurCircle bottom="50px" left="-40px" />

      <div className="reveal-up">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#f4b98d]">
          <Sparkles className="h-3.5 w-3.5" />
          Fresh in cinemas
        </p>
        <h1 className="mt-2 text-4xl md:text-6xl">New Releases</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-300 md:text-base">
          The latest premieres, straight off the marquee{newestYear ? ` — from ${newestYear} back through the season's biggest hits` : ''}.
          Book the newest arrivals before the buzz peaks.
        </p>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <StaggerGroup
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          stagger={0.06}
        >
          {sorted.map((movie, i) => (
            <StaggerItem key={movie._id}>
              <div className="relative">
                {isNew(movie) && (
                  <span className="absolute -top-2 left-3 z-20 rounded-full bg-gradient-to-r from-[#ff5a3d] to-[#ffc24a] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-lg">
                    New
                  </span>
                )}
                <MovieCard movie={movie} index={i} />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </section>
  )
}

export default NewReleases
