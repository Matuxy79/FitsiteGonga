import manifest from '@/data/anniversaryManifest.json'

export const ANNIVERSARY_INTRO_SESSION_KEY = 'gongafit.anniversaryIntro.dismissed'

export type AnniversarySlideType = 'title' | 'image' | 'video' | 'handoff'

export type AnniversaryChapter = 'bahamas' | 'wedding' | 'first' | 'handoff'

export type AnniversarySlide = {
  id: string
  type: AnniversarySlideType
  chapter: AnniversaryChapter
  durationMs: number
  caption: string
  src?: string
}

export type AnniversaryManifest = {
  version: number
  slides: AnniversarySlide[]
}

export const ANNIVERSARY_MANIFEST = manifest as AnniversaryManifest

export const ANNIVERSARY_SLIDES = ANNIVERSARY_MANIFEST.slides

export function shouldShowAnniversaryIntro(): boolean {
  if (typeof window === 'undefined') return false
  return window.sessionStorage.getItem(ANNIVERSARY_INTRO_SESSION_KEY) !== '1'
}

export function markAnniversaryIntroDismissed(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(ANNIVERSARY_INTRO_SESSION_KEY, '1')
}

export function chapterLabel(chapter: AnniversaryChapter): string {
  switch (chapter) {
    case 'bahamas':
      return 'Bahamas mode'
    case 'wedding':
      return '2025 — Wedding'
    case 'first':
      return 'First anniversary'
    case 'handoff':
      return 'GongaFit'
    default:
      return ''
  }
}
