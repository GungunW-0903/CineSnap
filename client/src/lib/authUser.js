import { useUser } from '@clerk/clerk-react'

// Whether Clerk is configured for this build (publishable key present).
export const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

/**
 * Safe replacement for Clerk's useUser().
 *
 * Clerk's useUser() THROWS if there's no <ClerkProvider> above it — which is
 * exactly what happens when the app is built without a publishable key (e.g. a
 * CI/Pages build where secrets aren't injected). This wrapper returns a null
 * user in that case instead of crashing the whole page.
 *
 * `clerkEnabled` is a build-time constant, so the conditional hook call is
 * stable across every render (Rules of Hooks are satisfied in practice).
 */
export function useAuthUser() {
  if (clerkEnabled) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUser()
  }
  return { user: null, isLoaded: true, isSignedIn: false }
}
