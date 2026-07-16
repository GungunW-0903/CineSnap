import { useCallback, useEffect, useState } from 'react'

/**
 * useWatchlist
 * A "notify me" list for upcoming releases, persisted in localStorage and
 * synced across hook instances / tabs via a custom event. Purely client-side
 * (no backend) — mirrors the storage approach used by useFavorites.
 */
const STORAGE_KEY = 'cinesnap:watchlist'
const EVENT = 'cinesnap:watchlist-changed'

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {
    /* storage may be unavailable (private mode) — fail silently */
  }
}

export default function useWatchlist() {
  const [watchlist, setWatchlist] = useState(read)

  useEffect(() => {
    const sync = () => setWatchlist(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const isWatched = useCallback(
    (id) => watchlist.some((m) => String(m._id) === String(id)),
    [watchlist]
  )

  const toggleWatch = useCallback((movie) => {
    const current = read()
    const exists = current.some((m) => String(m._id) === String(movie._id))
    const next = exists
      ? current.filter((m) => String(m._id) !== String(movie._id))
      : [{ _id: movie._id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date }, ...current]
    write(next)
    setWatchlist(next)
    return !exists
  }, [])

  return { watchlist, isWatched, toggleWatch, count: watchlist.length }
}
