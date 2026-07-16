import React, { useEffect, useMemo, useState } from 'react'
import { CalendarClock, BellRing, Bell, Clock3 } from 'lucide-react'
import { fetchMovies } from '../lib/api'
import toast from 'react-hot-toast'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import useWatchlist from '../hooks/useWatchlist'
import { StaggerGroup, StaggerItem } from '../components/ui/Reveal'

// Days until release, or null if undated/past.
function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target - now) / 86400000)
  return diff
}

const releaseLabel = (dateStr) => {
  const d = daysUntil(dateStr)
  if (d === null) return 'Date to be announced'
  if (d <= 0) return 'In cinemas now'
  if (d === 1) return 'Releasing tomorrow'
  if (d < 30) return `In ${d} days`
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const ComingSoon = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const { isWatched, toggleWatch, count } = useWatchlist()

  useEffect(() => {
    let alive = true
    fetchMovies()
      .then((data) => alive && setMovies(Array.isArray(data) ? data : []))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  // Upcoming = explicitly flagged coming_soon, or a future release date.
  const upcoming = useMemo(() => {
    const list = movies.filter((m) => {
      if (m.status === 'coming_soon') return true
      const d = daysUntil(m.release_date)
      return d !== null && d > 0
    })
    return list.sort((a, b) => new Date(a.release_date || 0) - new Date(b.release_date || 0))
  }, [movies])

  const handleNotify = (movie) => {
    const added = toggleWatch(movie)
    toast.success(
      added ? `We'll remind you about ${movie.title} 🔔` : `Reminder removed for ${movie.title}`
    )
  }

  if (loading) return <Loading />

  return (
    <section className="relative section-shell overflow-hidden pt-30 md:pt-34 pb-24 min-h-[80vh]">
      <BlurCircle top="120px" left="-40px" />
      <BlurCircle bottom="50px" right="-40px" />

      <div className="reveal-up">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#f4b98d]">
          <CalendarClock className="h-3.5 w-3.5" />
          On the horizon
        </p>
        <h1 className="mt-2 text-4xl md:text-6xl">Coming Soon</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-300 md:text-base">
          The films everyone's waiting for. Tap <span className="text-white">Notify me</span> and we'll
          nudge you the moment tickets open.
          {count > 0 && (
            <span className="text-[#ffc24a]"> You're tracking {count} title{count === 1 ? '' : 's'}.</span>
          )}
        </p>
      </div>

      {upcoming.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-500">
            <CalendarClock className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl text-white">No upcoming titles just yet</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Check back soon — the next wave of premieres is always around the corner.
          </p>
        </div>
      ) : (
        <StaggerGroup
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          stagger={0.06}
        >
          {upcoming.map((movie) => {
            const watched = isWatched(movie._id)
            return (
              <StaggerItem key={movie._id}>
                <article className="group relative h-full overflow-hidden rounded-[22px] border border-white/12 bg-[#0f1628]/90">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[#ffd27a] backdrop-blur">
                      <Clock3 className="h-3 w-3" />
                      {releaseLabel(movie.release_date)}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-base font-semibold text-white">{movie.title}</h3>
                    <p className="mt-1 truncate text-xs text-gray-400">
                      {(movie.genres || []).slice(0, 2).map((g) => g.name).join(' · ') || 'Coming soon'}
                    </p>
                    <button
                      onClick={() => handleNotify(movie)}
                      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                        watched
                          ? 'bg-[#ffc24a]/15 text-[#ffd27a] border border-[#ffc24a]/40'
                          : 'bg-gradient-to-r from-[#ff5a3d] to-[#ffc24a] text-white hover:-translate-y-0.5'
                      }`}
                    >
                      {watched ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      {watched ? "You'll be notified" : 'Notify me'}
                    </button>
                  </div>
                </article>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      )}
    </section>
  )
}

export default ComingSoon
