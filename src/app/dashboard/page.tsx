'use client'

import { useEffect, useMemo, useState, type ComponentType, type FormEvent, type ReactNode } from 'react'
import {
  Activity,
  Apple,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Crown,
  Dumbbell,
  Flame,
  Heart,
  Image as ImageIcon,
  LineChart,
  LockKeyhole,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
  type LucideProps,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type TierId = 'free' | 'paid' | 'admin'

type DashboardPost = {
  id: string
  author: string
  role: string
  avatar: string
  location: string
  time: string
  content: string
  imageUrl?: string
  likes: number
  replies: number
  tag: string
  stats?: Array<{ label: string; value: string }>
}

const navItems = [
  { label: 'Dashboard', icon: Activity, active: true },
  { label: 'Workouts', icon: Dumbbell },
  { label: 'Programs', icon: CalendarDays },
  { label: 'Nutrition', icon: Apple },
  { label: 'Progress', icon: LineChart },
  { label: 'Community', icon: Users },
  { label: 'Challenges', icon: Trophy },
  { label: 'Settings', icon: Settings },
]

type IconComponent = ComponentType<LucideProps>

const tierOptions: Array<{ id: TierId; label: string; icon: IconComponent }> = [
  { id: 'free', label: 'Free', icon: Users },
  { id: 'paid', label: 'Paid', icon: Crown },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
]

const tierCopy: Record<TierId, { headline: string; subline: string; cta: string; benefits: string[] }> = {
  free: {
    headline: 'Your tier: Free',
    subline: 'Start tracking and join the global community.',
    cta: 'Upgrade',
    benefits: ['Community feed', 'Three tracked workouts', 'Basic progress circles', 'Public challenges'],
  },
  paid: {
    headline: 'Your tier: Paid',
    subline: 'Premium training, deeper stats, and live sessions.',
    cta: 'Manage plan',
    benefits: ['Unlimited workouts', 'Advanced progress analytics', 'Nutrition plans', 'Priority support', 'Live classes'],
  },
  admin: {
    headline: 'Admin view',
    subline: 'Manage members, content, and community health.',
    cta: 'Review reports',
    benefits: ['User management', 'Content moderation', 'Community reports', 'System analytics', 'Announcements'],
  },
}

const seedPosts: DashboardPost[] = [
  {
    id: 'post-run',
    author: 'FitLisa',
    role: 'Paid member',
    avatar: '/assets/gongafit/trainers/card-strength-coaching.png',
    location: 'London, UK',
    time: '2h ago',
    content: 'Early morning conditioning complete. Clear head, steady pace, and a new weekly streak.',
    imageUrl: '/assets/gongafit/trainers/trainer-05-duo.png',
    likes: 128,
    replies: 24,
    tag: 'Wins',
    stats: [
      { label: 'Distance', value: '8.12 km' },
      { label: 'Time', value: '47:32' },
      { label: 'Pace', value: '5:51/km' },
      { label: 'Calories', value: '612 kcal' },
    ],
  },
  {
    id: 'post-strength',
    author: 'StrengthMode',
    role: 'Coach',
    avatar: '/assets/gongafit/trainers/trainer-03.png',
    location: 'Austin, USA',
    time: '4h ago',
    content: 'Lower-body strength day. Squats, lunges, and consistency. What was your workout today?',
    imageUrl: '/assets/gongafit/trainers/trainer-04.png',
    likes: 96,
    replies: 31,
    tag: 'Workouts',
    stats: [
      { label: 'Back squat', value: '4 x 10' },
      { label: 'Walking lunge', value: '3 x 12' },
      { label: 'Leg press', value: '4 x 12' },
      { label: 'Calf raises', value: '4 x 15' },
    ],
  },
]

const progressMetrics = [
  { label: 'Workouts', value: '4/5', hint: 'sessions', color: '#ff5d4f' },
  { label: 'Activity', value: '278', hint: 'mins', color: '#b8ec16' },
  { label: 'Steps', value: '18,240', hint: 'steps', color: '#ee4fa3' },
  { label: 'Calories', value: '2,145', hint: 'kcal', color: '#c75fb4' },
]

const pulseMetrics = [
  { label: 'Members online', value: '1,248' },
  { label: 'Workouts today', value: '3,642' },
  { label: 'Posts today', value: '412' },
  { label: 'Countries', value: '68' },
]

const liveClasses = [
  {
    title: 'HIIT Burn',
    coach: 'Coach Mia',
    meta: 'Live now',
    imageUrl: '/assets/gongafit/trainers/trainer-02-protein.png',
    live: true,
  },
  {
    title: 'Strength Basics',
    coach: 'Coach Marcus',
    meta: 'Tomorrow, 7:00 PM',
    imageUrl: '/assets/gongafit/trainers/trainer-01.png',
    live: false,
  },
]

const adminActions = [
  { label: 'Manage users', icon: Users },
  { label: 'Manage content', icon: ShieldCheck },
  { label: 'Community reports', icon: MessageCircle },
  { label: 'System analytics', icon: BarChart3 },
]

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const [activeTier, setActiveTier] = useState<TierId>('paid')
  const [composerText, setComposerText] = useState('')
  const [posts, setPosts] = useState<DashboardPost[]>(seedPosts)

  useEffect(() => {
    if (user?.role === 'ADMIN') setActiveTier('admin')
    else if (user?.role === 'TRAINER') setActiveTier('paid')
  }, [user?.role])

  const memberName = user?.display_name || 'Tuxbirb'
  const memberEmail = user?.email || 'demo@gongafit.local'
  const memberRole = user?.role || 'CLIENT'

  const welcomeText = useMemo(() => {
    if (loading) return 'Loading your training space...'
    return `Welcome back, ${memberName}. Let's crush your goals today.`
  }, [loading, memberName])

  const handleShare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = composerText.trim()
    if (!trimmed) return

    setPosts((current) => [
      {
        id: `post-${Date.now()}`,
        author: memberName,
        role: activeTier === 'admin' ? 'Admin' : activeTier === 'paid' ? 'Paid member' : 'Free member',
        avatar: user?.avatar_url || '',
        location: 'GongaFit',
        time: 'Just now',
        content: trimmed,
        likes: 0,
        replies: 0,
        tag: 'Community',
      },
      ...current,
    ])
    setComposerText('')
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-[#f4fbff] text-[#172033]">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-[264px] shrink-0 flex-col border-r border-[#dbeaf3] bg-white px-4 py-6 xl:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5d4f] text-2xl font-black text-white shadow-[0_12px_26px_rgba(255,93,79,0.25)]">
              G
            </div>
            <div className="text-3xl font-black tracking-[-0.02em]">
              Gonga<span className="text-[#ff5d4f]">Fit</span>
            </div>
          </div>

          <nav className="mt-8 space-y-1.5">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={`flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-black transition ${
                  active
                    ? 'bg-[#ff5d4f] text-white shadow-[0_14px_26px_rgba(255,93,79,0.28)]'
                    : 'text-[#46546a] hover:bg-[#f1f8fc] hover:text-[#172033]'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-[#dbeaf3] bg-white p-3 shadow-[0_16px_40px_rgba(35,96,136,0.10)]">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="h-12 w-12 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#172033] text-sm font-black text-white">
                  {initials(memberName)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{memberName}</p>
                <p className="truncate text-xs font-bold text-[#83a400]">{tierCopy[activeTier].headline.replace('Your tier: ', '')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex h-10 w-full items-center justify-between rounded-2xl border border-[#e3edf4] px-3 text-xs font-black text-[#657185] transition hover:border-[#ffb6ad] hover:text-[#ff5d4f]"
            >
              Log out
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <header className="sticky top-0 z-20 -mx-4 mb-5 border-b border-white/80 bg-[#f4fbff]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3 xl:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff5d4f] text-xl font-black text-white">
                    G
                  </div>
                  <div className="text-2xl font-black">
                    Gonga<span className="text-[#ff5d4f]">Fit</span>
                  </div>
                </div>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#172033] xl:mt-0 xl:text-4xl">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm font-semibold text-[#657185]">{welcomeText}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-2xl border border-[#cfdee8] bg-white p-1 shadow-[0_10px_30px_rgba(35,96,136,0.10)]">
                  {tierOptions.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTier(id)}
                      className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                        activeTier === id ? 'bg-[#d7fb48] text-[#172033]' : 'text-[#657185] hover:bg-[#f4fbff]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#172033] shadow-[0_10px_26px_rgba(35,96,136,0.10)]">
                  <Search className="h-5 w-5" />
                </button>
                <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#172033] shadow-[0_10px_26px_rgba(35,96,136,0.10)]">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ff5d4f]" />
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[304px_minmax(0,1fr)] 2xl:grid-cols-[304px_minmax(0,1fr)_368px]">
            <section className="order-2 space-y-5 lg:order-1">
              <Panel className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f8ff] text-[#172033]">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Community pulse</h2>
                    <p className="text-xs font-semibold text-[#657185]">What is happening in GongaFit.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {pulseMetrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#657185]">{metric.label}</span>
                      <span className="rounded-lg bg-[#f4fbff] px-2.5 py-1 font-black">{metric.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex h-16 items-end gap-2">
                  {[24, 30, 48, 36, 46, 33, 55, 68].map((height, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-t-full bg-[#b8ec16]"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <button type="button" className="mt-5 h-12 w-full rounded-2xl border border-[#dbeaf3] text-sm font-black text-[#46546a] transition hover:border-[#ffb6ad] hover:text-[#ff5d4f]">
                  View community feed
                </button>
              </Panel>

              <Panel className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black">Your progress</h2>
                  <button type="button" className="flex items-center gap-1 text-xs font-black text-[#657185]">
                    This week
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {progressMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-3xl border border-[#e3edf4] bg-white p-4">
                      <div
                        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[7px] bg-white"
                        style={{ borderColor: metric.color }}
                      >
                        <div className="text-center">
                          <p className="text-lg font-black">{metric.value}</p>
                          <p className="text-[10px] font-bold text-[#657185]">{metric.hint}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-center text-xs font-black text-[#657185]">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <button type="button" className="mt-4 h-12 w-full rounded-2xl border border-[#dbeaf3] text-sm font-black text-[#46546a] transition hover:border-[#b8ec16] hover:text-[#6f8f00]">
                  View progress
                </button>
              </Panel>
            </section>

            <section className="order-1 min-w-0 rounded-[28px] bg-white p-4 shadow-[0_20px_60px_rgba(35,96,136,0.12)] sm:p-5 lg:order-2">
              <div className="flex flex-col gap-3 border-b border-[#e3edf4] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f8ff] text-[#172033]">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.02em]">Global Community</h2>
                    <p className="text-sm font-semibold text-[#657185]">Share, inspire, and grow together.</p>
                  </div>
                </div>
                <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-[#e3edf4] px-4 text-sm font-black text-[#46546a]">
                  <Flame className="h-4 w-4 text-[#ff5d4f]" />
                  Top
                </button>
              </div>

              <form onSubmit={handleShare} className="mt-5 rounded-3xl border border-[#dbeaf3] bg-white p-3">
                <div className="flex items-start gap-3">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-11 w-11 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#172033] text-xs font-black text-white">
                      {initials(memberName)}
                    </div>
                  )}
                  <textarea
                    value={composerText}
                    onChange={(event) => setComposerText(event.target.value)}
                    placeholder="Share progress, ask a question, or motivate the community..."
                    rows={3}
                    className="min-h-[72px] flex-1 resize-none rounded-2xl bg-[#f8fcff] px-4 py-3 text-sm font-semibold text-[#172033] outline-none placeholder:text-[#8d9aaa]"
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-xs font-black text-[#657185]">
                    <ComposerTool icon={ImageIcon} label="Photo" />
                    <ComposerTool icon={Zap} label="Workout" />
                    <ComposerTool icon={BarChart3} label="Poll" />
                    <ComposerTool icon={Sparkles} label="Feeling" />
                  </div>
                  <button
                    type="submit"
                    className="flex h-11 items-center gap-2 rounded-2xl bg-[#ff5d4f] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,93,79,0.28)] transition hover:bg-[#ff4939]"
                  >
                    Share progress
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {['All Posts', 'Following', 'Workouts', 'Nutrition', 'Wins'].map((tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    className={`h-10 rounded-2xl px-4 text-sm font-black transition ${
                      index === 0 ? 'bg-[#ff5d4f] text-white' : 'text-[#657185] hover:bg-[#f4fbff] hover:text-[#172033]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                {posts.map((post) => (
                  <CommunityPost key={post.id} post={post} />
                ))}
              </div>
            </section>

            <section className="order-3 space-y-5 lg:col-span-2 2xl:col-span-1">
              <Panel className="p-5">
                <h2 className="text-xl font-black">{tierCopy[activeTier].headline}</h2>
                <p className="mt-1 text-sm font-bold text-[#83a400]">{tierCopy[activeTier].subline}</p>
                <div className="mt-5 space-y-3">
                  {tierCopy[activeTier].benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3 text-sm font-bold text-[#46546a]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d7fb48] text-[#172033]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {benefit}
                    </div>
                  ))}
                </div>
                <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#d7fb48] text-sm font-black text-[#172033] transition hover:bg-[#cafa2d]">
                  {tierCopy[activeTier].cta}
                  {activeTier === 'free' ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </button>
              </Panel>

              <Panel className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black">Live & Upcoming</h2>
                  <button type="button" className="text-xs font-black text-[#657185]">View all</button>
                </div>
                <div className="space-y-4">
                  {liveClasses.map((item) => (
                    <div key={item.title} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                      <div className="relative h-24 overflow-hidden rounded-2xl bg-[#e9f8ff]">
                        <img src={item.imageUrl} alt="" className="h-full w-full object-cover object-top" />
                        <span className={`absolute left-2 top-2 rounded-lg px-2 py-1 text-[10px] font-black text-white ${item.live ? 'bg-[#ff5d4f]' : 'bg-[#b8ec16] !text-[#172033]'}`}>
                          {item.live ? 'LIVE' : 'SOON'}
                        </span>
                      </div>
                      <div className="min-w-0 py-1">
                        <h3 className="truncate text-sm font-black">{item.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-[#657185]">with {item.coach}</p>
                        <p className="mt-2 text-xs font-bold text-[#46546a]">{item.meta}</p>
                        <button className={`mt-3 h-9 rounded-xl px-4 text-xs font-black ${item.live ? 'bg-[#ff5d4f] text-white' : 'border border-[#dbeaf3] text-[#46546a]'}`}>
                          {item.live ? 'Join Live' : 'Remind me'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black">Admin quick actions</h2>
                  <span className="flex items-center gap-1 rounded-xl bg-[#e9f8ff] px-3 py-1.5 text-xs font-black text-[#46546a]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin
                  </span>
                </div>
                <div className={activeTier === 'admin' ? 'grid grid-cols-2 gap-3' : 'relative grid grid-cols-2 gap-3'}>
                  {adminActions.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={activeTier !== 'admin'}
                      className="flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border border-[#e3edf4] bg-white px-3 text-xs font-black text-[#46546a] transition hover:border-[#ffb6ad] hover:text-[#ff5d4f] disabled:opacity-45"
                    >
                      <Icon className="h-4 w-4 text-[#ff5d4f]" />
                      {label}
                    </button>
                  ))}
                  {activeTier !== 'admin' && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 rounded-2xl bg-[#172033] px-4 py-2 text-xs font-black text-white">
                        <LockKeyhole className="h-4 w-4" />
                        Switch to Admin
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-[28px] border border-white bg-white shadow-[0_20px_60px_rgba(35,96,136,0.12)] ${className || ''}`}>
      {children}
    </div>
  )
}

function ComposerTool({ icon: Icon, label }: { icon: IconComponent; label: string }) {
  return (
    <button type="button" className="flex h-9 items-center gap-2 rounded-xl px-3 transition hover:bg-[#f4fbff] hover:text-[#172033]">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function CommunityPost({ post }: { post: DashboardPost }) {
  return (
    <article className="rounded-[26px] border border-[#dbeaf3] bg-white p-4 shadow-[0_14px_34px_rgba(35,96,136,0.08)]">
      <div className="flex items-start gap-3">
        {post.avatar ? (
          <img src={post.avatar} alt="" className="h-11 w-11 rounded-2xl object-cover object-top" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#172033] text-xs font-black text-white">
            {initials(post.author)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black">{post.author}</h3>
            <span className="rounded-full bg-[#d7fb48] px-2 py-0.5 text-[10px] font-black text-[#172033]">{post.role}</span>
            <span className="text-xs font-bold text-[#8d9aaa]">{post.time}</span>
            <span className="text-xs font-bold text-[#8d9aaa]">{post.location}</span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#46546a]">{post.content}</p>
        </div>
        <button type="button" className="rounded-xl p-2 text-[#8d9aaa] transition hover:bg-[#f4fbff] hover:text-[#172033]">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {(post.imageUrl || post.stats) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_220px]">
          {post.imageUrl && (
            <div className="h-60 overflow-hidden rounded-3xl bg-[#e9f8ff] sm:h-72 lg:h-56">
              <img src={post.imageUrl} alt="" className="h-full w-full object-cover object-top" />
            </div>
          )}
          {post.stats && (
            <div className="rounded-3xl bg-[#e9f8ff] p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#657185]">{post.tag}</p>
              <div className="space-y-3">
                {post.stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-[#46546a]">{stat.label}</span>
                    <span className="font-black text-[#172033]">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-2 text-sm font-black text-[#ff5d4f]">
            <Heart className="h-5 w-5 fill-current" />
            {post.likes}
          </button>
          <button type="button" className="flex items-center gap-2 text-sm font-black text-[#657185]">
            <MessageCircle className="h-5 w-5" />
            {post.replies}
          </button>
        </div>
        <div className="hidden -space-x-2 sm:flex">
          {['A', 'M', 'J', 'K', 'T'].map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#172033] text-[10px] font-black text-white"
            >
              {letter}
            </span>
          ))}
          <span className="flex h-7 items-center rounded-full border-2 border-white bg-[#f4fbff] px-2 text-[10px] font-black text-[#657185]">
            +{post.likes > 10 ? 16 : 1}
          </span>
        </div>
      </div>
    </article>
  )
}
