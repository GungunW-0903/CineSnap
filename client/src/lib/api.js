// API utility for connecting frontend to backend.
// Every call degrades gracefully to bundled sample data so the UI never
// shows an empty/error state while the backend is offline or unconfigured.
import { dummyShowsData, dummyDateTimeData, dummyBookingData } from '../assets/assets'
import { identityHeaders, getIdentity } from './identity'

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

async function fetchWithTimeout(path, timeout) {
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

// Try the backend, falling back to sample data on failure. Render's free tier
// spins down after inactivity and can take 50+ seconds to wake up, so a first
// attempt that aborts (rather than a real 4xx/5xx) gets one retry with a much
// longer timeout before we give up and use bundled sample data.
async function tryFetch(path, { timeout = 6000 } = {}) {
  try {
    return await fetchWithTimeout(path, timeout)
  } catch (err) {
    if (err.name === 'AbortError') {
      return await fetchWithTimeout(path, 55000)
    }
    throw err
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

// Trending movies (top by popularity/views). Falls back to sample data.
export async function fetchTrending(limit = 8) {
  try {
    const data = await tryFetch(`/movies/trending?limit=${limit}`)
    const list = Array.isArray(data) ? data : data?.movies
    if (Array.isArray(list) && list.length > 0) return dedupeById(list)
    throw new Error('Empty trending list')
  } catch {
    return dedupeById(dummyShowsData).filter((m) => m.status !== 'coming_soon').slice(0, limit)
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

// ---------------------------------------------------------------------------
// Shows, bookings & payment
// ---------------------------------------------------------------------------

async function requestOnce(path, { method, body, user, timeout }) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...identityHeaders(user) },
      body: body ? JSON.stringify(body) : undefined,
    })
    let data = null
    try {
      data = await res.json()
    } catch {
      /* non-JSON */
    }
    if (!res.ok) {
      throw new Error(data?.error || `Request failed: ${res.status}`)
    }
    return data
  } finally {
    clearTimeout(id)
  }
}

// Authenticated JSON request. Throws on a non-2xx so callers can surface the
// backend's error message. `user` is an optional Clerk user for identity.
// Retries once with a long timeout if the first attempt aborts — Render's
// free tier can take 50+ seconds to wake from a cold start.
async function request(path, { method = 'GET', body, user, timeout = 8000 } = {}) {
  try {
    return await requestOnce(path, { method, body, user, timeout })
  } catch (err) {
    if (err.name === 'AbortError') {
      return await requestOnce(path, { method, body, user, timeout: 55000 })
    }
    throw err
  }
}

// Returns showtimes grouped by date: { 'YYYY-MM-DD': [{ showId, time, ticketPrice }] }
// Falls back to bundled sample showtimes so the UI still works offline.
export async function fetchShowsForMovie(movieId) {
  try {
    const data = await tryFetch(`/shows/movie/${movieId}`)
    if (data?.dates && Object.keys(data.dates).length > 0) return data.dates
    throw new Error('No showtimes')
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[CineSnap] Using sample showtimes —', err.message)
    }
    return dummyDateTimeData
  }
}

// Full show including occupiedSeats. Best-effort — returns null on failure.
export async function fetchShowById(showId) {
  try {
    return await tryFetch(`/shows/${showId}`)
  } catch {
    return null
  }
}

// A single booking (for the checkout / order-summary screen).
export async function fetchBookingById(id, user) {
  try {
    return await request(`/bookings/${id}`, { user })
  } catch {
    return null
  }
}

// Start a real Stripe Checkout session. Returns { ok, url? , error? }.
// When Stripe keys aren't configured the backend returns 503 → { ok:false }.
export async function createStripeCheckout(bookingId, user) {
  try {
    const data = await request('/payment/create-checkout-session', {
      method: 'POST',
      body: { bookingId },
      user,
    })
    return { ok: true, url: data.url }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// Razorpay
// ---------------------------------------------------------------------------

// Which real payment methods the backend has keys for. Safe defaults offline.
export async function fetchPaymentConfig() {
  try {
    return await tryFetch('/payment/config')
  } catch {
    return { razorpay: { enabled: false }, stripe: { enabled: false } }
  }
}

// Loads Razorpay's checkout.js exactly once. Resolves true when window.Razorpay
// is available, false if the script can't load (offline / blocked).
let razorpayScriptPromise = null
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (razorpayScriptPromise) return razorpayScriptPromise
  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => {
      razorpayScriptPromise = null // allow a retry on the next attempt
      resolve(false)
    }
    document.body.appendChild(script)
  })
  return razorpayScriptPromise
}

