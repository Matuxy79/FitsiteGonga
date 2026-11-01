'use client'

import { Suspense, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Bike,
  ChevronRight,
  Dumbbell,
  Eye,
  EyeOff,
  Flame,
  HeartPulse,
  Loader2,
  LockKeyhole,
  Mail,
  Target,
  Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { getEmailSector, mapAuthErrorToToast, type FieldErrors } from '@/lib/authFeedback'
import { normalizeGuestDisplayName } from '@/lib/guestSession'
import {
  DEFAULT_HOMEPAGE_PEOPLE,
  HOMEPAGE_PEOPLE_EVENT,
  type HomepagePerson,
  readHomepagePeople,
} from '@/lib/gongafitHomepage'
import { shouldShowAnniversaryIntro } from '@/lib/anniversaryIntro'
import { AnniversaryIntroOverlay } from '@/components/landing/AnniversaryIntroOverlay'

type AuthMode = 'login' | 'signup'

const mascotImage = '/assets/gongafit/sun-mascot.png'

const trainerSlides = [
  {
    imageUrl: '/assets/gongafit/trainers/trainer-05-duo.png',
    title: 'Partner training',
    body: 'Community workouts and support sessions.',
  },
  {
    imageUrl: '/assets/gongafit/trainers/trainer-04.png',
    title: 'Conditioning work',
    body: 'Trainer-led progress shots and movement blocks.',
  },
  {
    imageUrl: '/assets/gongafit/trainers/trainer-03.png',
    title: 'Strength sessions',
    body: 'Progress-focused lifting and physique coaching.',
  },
  {
    imageUrl: '/assets/gongafit/trainers/trainer-02-protein.png',
    title: 'Nutrition targets',
    body: 'Protein and meal planning visuals for client goals.',
  },
  {
    imageUrl: '/assets/gongafit/trainers/trainer-01.png',
    title: 'Personal training',
    body: 'Real coaching photos from the GongaFit trainer library.',
  },
]

const workoutChips = [
  { label: 'HIIT', Icon: Flame, color: '#dc322f', bg: '#fce4e1' },
  { label: 'Strength', Icon: Dumbbell, color: '#859900', bg: '#e8f5c8' },
  { label: 'Yoga', Icon: HeartPulse, color: '#2aa198', bg: '#d5eff7' },
  { label: 'Cycling', Icon: Bike, color: '#b58900', bg: '#f5e6c4' },
  { label: 'Community', Icon: Users, color: '#cb4b16', bg: '#fce4e1' },
]

const toolHighlights = [
  { title: 'Track progress', body: 'See stats and celebrate wins.', Icon: ArrowRight, color: '#268bd2' },
  { title: 'Stay consistent', body: 'Build streaks and habits.', Icon: Target, color: '#859900' },
  { title: 'Train together', body: 'Move with friends.', Icon: Users, color: '#b58900' },
]

export default function GongaFitLanding() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-landing-bg" />}>
      <GongaFitLandingInner />
    </Suspense>
  )
}

