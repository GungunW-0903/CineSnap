import { useCallback, useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { fetchFavorites, toggleFavoriteApi } from '../lib/api'

/**
 * useFavorites
 * A wishlist backed by the API (persists per user, across devices) with a
 * localStorage mirror for instant/offline rendering. Toggles update the UI
 * optimistically, then reconcile with the server.
 *
 * Stores full movie objects so the Favorites page renders without a fetch.
 */
const STORAGE_KEY = 'cinesnap:favorites'
const EVENT = 'cinesnap:favorites-changed'

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

export default function useFavorites() {
  const { user } = useUser()
  const [favorites, setFavorites] = useState(read)

  // Keep every hook instance (and other tabs) in sync via events.
  useEffect(() => {
    const sync = () => setFavorites(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // On load / user change, hydrate from the backend (source of truth).
  useEffect(() => {
    let cancelled = false
    fetchFavorites(user).then((serverList) => {
      if (cancelled || !Array.isArray(serverList)) return
      // Server is authoritative; only overwrite local if it returned data
      // (empty server + non-empty local likely means offline — keep local).
      if (serverList.length > 0 || read().length === 0) {
        write(serverList)
        setFavorites(serverList)
      }
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const isFavorite = useCallback(
    (id) => favorites.some((m) => String(m._id) === String(id)),
    [favorites]
  )

  const toggleFavorite = useCallback((movie) => {
    const current = read()
    const exists = current.some((m) => String(m._id) === String(movie._id))
    const next = exists
      ? current.filter((m) => String(m._id) !== String(movie._id))
      : [{ ...movie }, ...current]

    // Optimistic local update…
    write(next)
    setFavorites(next)
    // …then persist to the backend (best-effort).
    toggleFavoriteApi(movie._id, user)
    return !exists
  }, [user])

  const clearFavorites = useCallback(() => {
    const current = read()
    write([])
    setFavorites([])
    // Toggle each off on the server too.
    current.forEach((m) => toggleFavoriteApi(m._id, user))
  }, [user])

  return { favorites, isFavorite, toggleFavorite, clearFavorites, count: favorites.length }
}
