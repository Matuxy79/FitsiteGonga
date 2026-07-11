'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, Medal, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/lib/media'
import { CommunityRepository, type Leaderboard, type CommunityProfile } from '@/repositories/CommunityRepository'
import { Avatar, FlairBadge } from './Badges'

interface LeaderboardPanelProps {
  currentUserId: string
  profile: CommunityProfile | null
  className?: string
}

export function LeaderboardPanel({ currentUserId, profile, className }: LeaderboardPanelProps) {
  const [period, setPeriod] = useState<'week' | 'all'>('week')
  const [board, setBoard] = useState<Leaderboard | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    CommunityRepository.getLeaderboard(period)
      .then(setBoard)
      .catch(() => setBoard(null))
      .finally(() => setLoading(false))
  }, [period])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  const earned = profile?.achievements.filter((a) => a.earned) ?? []

  return (
    <aside className={cn('w-72 bg-clean-sidebar border-l border-clean-border flex flex-col overflow-y-auto', className)}>
      {/* Leaderboard */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-clean-text">
            <Trophy className="w-4 h-4 text-amber-500" />
            Leaderboard
          </div>
          <div className="inline-flex rounded-lg border border-clean-border bg-white p-0.5">
            {(['week', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors',
                  period === p ? 'bg-clean-accent text-white' : 'text-clean-muted hover:text-clean-text',
                )}
              >
                {p === 'week' ? 'Week' : 'All time'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {loading && !board && (
            <div className="py-6 text-center text-xs text-clean-muted">Loading…</div>
          )}
          {board?.entries.length === 0 && (
            <div className="py-6 text-center text-xs text-clean-muted">No XP earned yet — get moving! 💪</div>
          )}
          {board?.entries.map((entry) => (
            <div
              key={entry.user.id}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors',
                entry.user.id === currentUserId ? 'border border-clean-accent/20 bg-clean-accent-soft' : 'hover:bg-clean-hover',
              )}
            >
              <RankBadge rank={entry.rank} />
              <Avatar src={mediaUrl(entry.user.avatar_url)} name={entry.user.display_name} size={7} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-clean-text truncate">{entry.user.display_name}</span>
                  <FlairBadge role={entry.user.role} membershipTier={entry.user.membership_tier} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-clean-muted">
                  <span className="font-mono">Lv {entry.user.stats?.level ?? 1}</span>
                  {(entry.user.stats?.current_streak ?? 0) > 0 && (
                    <span className="flex items-center gap-0.5 text-orange-500">
                      <Flame className="w-2.5 h-2.5" />
                      {entry.user.stats?.current_streak}
                    </span>
                  )}
                </div>
              </div>
              <span className="ml-auto shrink-0 font-mono text-xs text-status-warning-text">{entry.xp.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {board && board.me.rank > (board.entries.length || 0) && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-clean-border bg-white px-2.5 py-2 text-xs">
            <span className="text-clean-muted">
              Your rank: <span className="font-semibold text-clean-text">#{board.me.rank}</span>
            </span>
            <span className="font-mono text-status-warning-text">{board.me.xp.toLocaleString()} XP</span>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="p-4 border-t border-clean-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-clean-text mb-3">
          <Medal className="w-4 h-4 text-clean-accent" />
          Achievements
          <span className="text-xs font-normal text-clean-muted">
            {earned.length}/{profile?.achievements.length ?? 0}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {(profile?.achievements ?? []).map((a) => (
            <div
              key={a.id}
              title={`${a.name}${a.earned ? '' : ' (locked)'} — ${a.description}`}
              className={cn(
                'flex aspect-square items-center justify-center rounded-lg border text-lg transition-transform duration-150 hover:scale-110',
                a.earned
                  ? 'border-status-warning/30 bg-status-warning-soft'
                  : 'border-clean-border bg-white opacity-30 grayscale',
              )}
            >
              {a.icon}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const colors = ['text-amber-500', 'text-gray-400', 'text-amber-700']
    return <Medal className={cn('w-4 h-4 shrink-0', colors[rank - 1])} />
  }
  return <span className="w-4 text-[10px] font-mono text-clean-muted text-center shrink-0">{rank}</span>
}
