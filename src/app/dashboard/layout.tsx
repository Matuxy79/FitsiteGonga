'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Activity,
  Apple,
  Bell,
  CalendarDays,
  Crown,
  Dumbbell,
  LineChart,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Activity },
  { label: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
  { label: 'Programs', href: '/dashboard/programs', icon: CalendarDays },
  { label: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
  { label: 'Progress', href: '/dashboard/progress', icon: LineChart },
  { label: 'Community', href: '/dashboard/community', icon: Users },
  { label: 'Challenges', href: '/dashboard/challenges', icon: Trophy },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
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

function avatarUrl(key?: string | null) {
  if (!key) return undefined
  if (key.startsWith('http')) return key
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media/${key}`
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()

  const tierLabel = user?.role === 'ADMIN' ? 'Admin' : user?.membership_tier === 'PAID' ? 'Paid' : 'Free'
  const TierIcon = user?.role === 'ADMIN' ? ShieldCheck : user?.membership_tier === 'PAID' ? Crown : Users
  const tierClass =
    user?.role === 'ADMIN'
      ? 'bg-[#d7fb48] text-black'
      : user?.membership_tier === 'PAID'
      ? 'bg-[#ff5d4f] text-white'
      : 'bg-white text-gray-700 border border-gray-200'

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 p-6 flex flex-col z-20">
        <Link href="/dashboard" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#ff5d4f] flex items-center justify-center text-white font-bold text-lg">G</div>
          <span className="text-xl font-bold tracking-tight">GongaFit</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#ff5d4f] text-white shadow-md shadow-[#ff5d4f]/20'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#f4f6f8]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">
              {loading ? 'Loading your training space...' : `Welcome back, ${user?.display_name || 'athlete'}. Let's crush your goals today.`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="pl-9 pr-4 py-2 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d4f]/30 w-48"
              />
            </div>

            <button className="relative p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#ff5d4f] rounded-full" />
            </button>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${tierClass}`}>
              <TierIcon className="w-3.5 h-3.5" />
              {tierLabel}
            </div>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {user?.avatar_url ? (
                <img src={avatarUrl(user.avatar_url)} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff5d4f] to-[#ff8a80] flex items-center justify-center text-white text-xs font-bold">
                  {initials(user?.display_name || 'GF')}
                </div>
              )}
              <span className="text-sm font-semibold hidden lg:block">{user?.display_name || 'Profile'}</span>
            </Link>
          </div>
        </header>

        <main className="px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
