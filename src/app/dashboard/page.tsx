'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import {
  Apple,
  CalendarDays,
  Dumbbell,
  LineChart,
  MessageCircle,
  Plus,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react'

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

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
    <motion.div
      variants={itemVariants}
      className="group flex h-full flex-col rounded-3xl border border-clean-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-gray-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clean-accent-soft text-clean-accent transition-colors duration-200 group-hover:bg-clean-accent group-hover:text-white">
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-clean-text">{title}</h2>
        </div>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-clean-accent transition-colors duration-150 hover:bg-clean-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-clean-accent/25"
          >
            <Plus className="w-3.5 h-3.5" />
            {action.label}
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-clean-muted transition-colors duration-150 group-hover:text-clean-text focus:outline-none focus-visible:ring-2 focus-visible:ring-clean-accent/25 rounded"
      >
        Open {title}{' '}
        <span className="text-lg leading-none transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </Link>
    </motion.div>
  )
}

function EmptyState({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-clean-border bg-clean-surface-2 px-4 text-center">
      <Icon className="h-8 w-8 text-clean-muted opacity-40" />
      <p className="max-w-[28ch] text-sm leading-5 text-clean-muted">{message}</p>
    </div>
  )
}

export default function DashboardOverview() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN'
  const isPaid = user?.membership_tier === 'PAID' || isAdmin

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {/* Quick stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={itemVariants}
          className="group rounded-2xl border border-clean-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-clean-muted">This week</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-clean-accent-soft text-clean-accent">
              <Dumbbell className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-clean-text">0</p>
          <p className="mt-1 text-xs text-clean-muted">workouts logged</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="group rounded-2xl border border-clean-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-clean-muted">Next up</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-clean-accent-soft text-clean-accent">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-clean-muted">—</p>
          <p className="mt-1 text-xs text-clean-muted">scheduled session</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="group rounded-2xl border border-clean-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-clean-muted">Meal today</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-clean-accent-soft text-clean-accent">
              <Apple className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-clean-muted">—</p>
          <p className="mt-1 text-xs text-clean-muted">posted by admin</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="group rounded-2xl border border-clean-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-clean-muted">Community</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-clean-accent-soft text-clean-accent">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-clean-text">0</p>
          <p className="mt-1 text-xs text-clean-muted">new mentions</p>
        </motion.div>
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
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-clean-border bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clean-text text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-clean-text">Admin quick actions</h3>
              <p className="text-xs text-clean-muted">Shortcuts for content and moderation</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-clean-text px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-clean-text/85 active:bg-clean-text/75"
            >
              <Settings className="h-4 w-4" /> Admin console
            </Link>
            <Link
              href="/dashboard/nutrition"
              className="inline-flex items-center gap-2 rounded-xl bg-clean-hover px-4 py-2.5 text-sm font-semibold text-clean-text transition-colors duration-150 hover:bg-gray-200 active:bg-gray-300"
            >
              <Apple className="h-4 w-4" /> Post meal of the day
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
