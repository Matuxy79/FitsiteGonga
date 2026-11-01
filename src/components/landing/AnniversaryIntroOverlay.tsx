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
    if (paused) return

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
  }, [goNext, index, paused, slide.durationMs])

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#120f0c] text-[#fdf6e3]"
      role="dialog"
      aria-label="Anniversary intro"
    >
      <div className="relative h-full w-full max-w-lg overflow-hidden sm:max-w-md md:max-w-lg lg:max-w-xl">
        <div className="absolute inset-x-0 top-0 z-30 flex gap-1 px-3 pb-2 pt-3">
          {slides.map((item, slideIndex) => (
            <div key={item.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-[#fdf6e3] transition-[width] duration-75 ease-linear"
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c4a882]">{chapter}</p>
            <p className="text-sm font-semibold text-[#fdf6e3]/90">{slide.caption}</p>
          </div>
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#fdf6e3] backdrop-blur transition hover:bg-black/50"
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
            <SlideVisual slide={slide} priority={index === 0} />
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
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#dc322f] px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(220,50,47,0.35)] transition hover:bg-[#cb4b16]"
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

function SlideVisual({ slide, priority }: { slide: AnniversarySlide; priority: boolean }) {
  if (slide.type === 'title') {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-[#c4a882] via-[#a88962] to-[#7a6348] px-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#fdf6e3]/80">Bahamas BS</p>
        <div className="mt-10 space-y-5">
          <div className="rounded-md border border-[#5c4a32]/40 bg-[#d9c4a8]/90 px-6 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
            <p className="font-serif text-2xl font-semibold tracking-wide text-[#3b2f22] sm:text-3xl">
              I Just Want To Live Happily
            </p>
          </div>
          <div className="ml-8 rounded-md border border-[#5c4a32]/40 bg-[#d9c4a8]/90 px-6 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
            <p className="font-serif text-xl font-semibold tracking-wide text-[#3b2f22] sm:text-2xl">
              Ever After, Now And Then
            </p>
          </div>
        </div>
        <p className="mt-12 max-w-xs text-sm font-medium leading-6 text-[#fdf6e3]/85">
          Tap right to play our story. Skip anytime.
        </p>
      </div>
    )
  }

  if (slide.type === 'handoff') {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#eee8d5] to-[#c4a882] px-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dc322f] text-3xl font-black text-white shadow-[0_12px_24px_rgba(220,50,47,0.35)]">
          G
        </span>
        <h2 className="mt-6 text-4xl font-black text-[#002b36]">
          Gonga<span className="text-[#dc322f]">Fit</span>
        </h2>
        <p className="mt-3 max-w-sm text-base font-medium leading-7 text-[#586e75]">
          Find your fun fit — coaches, community, and goals that feel good.
        </p>
      </div>
    )
  }

  if (slide.type === 'video' && slide.src) {
    return (
      <video
        src={slide.src}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      />
    )
  }

  if (slide.src) {
    return (
      <img
        src={slide.src}
        alt=""
        className="h-full w-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    )
  }

  return <div className="h-full w-full bg-[#120f0c]" />
}
