'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Apple,
  Bell,
  CalendarDays,
  Dumbbell,
  LineChart,
  LogOut,
  Search,
  Settings,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Activity },
  { label: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
  { label: 'Programs', href: '/dashboard/programs', icon: CalendarDays },
  { label: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
  { label: 'Progress', href: '/dashboard/progress', icon: LineChart },
  { label: 'Community', href: '/dashboard/community', icon: Users },
  { label: 'Challenges', href: '/dashboard/challenges', icon: Trophy },
]

// Bottom nav items for mobile
const bottomNavItems = [
  { label: 'Home', href: '/dashboard', icon: Activity },
  { label: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
  { label: 'Programs', href: '/dashboard/programs', icon: CalendarDays },
  { label: 'Community', href: '/dashboard/community', icon: Users },
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
  const router = useRouter()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('gongafit-sidebar-collapsed')
    if (saved) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    localStorage.setItem('gongafit-sidebar-collapsed', (!isCollapsed).toString())
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/?reason=session-expired')
    }
  }, [loading, user, router])

  const handleLogout = async () => {
    await logout()
    router.replace('/?reason=signed-out')
  }

  const isPro = user?.role === 'ADMIN' || user?.membership_tier === 'PAID'
  const tierLabel = user?.role === 'ADMIN' ? 'Admin' : isPro ? 'Pro Member' : 'Free'
  
  // Clean green badge for Pro/Admin, subtle gray for Free
  const tierClass = isPro
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-gray-100 text-gray-600'

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64'
  const mainMarginClass = isCollapsed ? 'md:ml-20' : 'md:ml-64'

  if (!isMounted) return null

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const currentSectionName = 
    [...navItems, { label: 'Settings', href: '/dashboard/settings' }]
    .find(item => isActiveRoute(item.href))?.label || 'Dashboard'

  return (
    <div className="min-h-screen bg-clean-bg text-clean-text flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-clean-sidebar border-r border-clean-border flex-col z-30 transition-all duration-300 hidden md:flex`}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between overflow-hidden shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-clean-accent flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0">G</div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xl font-bold tracking-tight whitespace-nowrap"
                >
                  GongaFit
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button 
            onClick={toggleCollapse} 
            className="p-1.5 rounded-md text-clean-muted hover:bg-clean-hover hover:text-clean-text transition-colors shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Profile Card */}
        <div className="px-4 pb-6 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-clean-border bg-white shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
            {user?.avatar_url ? (
              <img src={avatarUrl(user.avatar_url)} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-gray-100 text-gray-700">
                {initials(user?.display_name || 'GF')}
              </div>
            )}
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-clean-text">
                  {user?.display_name || 'Profile'}
                </p>
                <div className={`inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tierClass}`}>
                  {tierLabel}
                </div>
              </div>
            )}
            
            {!isCollapsed && (
              <ChevronDown className="w-4 h-4 text-clean-muted shrink-0" />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto discord-scrollbar px-3 space-y-1 pb-4 overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-clean-muted nav-item-hover'
                  } ${isCollapsed ? 'justify-center' : 'px-4'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-pill"
                      className="absolute inset-0 bg-clean-accent rounded-xl z-0"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </div>
                </Link>
                {isCollapsed && (
                  <div className="sidebar-tooltip">
                    {item.label}
                  </div>
                )}
              </div>
            )
          })}

          <div className="my-4 border-t border-clean-border mx-2" />

          {/* Settings Item */}
          <div className="relative group">
            <Link
              href="/dashboard/settings"
              className={`relative flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                isActiveRoute('/dashboard/settings')
                  ? 'text-white shadow-sm'
                  : 'text-clean-muted nav-item-hover'
              } ${isCollapsed ? 'justify-center' : 'px-4'}`}
            >
              {isActiveRoute('/dashboard/settings') && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  className="absolute inset-0 bg-clean-accent rounded-xl z-0"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <Settings className={`w-5 h-5 shrink-0 ${isActiveRoute('/dashboard/settings') ? 'text-white' : ''}`} />
                {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
              </div>
            </Link>
            {isCollapsed && (
              <div className="sidebar-tooltip">
                Settings
              </div>
            )}
          </div>
        </nav>

        {/* Sign Out (Bottom) */}
        <div className="p-4 shrink-0">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 p-2 w-full rounded-xl text-sm font-medium text-clean-muted hover:bg-clean-hover hover:text-clean-text transition-colors ${isCollapsed ? 'justify-center' : 'px-4'}`}
            >
              <LogOut className="w-5 h-5 shrink-0 opacity-80" />
              {!isCollapsed && <span className="whitespace-nowrap">Sign out</span>}
            </button>
            {isCollapsed && (
              <div className="sidebar-tooltip">
                Sign out
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className={`flex-1 transition-all duration-300 ${mainMarginClass} flex flex-col min-h-screen pb-16 md:pb-0 bg-clean-bg`}>
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-clean-border px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-clean-accent flex items-center justify-center text-white font-bold text-sm">G</div>
            <h1 className="text-lg font-bold text-clean-text">{currentSectionName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full text-clean-muted hover:bg-clean-hover">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-clean-accent rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-10 bg-clean-bg/80 backdrop-blur-md px-8 py-4 items-center justify-between border-b border-clean-border/50">
          <div>
            <h1 className="text-2xl font-bold animate-fade-in text-clean-text">{currentSectionName}</h1>
            <p className="text-sm text-clean-muted">
              {loading ? 'Loading your training space...' : `Welcome back, ${user?.display_name || 'athlete'}.`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clean-muted group-focus-within:text-clean-accent transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-full bg-white border border-clean-border text-sm focus:outline-none focus:ring-2 focus:ring-clean-accent/30 focus:border-clean-accent/50 w-48 transition-all"
              />
            </div>

            <button className="relative p-2.5 rounded-full bg-white border border-clean-border text-clean-muted hover:bg-clean-hover transition-colors shadow-sm hover:shadow">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-clean-accent rounded-full border border-white" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 md:px-8 animate-slide-up">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-clean-border bottom-bar-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <nav className="flex items-center justify-around px-2 pt-2 pb-1">
          {bottomNavItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-16 h-12"
              >
                <div className={`relative z-10 p-1.5 rounded-full transition-colors ${isActive ? 'text-clean-accent' : 'text-clean-muted'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-indicator"
                    className="absolute bottom-0 w-1.5 h-1.5 bg-clean-accent rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

