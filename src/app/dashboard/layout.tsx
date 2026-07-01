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
  Crown,
  Dumbbell,
  LineChart,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navGroups = [
  {
    title: 'Train',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Activity },
      { label: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
      { label: 'Programs', href: '/dashboard/programs', icon: CalendarDays },
    ],
  },
  {
    title: 'Track',
    items: [
      { label: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
      { label: 'Progress', href: '/dashboard/progress', icon: LineChart },
    ],
  },
  {
    title: 'Connect',
    items: [
      { label: 'Community', href: '/dashboard/community', icon: Users },
      { label: 'Challenges', href: '/dashboard/challenges', icon: Trophy },
    ],
  },
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
  
  // Collapse state
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

  const tierLabel = user?.role === 'ADMIN' ? 'Admin' : user?.membership_tier === 'PAID' ? 'Paid' : 'Free'
  const TierIcon = user?.role === 'ADMIN' ? ShieldCheck : user?.membership_tier === 'PAID' ? Crown : Users

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64'
  const mainMarginClass = isCollapsed ? 'md:ml-20' : 'md:ml-64'

  if (!isMounted) return null

  // Function to determine if a route is active
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Get current section name for mobile header
  const currentSectionName = 
    [...navGroups.flatMap(g => g.items), { label: 'Settings', href: '/dashboard/settings' }]
    .find(item => isActiveRoute(item.href))?.label || 'Dashboard'

  return (
    <div className="min-h-screen bg-[#fdf6e3] text-[#002b36] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-[#eee8d5] border-r border-[#93a1a1]/30 flex-col z-30 transition-all duration-300 shadow-discord hidden md:flex`}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between overflow-hidden">
          <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#dc322f] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow-discord-glow transition-shadow duration-300 shrink-0">G</div>
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
            className="p-1.5 rounded-md text-[#657b83] hover:bg-[#fdf6e3] hover:text-[#002b36] transition-colors shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto discord-scrollbar px-3 space-y-6 pb-4 overflow-x-hidden">
          {navGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-xs font-bold text-[#93a1a1] uppercase tracking-wider whitespace-nowrap"
                >
                  {group.title}
                </motion.div>
              )}
              {group.items.map((item, index) => {
                const isActive = isActiveRoute(item.href)
                
                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'text-white shadow-md shadow-[#dc322f]/20'
                          : 'text-[#657b83] nav-item-hover'
                      } ${isCollapsed ? 'justify-center' : 'px-4'}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-sidebar-pill"
                          className="absolute inset-0 bg-[#dc322f] rounded-xl z-0"
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
            </div>
          ))}
        </nav>

        {/* Profile Card & Settings (Bottom) */}
        <div className="p-4 border-t border-[#93a1a1]/30 bg-[#eee8d5]">
          <div className="relative group mb-1">
            <Link
              href="/dashboard/settings"
              className={`relative flex items-center gap-3 p-2 rounded-xl transition-colors duration-200 ${
                isActiveRoute('/dashboard/settings')
                  ? 'text-white shadow-md shadow-[#dc322f]/20'
                  : 'text-[#657b83] nav-item-hover'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isActiveRoute('/dashboard/settings') && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  className="absolute inset-0 bg-[#dc322f] rounded-xl z-0"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3 w-full">
                {user?.avatar_url ? (
                  <img src={avatarUrl(user.avatar_url)} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isActiveRoute('/dashboard/settings') ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-[#dc322f] to-[#cb4b16] text-white'}`}>
                    {initials(user?.display_name || 'GF')}
                  </div>
                )}
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActiveRoute('/dashboard/settings') ? 'text-white' : 'text-[#002b36]'}`}>
                      {user?.display_name || 'Profile'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <TierIcon className={`w-3 h-3 ${isActiveRoute('/dashboard/settings') ? 'text-white/80' : 'text-[#b58900]'}`} />
                      <span className={`text-xs truncate ${isActiveRoute('/dashboard/settings') ? 'text-white/80' : 'text-[#657b83]'}`}>{tierLabel}</span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
            {isCollapsed && (
              <div className="sidebar-tooltip">
                Settings & Profile
              </div>
            )}
          </div>
          
          <div className="relative group mt-2">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 p-3 w-full rounded-xl text-sm font-semibold text-[#657b83] nav-item-hover ${isCollapsed ? 'justify-center' : 'px-4'}`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
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
      <div className={`flex-1 transition-all duration-300 ${mainMarginClass} flex flex-col min-h-screen pb-16 md:pb-0`}>
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-[#fdf6e3]/90 backdrop-blur-md border-b border-[#93a1a1]/30 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#dc322f] flex items-center justify-center text-white font-bold text-sm">G</div>
            <h1 className="text-lg font-bold">{currentSectionName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full text-[#657b83] hover:bg-[#eee8d5]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#dc322f] rounded-full border-2 border-[#fdf6e3]" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-10 bg-[#fdf6e3]/80 backdrop-blur-md px-8 py-4 items-center justify-between border-b border-[#93a1a1]/10">
          <div>
            <h1 className="text-2xl font-bold animate-fade-in">{currentSectionName}</h1>
            <p className="text-sm text-[#657b83]">
              {loading ? 'Loading your training space...' : `Welcome back, ${user?.display_name || 'athlete'}.`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93a1a1] group-focus-within:text-[#268bd2] transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-full bg-[#eee8d5] border border-[#93a1a1]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#268bd2]/30 focus:border-[#268bd2]/50 focus:bg-[#fdf6e3] w-48 transition-all"
              />
            </div>

            <button className="relative p-2.5 rounded-full bg-[#eee8d5] border border-[#93a1a1]/30 text-[#657b83] hover:bg-white transition-colors shadow-sm hover:shadow">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#dc322f] rounded-full border border-[#fdf6e3]" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 md:px-8 animate-slide-up">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#eee8d5] border-t border-[#93a1a1]/30 bottom-bar-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,43,54,0.05)]">
        <nav className="flex items-center justify-around px-2 pt-2 pb-1">
          {bottomNavItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-16 h-12"
              >
                <div className={`relative z-10 p-1.5 rounded-full transition-colors ${isActive ? 'text-[#dc322f]' : 'text-[#657b83]'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-indicator"
                    className="absolute bottom-0 w-1.5 h-1.5 bg-[#dc322f] rounded-full"
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
