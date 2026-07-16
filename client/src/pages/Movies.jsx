import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, Film } from 'lucide-react'
import { fetchMovies } from '../lib/api'
import MovieCard from '../components/MovieCard'
import MovieSpotlight from '../components/MovieSpotlight'
import BlurCircle from '../components/BlurCircle'
import { StaggerGroup, StaggerItem } from '../components/ui/Reveal'

const SORTS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'newest', label: 'Newest' },
  { key: 'title', label: 'A–Z' },
  { key: 'runtime', label: 'Longest' },
]

// Friendly labels for the ISO language codes in the catalogue.
const LANGUAGE_LABELS = {
  hi: 'Hindi',
  en: 'English',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  bn: 'Bengali',
  mr: 'Marathi',
  pa: 'Punjabi',
}

const languageLabel = (code) =>
  LANGUAGE_LABELS[code] || (code ? code.toUpperCase() : 'Other')

const CardSkeleton = () => (
  <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0f1628]/70">
    <div className="aspect-[2/3] animate-pulse bg-white/5" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
    </div>
  </div>
)

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('All')
  const [language, setLanguage] = useState('All')
  const [sort, setSort] = useState('rating')

  useEffect(() => {
    let alive = true
    fetchMovies()
      // Coming-soon titles live on the Coming Soon page — this is "now showing".
      .then((data) => alive && setMovies(data.filter((m) => m.status !== 'coming_soon')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  // unique genres from the catalogue
  const genres = useMemo(() => {
    const set = new Set()
    movies.forEach((m) => (m.genres || []).forEach((g) => set.add(g.name)))
    return ['All', ...Array.from(set).sort()]
  }, [movies])

  // unique languages present in the catalogue (as {code,label})
  const languages = useMemo(() => {
    const set = new Set()
    movies.forEach((m) => m.original_language && set.add(m.original_language))
    const list = Array.from(set)
      .map((code) => ({ code, label: languageLabel(code) }))
      .sort((a, b) => a.label.localeCompare(b.label))
    return [{ code: 'All', label: 'All languages' }, ...list]
  }, [movies])

  // top picks for the spotlight (highest rated, unique)
  const spotlight = useMemo(
    () => [...movies].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)).slice(0, 5),
    [movies]
  )

  const visible = useMemo(() => {
    let list = movies
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((m) => m.title.toLowerCase().includes(q))
    }
    if (genre !== 'All') {
      list = list.filter((m) => (m.genres || []).some((g) => g.name === genre))
    }
    if (language !== 'All') {
      list = list.filter((m) => m.original_language === language)
    }
    list = [...list].sort((a, b) => {
      if (sort === 'rating') return (b.vote_average || 0) - (a.vote_average || 0)
      if (sort === 'newest') return new Date(b.release_date) - new Date(a.release_date)
      if (sort === 'runtime') return (b.runtime || 0) - (a.runtime || 0)
      if (sort === 'title') return a.title.localeCompare(b.title)
      return 0
    })
    return list
  }, [movies, query, genre, language, sort])

  const hasFilters = query.trim() || genre !== 'All' || language !== 'All'

  return (
    <section className="relative section-shell overflow-hidden pt-30 md:pt-34 pb-24 min-h-[80vh]">
      <BlurCircle top="120px" left="-40px" />
      <BlurCircle bottom="50px" right="-40px" />

      {/* heading */}
      <div className="reveal-up">
        <p className="text-xs uppercase tracking-[0.2em] text-[#f4b98d]">Movie library</p>
        <h1 className="mt-2 text-4xl md:text-6xl">Now showing</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-300 md:text-base">
          Browse trending films, compare ratings, save your favorites, and secure seats in one
          smooth booking flow.
        </p>
      </div>

      {/* spotlight */}
      {!loading && spotlight.length > 0 && (
        <div className="mt-8 reveal-up reveal-delay-1">
          <MovieSpotlight movies={spotlight} />
        </div>
      )}

      {/* toolbar: search + sort */}
      <div className="mt-10 flex flex-col gap-4 reveal-up reveal-delay-1 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies…"
            className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-10 text-sm text-white placeholder-gray-500 outline-none transition focus:border-[#ffc24a]/40 focus:bg-white/8"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-gray-400 sm:inline-flex">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Sort
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  sort === s.key
                    ? 'bg-white text-[#0b1120]'
                    : 'border border-white/15 text-gray-300 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* genre chips */}
      <div className="mt-4 flex flex-wrap gap-2 reveal-up reveal-delay-2">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              genre === g
                ? 'border border-[#ffc24a]/50 bg-[#ffc24a]/15 text-[#ffd27a]'
                : 'border border-white/12 text-gray-400 hover:border-white/25 hover:text-white'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* language pills */}
      {languages.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2 reveal-up reveal-delay-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                language === l.code
                  ? 'border border-[#ff5a3d]/50 bg-[#ff5a3d]/15 text-[#ff9a7a]'
                  : 'border border-white/12 text-gray-400 hover:border-white/25 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* results count */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {loading ? 'Loading…' : `${visible.length} movie${visible.length === 1 ? '' : 's'}`}
          {hasFilters && !loading && (
            <button
              onClick={() => {
                setQuery('')
                setGenre('All')
                setLanguage('All')
              }}
              className="ml-3 text-xs text-[#ffc24a] hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

      {/* grid / skeleton / empty */}
      {loading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <StaggerGroup
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          stagger={0.06}
        >
          <AnimatePresence mode="popLayout">
            {visible.map((movie, i) => (
              <StaggerItem key={movie._id} layout>
                <MovieCard movie={movie} index={i} rank={sort === 'rating' ? i + 1 : undefined} />
              </StaggerItem>
            ))}
          </AnimatePresence>
        </StaggerGroup>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-500">
            <Film className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl text-white">No movies match your search</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Try a different title or genre — your next favorite film is one tap away.
          </p>
          <button
            onClick={() => {
              setQuery('')
              setGenre('All')
              setLanguage('All')
            }}
            className="btn-cinesnap mt-6 px-6"
          >
            Reset filters
          </button>
        </motion.div>
      )}
    </section>
  )
}

export default Movies
