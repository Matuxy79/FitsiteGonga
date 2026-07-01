'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import {
  Activity,
  Apple,
  CalendarDays,
  Dumbbell,
  LineChart,
  MessageCircle,
  Plus,
  Trophy,
  Users,
} from 'lucide-react'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function SectionCard({
  title,
  icon: Icon,
  href,
  children,
  action,
}: {
  title: string
  icon: React.ElementType
  href: string
  children: React.ReactNode
  action?: { label: string; href: string }
}) {
  return (
    <div className="bg-[#eee8d5] rounded-3xl p-6 border border-[#93a1a1]/30 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#dc322f]/10 text-[#dc322f] flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg">{title}</h2>
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-bold text-[#dc322f] hover:text-[#cb4b16] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {action.label}
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
      <Link
        href={href}
        className="mt-4 text-sm font-semibold text-[#657b83] hover:text-[#002b36] flex items-center gap-1"
      >
        Open {title} <span className="text-lg leading-none">→</span>
      </Link>
    </div>
  )
}

function EmptyState({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center h-32 text-center text-[#93a1a1]">
      <Icon className="w-8 h-8 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default function DashboardOverview() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN'
  const isPaid = user?.membership_tier === 'PAID' || isAdmin

  return (
    <div className="space-y-6">
      {/* Quick stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#eee8d5] rounded-2xl p-5 border border-[#93a1a1]/30 shadow-sm">
          <p className="text-sm text-[#657b83] mb-1">This week</p>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-[#93a1a1] mt-1">workouts logged</p>
        </div>
        <div className="bg-[#eee8d5] rounded-2xl p-5 border border-[#93a1a1]/30 shadow-sm">
          <p className="text-sm text-[#657b83] mb-1">Next up</p>
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-[#93a1a1] mt-1">scheduled session</p>
        </div>
        <div className="bg-[#eee8d5] rounded-2xl p-5 border border-[#93a1a1]/30 shadow-sm">
          <p className="text-sm text-[#657b83] mb-1">Meal today</p>
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-[#93a1a1] mt-1">posted by admin</p>
        </div>
        <div className="bg-[#eee8d5] rounded-2xl p-5 border border-[#93a1a1]/30 shadow-sm">
          <p className="text-sm text-[#657b83] mb-1">Community</p>
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-[#93a1a1] mt-1">new mentions</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Workouts" icon={Dumbbell} href="/dashboard/workouts" action={{ label: 'Log', href: '/dashboard/workouts' }}>
          <EmptyState message="No workouts logged yet. Build a template or log a freestyle session." icon={Dumbbell} />
        </SectionCard>

        <SectionCard title="Programs" icon={CalendarDays} href="/dashboard/programs">
          <EmptyState message="No enrolled programs. Browse available programs to add structure to your training." icon={CalendarDays} />
        </SectionCard>

        <SectionCard title="Nutrition" icon={Apple} href="/dashboard/nutrition">
          <EmptyState message="No meal of the day posted yet. Check back soon." icon={Apple} />
        </SectionCard>

        <SectionCard title="Progress" icon={LineChart} href="/dashboard/progress">
          <EmptyState message="Track progress logs here once you start logging workouts and challenges." icon={LineChart} />
        </SectionCard>

        <SectionCard title="Community" icon={Users} href="/dashboard/community">
          <EmptyState message="Join the conversation in squads and channels." icon={MessageCircle} />
        </SectionCard>

        <SectionCard title="Challenges" icon={Trophy} href="/dashboard/challenges">
          <EmptyState message="Challenges are coming soon." icon={Trophy} />
        </SectionCard>
      </div>

      {isAdmin && (
        <div className="bg-[#859900] rounded-3xl p-6 border border-[#859900]">
          <h3 className="font-bold text-lg mb-2">Admin quick actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="px-4 py-2 bg-[#002b36] text-[#fdf6e3] rounded-xl text-sm font-bold hover:bg-[#073642]">
              Admin console
            </Link>
            <Link href="/dashboard/nutrition" className="px-4 py-2 bg-[#fdf6e3] text-[#002b36] rounded-xl text-sm font-bold hover:bg-[#eee8d5]">
              Post meal of the day
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
