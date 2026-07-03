import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuthUser } from '../lib/authUser'
import { syncUser, fetchUserProfile } from '../lib/api'

// Loyalty tier thresholds — mirrors the backend so we can show progress.
export const TIERS = [
  { name: 'Bronze', min: 0, color: '#cd7f32' },
  { name: 'Silver', min: 300, color: '#c0c0c0' },
  { name: 'Gold', min: 800, color: '#ffc24a' },
  { name: 'Platinum', min: 2000, color: '#7fd0ff' },
]

export function tierInfo(points = 0) {
  let current = TIERS[0]
  for (const t of TIERS) if (points >= t.min) current = t
  const next = TIERS.find((t) => t.min > points) || null
  const span = next ? next.min - current.min : 1
  const into = points - current.min
  const progress = next ? Math.min(100, Math.round((into / span) * 100)) : 100
  return { current, next, progress, toNext: next ? next.min - points : 0 }
}

const ProfileContext = createContext({ profile: null, loading: true, refresh: () => {} })

export const useProfile = () => useContext(ProfileContext)

export const ProfileProvider = ({ children }) => {
  const { user, isLoaded } = useAuthUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const p = await fetchUserProfile(user)
    setProfile(p)
    return p
  }, [user])

  useEffect(() => {
    if (!isLoaded) return
    let cancelled = false
    async function boot() {
      setLoading(true)
      // Sync creates the user (Clerk or guest) so points/referrals accrue,
      // then load the profile. Wrapped in a 2s timeout so the page doesn't hang
      // on GitHub Pages (no backend). If sync/profile fail or timeout, page
      // still loads with null profile (graceful fallback).
      try {
        await Promise.race([
          syncUser(user),
          new Promise((_, rej) => setTimeout(() => rej(new Error('sync timeout')), 2000))
        ])
      } catch {
        // Sync failed or timed out — that's ok, proceed without it
      }
      try {
        const p = await Promise.race([
          fetchUserProfile(user),
          new Promise((_, rej) => setTimeout(() => rej(new Error('profile timeout')), 2000))
        ])
        if (!cancelled) setProfile(p)
      } catch {
        // Profile fetch failed or timed out — still ok
      }
      if (!cancelled) setLoading(false)
    }
    boot()
    return () => { cancelled = true }
  }, [isLoaded, user])

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh }}>
      {children}
    </ProfileContext.Provider>
  )
}

export default ProfileContext