function GongaFitLandingInner() {
  const [showIntro, setShowIntro] = useState<boolean | null>(null)
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestError, setGuestError] = useState<string | null>(null)
  const [showGuest, setShowGuest] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [people, setPeople] = useState<HomepagePerson[]>(DEFAULT_HOMEPAGE_PEOPLE)
  const [activeSlide, setActiveSlide] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const handledReasonRef = useRef(false)
  const { login, loginAsGuest, register, loading, user } = useAuth()
  const { toast } = useToast()

  const isLockedOut = cooldownSeconds !== null && cooldownSeconds > 0
  const currentSlide = trainerSlides[activeSlide]

  useEffect(() => {
    setShowIntro(shouldShowAnniversaryIntro())
  }, [])

  useEffect(() => {
    setPeople(readHomepagePeople())

    const syncPeople = () => setPeople(readHomepagePeople())
    window.addEventListener('storage', syncPeople)
    window.addEventListener(HOMEPAGE_PEOPLE_EVENT, syncPeople)

    return () => {
      window.removeEventListener('storage', syncPeople)
      window.removeEventListener(HOMEPAGE_PEOPLE_EVENT, syncPeople)
    }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % trainerSlides.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (handledReasonRef.current) return
    const reason = searchParams.get('reason')
    if (!reason) return

    handledReasonRef.current = true

    if (reason === 'session-expired') {
      toast({
        status: 'WARN',
        title: 'SESSION EXPIRED',
        message: 'Sign in again to continue.',
        sector: 'AUTH',
      })
    } else if (reason === 'login-required') {
      toast({
        status: 'INFO',
        title: 'LOGIN REQUIRED',
        message: 'Authenticate to access GongaFit.',
        sector: 'AUTH',
      })
    } else if (reason === 'signed-out') {
      toast({
        status: 'OK',
        title: 'SIGNED OUT',
        message: 'You are safely signed out.',
        sector: 'AUTH',
      })
    }

    router.replace('/')
  }, [router, searchParams, toast])

  useEffect(() => {
    if (redirecting) return
    if (loading) return
    if (!user) return

    toast({
      status: 'INFO',
      title: 'SESSION ACTIVE',
      message: 'Opening your dashboard.',
      sector: 'AUTH',
    })

    setRedirecting(true)
    router.replace('/dashboard')
  }, [loading, redirecting, router, toast, user])

  useEffect(() => {
    if (!isLockedOut) return
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null) return prev
        if (prev <= 1) return null
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isLockedOut])

  const submitDisabled = useMemo(() => loading || redirecting || isLockedOut, [loading, redirecting, isLockedOut])

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateInputs = (): { ok: true; email: string; password: string; displayName: string } | { ok: false } => {
    const nextErrors: FieldErrors = {}
    const trimmedEmail = email.trim()
    const trimmedDisplayName = displayName.trim()

    if (!trimmedEmail) nextErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) nextErrors.email = 'Enter a valid email address'

    if (!password) nextErrors.password = 'Password is required'
    else if (mode === 'signup' && password.length < 8) nextErrors.password = 'Password must be at least 8 characters'

    if (mode === 'signup' && !trimmedDisplayName) nextErrors.displayName = 'Display name is required'

    setFieldErrors(nextErrors)

    const firstError = nextErrors.email || nextErrors.password || nextErrors.displayName
    if (firstError) {
      toast({
        status: 'WARN',
        title: 'CHECK YOUR INPUTS',
        message: firstError,
        sector: 'AUTH',
      })
      return { ok: false }
    }

    return { ok: true, email: trimmedEmail, password, displayName: trimmedDisplayName }
  }

  const handleSubmit = async () => {
    if (submitDisabled) return

    const validated = validateInputs()
    if (!validated.ok) return

    try {
      if (mode === 'login') {
        await login(validated.email, validated.password)
        toast({
          status: 'OK',
          title: 'WELCOME BACK',
          message: 'Opening your dashboard.',
          sector: 'AUTH',
        })
      } else {
        await register(validated.email, validated.password, validated.displayName)
        toast({
          status: 'OK',
          title: 'ACCOUNT READY',
          message: 'Your GongaFit space is ready.',
          sector: getEmailSector(validated.email),
        })
      }
      setRedirecting(true)
      router.push('/dashboard')
    } catch (error: any) {
      const mapped = mapAuthErrorToToast({ mode, email: validated.email, error })
      if (mode === 'signup' && mapped.toast.title === 'ACCOUNT EXISTS') {
        setMode('login')
        setDisplayName('')
        setCapsLockOn(false)
      }
      if (mapped.fieldErrors) setFieldErrors((prev) => ({ ...prev, ...mapped.fieldErrors }))
      if (mapped.retryAfterSeconds) setCooldownSeconds(mapped.retryAfterSeconds)
      toast(mapped.toast)
    }
  }

  const handleGuestSubmit = () => {
    if (submitDisabled) return
    const validated = normalizeGuestDisplayName(guestName)
    if (!validated.ok) {
      setGuestError(validated.error)
      toast({ status: 'WARN', title: 'PICK A USERNAME', message: validated.error, sector: 'AUTH' })
      return
    }
    try {
      setGuestError(null)
      loginAsGuest(validated.displayName)
      toast({
        status: 'OK',
        title: 'GUEST PASS',
        message: `Exploring as ${validated.displayName}. Messaging is disabled.`,
        sector: 'AUTH',
      })
      setRedirecting(true)
      router.push('/dashboard')
    } catch (error: any) {
      const message = error?.message || 'Could not start a guest session.'
      setGuestError(message)
      toast({ status: 'ERROR', title: 'GUEST FAILED', message, sector: 'AUTH' })
    }
  }

  const handleEnterSubmit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSubmit()
  }

  if (showIntro !== false) {
    return (
      <>
        <AnimatePresence>
          {showIntro ? (
            <AnniversaryIntroOverlay key="anniversary-intro" onComplete={() => setShowIntro(false)} />
          ) : null}
        </AnimatePresence>
        {!showIntro ? <div className="min-h-screen bg-landing-bg" aria-hidden /> : null}
      </>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden bg-landing-bg text-landing-text selection:bg-landing-primary selection:text-white">
      <main className="min-h-screen p-3 sm:p-5 lg:p-7">
        <section className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[28px] border border-landing-border/80 bg-landing-bg shadow-[0_24px_80px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3.5rem)]">
          <div className="absolute inset-0 bg-gradient-to-br from-landing-bg via-landing-surface to-landing-surface" />
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide.imageUrl}
              src={currentSlide.imageUrl}
              alt=""
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute bottom-0 right-0 top-0 hidden h-full w-[68%] object-cover object-center lg:block"
            />
          </AnimatePresence>
          <div className="absolute inset-0 hidden bg-gradient-to-r from-landing-bg via-landing-bg/90 to-landing-bg/16 lg:block" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-landing-surface to-transparent" />

          <div className="relative z-10 flex min-h-[calc(100vh-1.5rem)] flex-col sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3.5rem)]">
            <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
              <button
                type="button"
                className="flex items-center gap-3"
                aria-label="GongaFit home"
                onClick={() => router.push('/')}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-landing-brand text-3xl font-black text-white shadow-[0_10px_20px_rgba(220,50,47,0.28)]">
                  G
                </span>
                <span className="text-2xl font-black text-landing-text">
                  Gonga<span className="text-landing-brand">Fit</span>
                </span>
              </button>

              <nav className="hidden items-center gap-8 text-sm font-black text-landing-text lg:flex">
                <span>Workouts</span>
                <span>Programs</span>
                <span>Community</span>
                <span>Progress</span>
                <Link href="/contact" className="hover:text-landing-brand transition-colors">Contact</Link>
              </nav>

              <button
                type="button"
                onClick={() => setMode('signup')}
                className="hidden items-center gap-2 rounded-full bg-landing-success px-5 py-3 text-sm font-black text-landing-text shadow-[0_12px_24px_rgba(133,153,0,0.22)] transition hover:-translate-y-0.5 hover:bg-landing-success sm:inline-flex"
              >
                Start training
                <ChevronRight className="h-4 w-4" />
              </button>
            </header>

            <div className="grid flex-1 auto-rows-max content-start items-start gap-6 px-5 pb-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center lg:px-10 lg:pb-24">
              <div className="max-w-4xl pt-5 lg:pt-0">
                <motion.h1
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="max-w-3xl text-5xl font-black leading-[0.96] text-landing-text sm:text-7xl lg:text-8xl"
                >
                  Find your <span className="text-landing-brand">fun</span> fit
                </motion.h1>
                <motion.p
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
                  className="mt-4 max-w-xl text-lg font-medium leading-7 text-landing-muted sm:mt-6 sm:text-xl sm:leading-8"
                >
                  Move with coaches, friends, and goals that feel good.
                </motion.p>

                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.14, ease: 'easeOut' }}
                  className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4"
                >
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="inline-flex h-14 items-center gap-3 rounded-full bg-landing-brand px-6 text-base font-black text-white shadow-[0_16px_30px_rgba(220,50,47,0.3)] transition hover:-translate-y-0.5 hover:bg-landing-brand/90"
                  >
                    Start training
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="inline-flex h-14 items-center rounded-full border border-landing-border bg-landing-surface/90 px-6 text-base font-black text-landing-text shadow-[0_10px_24px_rgba(0,43,54,0.10)] transition hover:-translate-y-0.5 hover:border-landing-brand"
                  >
                    Log in
                  </button>
                </motion.div>

                <div className="mt-10 hidden max-w-2xl grid-cols-3 gap-3 lg:grid">
                  {people.map((person) => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>

                <div className="mt-6 hidden max-w-3xl flex-wrap gap-3 lg:flex">
                  {workoutChips.map(({ label, Icon, color, bg }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface/90 px-4 py-3 text-sm font-black text-landing-text shadow-[0_10px_20px_rgba(0,43,54,0.10)]"
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: bg, color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <AuthPanel
                mode={mode}
                setMode={setMode}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                displayName={displayName}
                setDisplayName={setDisplayName}
                fieldErrors={fieldErrors}
                clearFieldError={clearFieldError}
                capsLockOn={capsLockOn}
                setCapsLockOn={setCapsLockOn}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                submitDisabled={submitDisabled}
                redirecting={redirecting}
                isLockedOut={isLockedOut}
                cooldownSeconds={cooldownSeconds}
                loading={loading}
                handleSubmit={handleSubmit}
                handleEnterSubmit={handleEnterSubmit}
                guestName={guestName}
                setGuestName={setGuestName}
                guestError={guestError}
                setGuestError={setGuestError}
                showGuest={showGuest}
                onToggleGuest={() => setShowGuest((prev) => !prev)}
                onGuestSubmit={handleGuestSubmit}
              />

              <div className="lg:hidden">
                <TrainerSlideshow
                  activeSlide={activeSlide}
                  setActiveSlide={setActiveSlide}
                  className="mb-5"
                />
                <div className="grid grid-cols-3 gap-3">
                  {people.map((person) => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {workoutChips.map(({ label, Icon, color, bg }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface/90 px-4 py-3 text-sm font-black text-landing-text shadow-[0_10px_20px_rgba(0,43,54,0.10)]"
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: bg, color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-32 right-[470px] z-20 hidden gap-2 lg:flex">
              {trainerSlides.map((item, index) => (
                <button
                  key={item.imageUrl}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeSlide ? 'w-8 bg-landing-brand' : 'w-2 bg-landing-surface/80 hover:bg-landing-surface'
                  }`}
                  aria-label={`Show ${item.title}`}
                />
              ))}
            </div>

            <div className="relative z-10 mx-5 mb-5 rounded-[28px] bg-landing-surface/92 px-6 py-6 shadow-[0_18px_44px_rgba(0,43,54,0.12)] sm:mx-8 lg:mx-10">
              <div className="grid gap-5 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:items-center">
                <h2 className="text-3xl font-black leading-tight text-landing-text">
                  All the tools to reach your goals
                </h2>
                {toolHighlights.map(({ title, body, Icon, color }) => (
                  <div key={title} className="flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-landing-text" style={{ backgroundColor: color }}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-black text-landing-text">{title}</p>
                      <p className="text-sm font-medium leading-5 text-landing-muted">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function PersonCard({ person }: { person: HomepagePerson }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-landing-surface shadow-[0_14px_30px_rgba(0,43,54,0.18)]">
      <div className="h-28 bg-landing-bg sm:h-32 lg:h-24" style={{ backgroundColor: person.accent }}>
        <img src={person.imageUrl} alt="" className="h-full w-full object-cover object-top" />
      </div>
      <div className="min-h-[72px] px-2 py-3 text-center sm:px-3">
        <p className="text-sm font-black leading-tight text-landing-text sm:text-base lg:text-lg">{person.name}</p>
        <p className="mt-1 text-[11px] font-bold leading-tight text-landing-muted sm:text-xs">{person.role}</p>
      </div>
    </div>
  )
}

function TrainerSlideshow({
  activeSlide,
  setActiveSlide,
  className = '',
  compact = false,
}: {
  activeSlide: number
  setActiveSlide: (index: number) => void
  className?: string
  compact?: boolean
}) {
  const slide = trainerSlides[activeSlide]

  return (
    <div className={`overflow-hidden rounded-[24px] bg-landing-surface/92 shadow-[0_18px_44px_rgba(0,43,54,0.18)] backdrop-blur ${className}`}>
      <div className={compact ? 'h-40' : 'h-56 sm:h-64'}>
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.imageUrl}
            src={slide.imageUrl}
            alt=""
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="h-full w-full object-cover object-top"
          />
        </AnimatePresence>
      </div>
      <div className="p-4">
        <p className="text-base font-black text-landing-text">{slide.title}</p>
        {!compact && <p className="mt-1 text-sm font-medium leading-5 text-landing-muted">{slide.body}</p>}
        <div className="mt-3 flex gap-2">
          {trainerSlides.map((item, index) => (
            <button
              key={item.imageUrl}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeSlide ? 'w-7 bg-landing-brand' : 'w-2 bg-landing-border hover:bg-landing-muted'
              }`}
              aria-label={`Show ${item.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type AuthPanelProps = {
  mode: AuthMode
  setMode: (mode: AuthMode) => void
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  displayName: string
  setDisplayName: (value: string) => void
  fieldErrors: FieldErrors
  clearFieldError: (field: keyof FieldErrors) => void
  capsLockOn: boolean
  setCapsLockOn: (value: boolean) => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  submitDisabled: boolean
  redirecting: boolean
  isLockedOut: boolean
  cooldownSeconds: number | null
  loading: boolean
  handleSubmit: () => void
  guestName: string
  setGuestName: (value: string) => void
  guestError: string | null
  setGuestError: (value: string | null) => void
  showGuest: boolean
  onToggleGuest: () => void
  onGuestSubmit: () => void
  handleEnterSubmit: (event: KeyboardEvent<HTMLInputElement>) => void
}

function AuthPanel({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  fieldErrors,
  clearFieldError,
  capsLockOn,
  setCapsLockOn,
  showPassword,
  setShowPassword,
  submitDisabled,
  redirecting,
  isLockedOut,
  cooldownSeconds,
  loading,
  handleSubmit,
  handleEnterSubmit,
  guestName,
  setGuestName,
  guestError,
  setGuestError,
  showGuest,
  onToggleGuest,
  onGuestSubmit,
}: AuthPanelProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
      className="rounded-[30px] border border-landing-border bg-landing-surface/95 p-6 shadow-[0_24px_70px_rgba(0,43,54,0.18)] backdrop-blur md:p-8"
    >
      <div className="mb-7 flex items-center justify-between gap-5">
        <div>
          <h2 className="text-4xl font-black text-landing-text">{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
          <p className="mt-2 text-base font-medium text-landing-muted">
            {mode === 'login' ? "Welcome back. Let's get you moving." : 'Create your GongaFit account.'}
          </p>
        </div>
        <img src={mascotImage} alt="" className="h-20 w-20 rounded-3xl object-cover shadow-[0_12px_24px_rgba(181,137,0,0.25)]" />
      </div>

      <div className="space-y-4">
        {fieldErrors.general && (
          <div className="rounded-2xl bg-landing-brand/10 border border-landing-brand p-4 text-sm font-bold text-landing-brand shadow-sm">
            {fieldErrors.general}
          </div>
        )}
        
        <label className="block text-sm font-black text-landing-text">
          Email
          <span
            className={`mt-2 flex h-12 items-center gap-3 rounded-2xl border bg-landing-bg px-4 ${
              fieldErrors.email ? 'border-landing-brand' : 'border-landing-border'
            }`}
          >
            <Mail className="h-5 w-5 text-landing-muted" />
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                clearFieldError('email')
              }}
              onKeyDown={handleEnterSubmit}
              type="email"
              autoComplete="email"
              aria-invalid={fieldErrors.email ? true : undefined}
              placeholder="you@example.com"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-landing-text outline-none placeholder:text-landing-muted"
            />
          </span>
        </label>
        {fieldErrors.email && <p className="-mt-2 text-xs font-bold text-landing-brand">{fieldErrors.email}</p>}

        <label className="block text-sm font-black text-landing-text">
          Password
          <span
            className={`mt-2 flex h-12 items-center gap-3 rounded-2xl border bg-landing-bg px-4 ${
              fieldErrors.password ? 'border-landing-brand' : 'border-landing-border'
            }`}
          >
            <LockKeyhole className="h-5 w-5 text-landing-muted" />
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                clearFieldError('password')
              }}
              onKeyDown={(event) => {
                setCapsLockOn(event.getModifierState('CapsLock'))
                handleEnterSubmit(event)
              }}
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              aria-invalid={fieldErrors.password ? true : undefined}
              placeholder="Enter your password"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-landing-text outline-none placeholder:text-landing-muted"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-landing-muted transition hover:text-landing-text"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </span>
        </label>

        {(fieldErrors.password || capsLockOn) && (
          <div className="-mt-2 flex items-start justify-between gap-3">
            <div>
              {fieldErrors.password && <p className="text-xs font-bold text-landing-brand">{fieldErrors.password}</p>}
              {capsLockOn && <p className="text-xs font-bold text-landing-primary">Caps lock is on</p>}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {mode === 'signup' && (
            <motion.label
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="block overflow-hidden text-sm font-black text-landing-text"
            >
              Display name
              <span
                className={`mt-2 flex h-12 items-center gap-3 rounded-2xl border bg-landing-bg px-4 ${
                  fieldErrors.displayName ? 'border-landing-brand' : 'border-landing-border'
                }`}
              >
                <Users className="h-5 w-5 text-landing-muted" />
                <input
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(event.target.value)
                    clearFieldError('displayName')
                  }}
                  onKeyDown={handleEnterSubmit}
                  type="text"
                  autoComplete="nickname"
                  aria-invalid={fieldErrors.displayName ? true : undefined}
                  placeholder="Your name"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-landing-text outline-none placeholder:text-landing-muted"
                />
              </span>
              {fieldErrors.displayName && <p className="mt-2 text-xs font-bold text-landing-brand">{fieldErrors.displayName}</p>}
            </motion.label>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={submitDisabled}
          whileHover={{ scale: submitDisabled ? 1 : 1.02 }}
          whileTap={{ scale: submitDisabled ? 1 : 0.98 }}
          layout
          className="mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-landing-primary text-base font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition-colors hover:bg-landing-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {redirecting
            ? 'Opening...'
            : isLockedOut
              ? `Wait ${cooldownSeconds}s`
              : loading
                ? 'Working...'
                : mode === 'login'
                  ? 'Log in'
                  : 'Create account'}
          {submitDisabled ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
        </motion.button>

        <div className="flex items-center justify-center gap-2 pt-2 text-sm font-semibold text-landing-muted">
          <span>{mode === 'login' ? 'New here?' : 'Already moving?'}</span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setDisplayName('')
            }}
            className="font-black text-landing-primary transition hover:text-landing-primary/80"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span className="h-px flex-1 bg-landing-border" />
          <span className="text-xs font-black uppercase tracking-[0.18em] text-landing-muted">or</span>
          <span className="h-px flex-1 bg-landing-border" />
        </div>

        <button
          type="button"
          onClick={onToggleGuest}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-landing-border bg-landing-bg text-base font-black text-landing-text transition hover:-translate-y-0.5 hover:border-landing-primary hover:text-landing-primary"
          aria-expanded={showGuest}
        >
          <Users className="h-5 w-5 text-landing-muted" />
          Continue as guest
        </button>

        {showGuest ? (
          <div className="space-y-3 rounded-2xl border border-landing-border bg-landing-bg p-4">
            <label className="block text-sm font-black text-landing-text">
              Username
              <span
                className={`mt-2 flex h-12 items-center gap-3 rounded-2xl border bg-landing-surface px-4 ${
                  guestError ? 'border-landing-brand' : 'border-landing-border'
                }`}
              >
                <Users className="h-5 w-5 text-landing-muted" />
                <input
                  value={guestName}
                  onChange={(event) => {
                    setGuestName(event.target.value)
                    if (guestError) setGuestError(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onGuestSubmit()
                  }}
                  type="text"
                  autoComplete="nickname"
                  maxLength={24}
                  placeholder="Pick a username"
                  aria-label="Guest username"
                  aria-invalid={guestError ? true : undefined}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-landing-text outline-none placeholder:text-landing-muted"
                />
              </span>
            </label>
            {guestError ? <p className="text-xs font-bold text-landing-brand">{guestError}</p> : null}
            <button
              type="button"
              onClick={onGuestSubmit}
              disabled={submitDisabled}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-landing-success text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-landing-success/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {redirecting ? 'Opening...' : loading ? 'Working...' : 'Explore as guest'}
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-xs font-medium leading-5 text-landing-muted">
              Guests can explore workouts, programs and progress. Messaging is disabled.
            </p>
          </div>
        ) : null}
      </div>
    </motion.aside>
  )
}