// Create a Razorpay order for a booking. Returns { ok, order?, error? } where
// order = { orderId, amount (paise), currency, keyId, booking }.
export async function createRazorpayOrder(bookingId, user, ticketEmail) {
  try {
    const data = await request('/payment/razorpay/order', {
      method: 'POST',
      body: { bookingId, ticketEmail },
      user,
    })
    return { ok: true, order: data }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Verify a completed Razorpay payment (signature check happens server-side).
// Returns { ok, booking?, emailPreview?, error? }.
export async function verifyRazorpayPayment(payload, user) {
  try {
    const data = await request('/payment/razorpay/verify', {
      method: 'POST',
      body: payload,
      user,
    })
    return { ok: true, booking: data.booking, emailPreview: data.emailPreview }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Create a booking. Returns { ok, booking?, error? }.
export async function createBooking({ showId, seats }, user) {
  try {
    const data = await request('/bookings', { method: 'POST', body: { showId, seats }, user })
    return { ok: true, booking: data.booking, movieTitle: data.movieTitle }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Simulate/confirm payment (dev-confirm in non-prod).
// Returns { ok, booking?, emailPreview?, error? }.
export async function confirmBookingPayment(bookingId, user, ticketEmail) {
  try {
    const data = await request('/payment/dev-confirm', { method: 'POST', body: { bookingId, ticketEmail }, user })
    return { ok: true, booking: data.booking, emailPreview: data.emailPreview }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

// Movies the current user has favorited (array of movie objects). [] on failure.
export async function fetchFavorites(user) {
  const { userId } = getIdentity(user)
  try {
    const data = await request(`/favorites/${userId}`, { user })
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// Toggle a favorite. Returns { ok, favorited?, error? }.
export async function toggleFavoriteApi(movieId, user) {
  try {
    const data = await request('/favorites/toggle', { method: 'POST', body: { movieId }, user })
    return { ok: true, favorited: data.favorited }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

// Reviews for a movie: { reviews, count, average }. Safe empty default.
export async function fetchMovieReviews(movieId) {
  try {
    const data = await tryFetch(`/reviews/movie/${movieId}`)
    return { reviews: data.reviews || [], count: data.count || 0, average: data.average ?? null }
  } catch {
    return { reviews: [], count: 0, average: null }
  }
}

// Create/update the current user's review. Returns { ok, review?, error? }.
export async function submitReview({ movieId, rating, comment }, user) {
  try {
    const review = await request('/reviews', { method: 'POST', body: { movieId, rating, comment }, user })
    return { ok: true, review }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Like a review. Returns { ok, likes?, error? }.
export async function likeReview(id, user) {
  try {
    const review = await request(`/reviews/${id}/like`, { method: 'POST', user })
    return { ok: true, likes: review.likes }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Apply a promo code to a booking. Returns { ok, discount?, totalAmount?, error? }.
export async function applyPromo(bookingId, code, user) {
  try {
    const data = await request(`/bookings/${bookingId}/promo`, { method: 'POST', body: { code }, user })
    return { ok: true, discount: data.discount, totalAmount: data.totalAmount, originalAmount: data.originalAmount, label: data.promo?.label }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Verify a ticket by its booking code (what the QR encodes). Public.
export async function verifyTicket(code) {
  try {
    return await tryFetch(`/bookings/verify/${code}`)
  } catch (err) {
    return { valid: false, state: 'error', message: err.message }
  }
}

// Check a ticket in at the door (marks it used). Returns { ok, message }.
export async function checkInTicket(code) {
  try {
    const data = await request(`/bookings/verify/${code}/checkin`, { method: 'POST' })
    return { ok: true, message: data.message }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Finalize a booking after returning from Stripe Checkout. Returns { ok, booking? }.
export async function confirmStripeSession(sessionId, user) {
  try {
    const data = await request('/payment/confirm', { method: 'POST', body: { sessionId }, user })
    return { ok: true, booking: data.booking, emailPreview: data.emailPreview }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Cancel a booking. Returns { ok, booking?, error? }.
export async function cancelBooking(bookingId, user) {
  try {
    const data = await request(`/bookings/${bookingId}/cancel`, { method: 'PATCH', user })
    return { ok: true, booking: data.booking }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Normalizes a backend booking into the flat shape the UI renders.
function normalizeBooking(b) {
  const movie = b.movie || b.show?.movie || {}
  return {
    _id: b._id,
    poster: movie.poster_path,
    title: movie.title || 'Movie',
    runtime: movie.runtime,
    dateLabel: [b.showDate, b.showTime].filter(Boolean).join(' • '),
    amount: b.totalAmount,
    isPaid: b.paymentStatus === 'completed',
    isCancelled: b.status === 'cancelled',
    isUsed: b.status === 'used',
    seats: b.seats || [],
    qr: b.qrCode || null,
    bookingCode: b.bookingCode || null,
  }
}

// ---------------------------------------------------------------------------
// User profile & loyalty
// ---------------------------------------------------------------------------

// Upsert the current user (Clerk or guest) so loyalty/referrals accrue.
// Returns the user record or null. Safe to call on every app load.
export async function syncUser(user) {
  const { userId, userEmail, userName } = getIdentity(user)
  try {
    const data = await request('/users/sync', {
      method: 'POST',
      user,
      body: { clerkId: userId, email: userEmail, firstName: userName },
    })
    return data?.user || null
  } catch {
    return null
  }
}

// Fetch the current user's profile (points, tier, stats, referral code).
export async function fetchUserProfile(user) {
  const { userId } = getIdentity(user)
  try {
    return await request(`/users/${userId}`, { user })
  } catch {
    return null
  }
}

// Current user's bookings (normalized). Falls back to sample bookings offline.
export async function fetchMyBookings(user) {
  try {
    const data = await request(`/bookings/user/${identityHeaders(user)['x-user-id']}`, { user })
    if (Array.isArray(data)) return data.map(normalizeBooking)
    throw new Error('Bad bookings payload')
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[CineSnap] Using sample bookings —', err.message)
    }
    // Map the bundled sample data into the same normalized shape.
    return dummyBookingData.map((b) => ({
      _id: b._id,
      poster: b.show?.movie?.poster_path,
      title: b.show?.movie?.title || 'Movie',
      runtime: b.show?.movie?.runtime,
      dateLabel: b.show?.showDateTime ? new Date(b.show.showDateTime).toLocaleString() : '',
      amount: b.amount,
      isPaid: b.isPaid,
      isCancelled: false,
      seats: b.bookedSeats || [],
    }))
  }
}
