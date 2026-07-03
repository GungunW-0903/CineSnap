// Resolves the identity we send to the backend so bookings can be attributed
// to a user. Priority:
//   1. A signed-in Clerk user (passed in from a component via useUser()).
//   2. A stable "guest" identity persisted in localStorage — so the whole
//      booking flow is demoable even when Clerk isn't configured / not signed in.
//
// This mirrors the backend's dev-mode auth, which reads x-user-* headers.

const GUEST_KEY = 'cinesnap_guest'

function makeGuestId() {
  // Short, stable, human-readable-ish id.
  return 'guest_' + Math.random().toString(36).slice(2, 10)
}

function getGuest() {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* localStorage unavailable — fall through */
  }
  const id = makeGuestId()
  const guest = {
    userId: id,
    userEmail: `${id}@guest.cinesnap.app`,
    userName: 'Guest',
  }
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(guest))
  } catch {
    /* ignore persistence failure */
  }
  return guest
}

/** Returns { userId, userEmail, userName }. Pass the Clerk user if available. */
export function getIdentity(clerkUser) {
  if (clerkUser?.id) {
    return {
      userId: clerkUser.id,
      userEmail:
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        `${clerkUser.id}@user.cinesnap.app`,
      userName: clerkUser.fullName || clerkUser.firstName || 'CineSnap User',
    }
  }
  return getGuest()
}

/** Builds the auth headers the backend expects. */
export function identityHeaders(clerkUser) {
  const { userId, userEmail, userName } = getIdentity(clerkUser)
  return {
    'x-user-id': userId,
    'x-user-email': userEmail,
    'x-user-name': userName,
  }
}
