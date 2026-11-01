import { describe, expect, it, beforeEach } from 'vitest'
import {
  ANNIVERSARY_INTRO_SESSION_KEY,
  ANNIVERSARY_SLIDES,
  markAnniversaryIntroDismissed,
  shouldShowAnniversaryIntro,
} from '@/lib/anniversaryIntro'

describe('anniversaryIntro', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('shows intro until dismissed for the session', () => {
    expect(shouldShowAnniversaryIntro()).toBe(true)
    markAnniversaryIntroDismissed()
    expect(window.sessionStorage.getItem(ANNIVERSARY_INTRO_SESSION_KEY)).toBe('1')
    expect(shouldShowAnniversaryIntro()).toBe(false)
  })

  it('includes ordered story chapters ending with handoff', () => {
    expect(ANNIVERSARY_SLIDES[0]?.type).toBe('creators')
    expect(ANNIVERSARY_SLIDES[1]?.type).toBe('title')
    expect(ANNIVERSARY_SLIDES.at(-1)?.type).toBe('handoff')
    const bahamasImages = ANNIVERSARY_SLIDES.filter((slide) => slide.id.startsWith('bahamas-') && slide.type === 'image')
    expect(bahamasImages.length).toBeGreaterThanOrEqual(10)
  })
})
