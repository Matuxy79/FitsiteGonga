import { describe, it, expect, beforeEach } from 'vitest'
import {
  GUEST_COOKIE_NAME,
  GUEST_STORAGE_KEY,
  clearGuestSession,
  createGuestProfile,
  isGuestUser,
  normalizeGuestDisplayName,
  readGuestSession,
  saveGuestSession,
  toGuestUser,
} from '@/lib/guestSession'

describe('guestSession', () => {
  beforeEach(() => {
    localStorage.clear()
    document.cookie.split(';').forEach((part) => {
      const name = part.split('=')[0]?.trim()
      if (name) document.cookie = `${name}=; Max-Age=0; Path=/`
    })
  })

  describe('normalizeGuestDisplayName', () => {
    it('accepts a plain username', () => {
      expect(normalizeGuestDisplayName('  Maya  ')).toEqual({ ok: true, displayName: 'Maya' })
    })

    it('collapses inner whitespace', () => {
      expect(normalizeGuestDisplayName('gym   rat')).toEqual({ ok: true, displayName: 'gym rat' })
    })

    it('rejects blank names', () => {
      const result = normalizeGuestDisplayName('   ')
      expect(result.ok).toBe(false)
    })

    it('rejects names under 2 characters', () => {
      expect(normalizeGuestDisplayName('a').ok).toBe(false)
    })

    it('rejects names over 24 characters', () => {
      expect(normalizeGuestDisplayName('a'.repeat(25)).ok).toBe(false)
    })

    it('rejects symbols outside the allowlist', () => {
      expect(normalizeGuestDisplayName('maya@home!').ok).toBe(false)
    })
  })

  describe('guest session persistence', () => {
    it('round-trips through storage and cookie', () => {
      const profile = createGuestProfile('Guest Lifter')
      saveGuestSession(profile)

      expect(localStorage.getItem(GUEST_STORAGE_KEY)).toContain('Guest Lifter')
      expect(document.cookie).toContain(GUEST_COOKIE_NAME)
      expect(readGuestSession()).toEqual(profile)
    })

    it('recovers from the cookie when storage is empty', () => {
      const profile = createGuestProfile('Cardio Fan')
      saveGuestSession(profile)
      localStorage.removeItem(GUEST_STORAGE_KEY)

      expect(readGuestSession()).toEqual(profile)
    })

    it('clears both copies on logout', () => {
      saveGuestSession(createGuestProfile('Temp Guest'))
      clearGuestSession()

      expect(localStorage.getItem(GUEST_STORAGE_KEY)).toBeNull()
      expect(readGuestSession()).toBeNull()
    })
  })

  describe('guest user mapping', () => {
    it('marks converted users as guests', () => {
      const user = toGuestUser(createGuestProfile('Yoga Guest'))
      expect(user.isGuest).toBe(true)
      expect(user.display_name).toBe('Yoga Guest')
      expect(isGuestUser(user)).toBe(true)
    })

    it('does not flag real users', () => {
      expect(isGuestUser({ id: 'user-123' })).toBe(false)
      expect(isGuestUser(null)).toBe(false)
    })
  })
})
