// API utility for connecting frontend to backend.
// Every call degrades gracefully to bundled sample data so the UI never
// shows an empty/error state while the backend is offline or unconfigured.
import { dummyShowsData } from '../assets/assets'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:5000/api' : '')

// Remove entries that share an _id so React keys stay unique.
function dedupeById(list) {
  const seen = new Set()
  return list.filter((item) => {
    if (!item || seen.has(item._id)) return false
    seen.add(item._id)
    return true
  })
}

// Try the backend with a short timeout; fall back to sample data on any failure.
async function tryFetch(path, { timeout = 4000 } = {}) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(id)
  }
}

export async function fetchMovies() {
  try {
    const data = await tryFetch('/movies')
    const list = Array.isArray(data) ? data : data?.movies
    if (Array.isArray(list) && list.length > 0) {
      return dedupeById(list)
    }
    throw new Error('Empty movie list')
  } catch (err) {
    // Backend unavailable or empty — use the bundled catalogue.
    if (import.meta.env.DEV) {
      console.warn('[CineSnap] Using sample movie data —', err.message)
    }
    return dedupeById(dummyShowsData)
  }
}

export async function fetchMovieById(id) {
  try {
    const data = await tryFetch(`/movies/${id}`)
    if (data && data._id) return data
    throw new Error('Movie not found')
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[CineSnap] Using sample movie data —', err.message)
    }
    return dummyShowsData.find((m) => String(m._id) === String(id)) || null
  }
}
