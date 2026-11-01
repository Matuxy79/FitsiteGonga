'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import {
  ANNIVERSARY_SLIDES,
  chapterLabel,
  markAnniversaryIntroDismissed,
  type AnniversarySlide,
} from '@/lib/anniversaryIntro'

const INTRO_ASSET_VERSION = '3'

function assetUrl(src: string) {
  return `${src}?v=${INTRO_ASSET_VERSION}`
}

type AnniversaryIntroOverlayProps = {
  onComplete: () => void
}

export function AnniversaryIntroOverlay({ onComplete }: AnniversaryIntroOverlayProps) {
  const slides = ANNIVERSARY_SLIDES
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startedAtRef = useRef<number>(0)
  const elapsedRef = useRef(0)

  const slide = slides[index]
  const isLast = index >= slides.length - 1
  const isTimedSlide = slide.type !== 'video'

  const finish = useCallback(() => {
    markAnniversaryIntroDismissed()
    onComplete()
  }, [onComplete])

  const goNext = useCallback(() => {
    setProgress(0)
    elapsedRef.current = 0
    if (isLast) {
      finish()
      return
    }
    setIndex((current) => Math.min(current + 1, slides.length - 1))
  }, [finish, isLast, slides.length])

  const goPrev = useCallback(() => {
    setProgress(0)
    elapsedRef.current = 0
    setIndex((current) => Math.max(current - 1, 0))
  }, [])

  useEffect(() => {
    if (paused || !isTimedSlide) return

    startedAtRef.current = performance.now() - elapsedRef.current

    const tick = (now: number) => {
      const duration = slide.durationMs
      const elapsed = now - startedAtRef.current
      elapsedRef.current = elapsed
      const nextProgress = Math.min(elapsed / duration, 1)
      setProgress(nextProgress)

      if (nextProgress >= 1) {
        goNext()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [goNext, index, isTimedSlide, paused, slide.durationMs])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        goNext()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      } else if (event.key === 'Escape') {
        finish()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [finish, goNext, goPrev])

  const chapter = useMemo(() => chapterLabel(slide.chapter), [slide.chapter])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden bg-black text-landing-text"
      role="dialog"
      aria-label="Anniversary intro"
    >
      <div className="relative h-full w-full overflow-hidden bg-black">
        <div className="absolute inset-x-0 top-0 z-30 flex gap-1 px-3 pb-2 pt-3">
          {slides.map((item, slideIndex) => (
            <div key={item.id} className="h-1 flex-1 overflow-hidden rounded-full bg-landing-border/80">
              <div
                className="h-full rounded-full bg-landing-primary transition-[width] duration-75 ease-linear"
                style={{
                  width:
                    slideIndex < index
                      ? '100%'
                      : slideIndex === index
                        ? `${progress * 100}%`
                        : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-landing-primary">{chapter}</p>
            <p className="text-sm font-semibold text-white/90">{slide.caption}</p>
          </div>
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-1 rounded-full border border-landing-border bg-landing-surface/90 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-landing-text backdrop-blur transition hover:bg-landing-surface-raised"
          >
            Skip
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <SlideVisual
              slide={slide}
              priority={index === 0}
              onVideoEnded={goNext}
              onVideoProgress={setProgress}
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          aria-label="Previous slide"
          className="absolute inset-y-0 left-0 z-20 w-1/3"
          onClick={goPrev}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
        />
        <button
          type="button"
          aria-label="Next slide"
          className="absolute inset-y-0 right-0 z-20 w-1/3"
          onClick={goNext}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
        />

        {slide.type === 'handoff' && (
          <div className="absolute inset-x-0 bottom-10 z-30 flex justify-center px-6">
            <button
              type="button"
              onClick={finish}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-landing-brand px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(220,38,38,0.35)] transition hover:bg-landing-brand/90"
            >
              Enter site
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

type SlideVisualProps = {
  slide: AnniversarySlide
  priority: boolean
  onVideoEnded: () => void
  onVideoProgress: (value: number) => void
}

function SlideVisual({ slide, priority, onVideoEnded, onVideoProgress }: SlideVisualProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (slide.type !== 'video' || !videoRef.current) return
    const video = videoRef.current
    video.currentTime = 0
    void video.play().catch(() => undefined)
  }, [slide.id, slide.type])

  if (slide.type === 'creators' && slide.src) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        <img
          src={assetUrl(slide.src)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-80 blur-2xl brightness-110"
        />
        <div className="absolute inset-0 bg-black/10" />
        <img
          src={assetUrl(slide.src)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover sm:object-contain"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-landing-overlay via-landing-overlay/20 to-landing-overlay/5" />
        <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-14 pt-24 text-left sm:px-12">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-landing-primary">GongaFit creators</p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">{slide.caption}</h2>
          {slide.subtitle ? (
            <p className="mt-3 text-sm font-semibold text-white/85 sm:text-base">{slide.subtitle}</p>
          ) : null}
          <p className="mt-8 max-w-xs text-sm font-medium leading-6 text-white/75">
            Tap right to play our story — wedding, anniversaries, and Bahamas mode.
          </p>
        </div>
      </div>
    )
  }

  if (slide.type === 'title') {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-landing-bg via-landing-surface to-landing-surface-raised px-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-landing-muted">Bahamas BS</p>
        <div className="mt-10 space-y-5">
          <div className="rounded-xl border border-landing-border bg-landing-bg px-6 py-4 shadow-sm">
            <p className="font-serif text-2xl font-semibold tracking-wide text-landing-text sm:text-3xl">
              I Just Want To Live Happily
            </p>
          </div>
          <div className="ml-8 rounded-xl border border-landing-border bg-landing-bg px-6 py-4 shadow-sm">
            <p className="font-serif text-xl font-semibold tracking-wide text-landing-text sm:text-2xl">
              Ever After, Now And Then
            </p>
          </div>
        </div>
        <p className="mt-12 max-w-xs text-sm font-medium leading-6 text-landing-muted">
          Tap right to play our story. Skip anytime.
        </p>
      </div>
    )
  }

  if (slide.type === 'handoff') {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-landing-bg via-landing-surface to-landing-surface-raised px-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-landing-brand text-3xl font-black text-white shadow-lg">
          G
        </span>
        <h2 className="mt-6 text-4xl font-black text-landing-text">
          Gonga<span className="text-landing-brand">Fit</span>
        </h2>
        <p className="mt-3 max-w-sm text-base font-medium leading-7 text-landing-muted">
          Find your fun fit — coaches, community, and goals that feel good.
        </p>
      </div>
    )
  }

  if (slide.type === 'video' && slide.src) {
    return (
      <video
        ref={videoRef}
        src={assetUrl(slide.src)}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        onTimeUpdate={(event) => {
          const video = event.currentTarget
          if (!video.duration || !Number.isFinite(video.duration)) return
          onVideoProgress(video.currentTime / video.duration)
        }}
        onEnded={onVideoEnded}
      />
    )
  }

  if (slide.src) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        <img
          src={assetUrl(slide.src)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-80 blur-2xl brightness-110"
          loading={priority ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-black/10" />
        <img
          src={assetUrl(slide.src)}
          alt=""
          className="relative z-10 h-full w-full object-cover sm:object-contain"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/45 via-transparent to-black/10" />
      </div>
    )
  }

  return <div className="h-full w-full bg-landing-surface" />
}
