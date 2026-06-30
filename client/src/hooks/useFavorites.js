import { useCallback, useEffect, useState } from 'react'

/**
 * useFavorites
 * Lightweight wishlist backed by localStorage, synced across every component
 * instance (and browser tabs) via a custom event + the native `storage` event.
 * Stores the full movie objects so the Favorites page can render without a fetch.
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
  const [favorites, setFavorites] = useState(read)

  useEffect(() => {
    const sync = () => setFavorites(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

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
    write(next)
    setFavorites(next)
    return !exists
  }, [])

  const clearFavorites = useCallback(() => {
    write([])
    setFavorites([])
  }, [])

  return { favorites, isFavorite, toggleFavorite, clearFavorites, count: favorites.length }
}
