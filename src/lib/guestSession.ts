import type { User } from '@/types/fitness'

export interface GuestProfile {
  id: string
  displayName: string
  createdAt: string
}

export const GUEST_STORAGE_KEY = 'gongafit-guest'
export const GUEST_COOKIE_NAME = 'gongafit_guest'
export const GUEST_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60
export const GUEST_DISPLAY_NAME_MIN = 2
export const GUEST_DISPLAY_NAME_MAX = 24

const GUEST_DISPLAY_NAME_PATTERN = /^[A-Za-z0-9 _.\-]+$/

export type GuestDisplayNameResult =
  | { ok: true; displayName: string }
  | { ok: false; error: string }

export function normalizeGuestDisplayName(input: string): GuestDisplayNameResult {
  const collapsed = input.trim().replace(/\s+/g, ' ')
  if (!collapsed) return { ok: false, error: 'Enter a username to continue as guest.' }
  if (collapsed.length < GUEST_DISPLAY_NAME_MIN)
    return { ok: false, error: 'Username must be at least 2 characters.' }
  if (collapsed.length > GUEST_DISPLAY_NAME_MAX)
    return { ok: false, error: 'Keep your username under 24 characters.' }
  if (!GUEST_DISPLAY_NAME_PATTERN.test(collapsed))
    return { ok: false, error: 'Use letters, numbers, spaces, _ - . only.' }
  return { ok: true, displayName: collapsed }
}

export function createGuestProfile(displayName: string): GuestProfile {
  const validated = normalizeGuestDisplayName(displayName)
  if (!validated.ok) throw new Error(validated.error)
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return {
    id: `guest-${Date.now().toString(36)}-${suffix}`,
    displayName: validated.displayName,
    createdAt: new Date().toISOString(),
  }
}

function isValidGuestProfile(value: unknown): value is GuestProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Record<string, unknown>
  return (
    typeof profile.id === 'string' &&
    profile.id.startsWith('guest-') &&
    typeof profile.displayName === 'string' &&
    profile.displayName.length > 0 &&
    typeof profile.createdAt === 'string'
  )
}

export function saveGuestSession(profile: GuestProfile): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Storage may be unavailable in privacy-restricted contexts; cookie still persists.
  }
  try {
    const encoded = encodeURIComponent(JSON.stringify(profile))
    document.cookie = `${GUEST_COOKIE_NAME}=${encoded}; Max-Age=${GUEST_SESSION_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
  } catch {
    // Cookie write failed; localStorage copy (if saved) still applies.
  }
}

function readGuestCookie(): GuestProfile | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${GUEST_COOKIE_NAME}=`))
  if (!match) return null
  try {
    const profile = JSON.parse(decodeURIComponent(match.slice(GUEST_COOKIE_NAME.length + 1)))
    return isValidGuestProfile(profile) ? profile : null
  } catch {
    return null
  }
}

export function readGuestSession(): GuestProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY)
    if (raw) {
      const profile = JSON.parse(raw)
      if (isValidGuestProfile(profile)) return profile
    }
  } catch {
    // Fall through to the cookie copy.
  }
  return readGuestCookie()
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY)
  } catch {
    // Ignore storage failures on cleanup.
  }
  try {
    document.cookie = `${GUEST_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`
  } catch {
    // Ignore cookie failures on cleanup.
  }
}

export function toGuestUser(profile: GuestProfile): User {
  return {
    id: profile.id,
    email: `${profile.id}@guest.local`,
    display_name: profile.displayName,
    role: 'CLIENT',
    membership_tier: 'FREE',
    fitness_level: 'BEGINNER',
    goals: [],
    created_at: profile.createdAt,
    updated_at: profile.createdAt,
    isGuest: true,
  }
}

export function isGuestUser(user: { id?: string; isGuest?: boolean } | null | undefined): boolean {
  if (!user) return false
  if (user.isGuest) return true
  return typeof user.id === 'string' && user.id.startsWith('guest-')
}
