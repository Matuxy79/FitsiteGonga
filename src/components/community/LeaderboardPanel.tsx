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
    <aside className={cn('w-72 bg-black/40 border-l border-white/5 flex flex-col overflow-y-auto', className)}>
      {/* Leaderboard */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Trophy className="w-4 h-4 text-amber-400" />
            Leaderboard
          </div>
          <div className="flex bg-zinc-900 rounded-lg p-0.5">
            {(['week', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors',
                  period === p ? 'bg-[#E8453C] text-white' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {p === 'week' ? 'Week' : 'All time'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {loading && !board && (
            <div className="py-6 text-center text-xs text-slate-600">Loading…</div>
          )}
          {board?.entries.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-600">No XP earned yet — get moving! 💪</div>
          )}
          {board?.entries.map((entry) => (
            <div
              key={entry.user.id}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-xl',
                entry.user.id === currentUserId ? 'bg-[#E8453C]/10 border border-[#E8453C]/20' : 'hover:bg-white/[0.03]',
              )}
            >
              <RankBadge rank={entry.rank} />
              <Avatar src={mediaUrl(entry.user.avatar_url)} name={entry.user.display_name} size={7} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 truncate">{entry.user.display_name}</span>
                  <FlairBadge role={entry.user.role} membershipTier={entry.user.membership_tier} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="font-mono">Lv {entry.user.stats?.level ?? 1}</span>
                  {(entry.user.stats?.current_streak ?? 0) > 0 && (
                    <span className="flex items-center gap-0.5 text-orange-400">
                      <Flame className="w-2.5 h-2.5" />
                      {entry.user.stats?.current_streak}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400 shrink-0">{entry.xp.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {board && board.me.rank > (board.entries.length || 0) && (
          <div className="mt-2 px-2.5 py-2 rounded-xl bg-zinc-900 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Your rank: <span className="text-slate-200 font-semibold">#{board.me.rank}</span>
            </span>
            <span className="font-mono text-amber-400">{board.me.xp.toLocaleString()} XP</span>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 mb-3">
          <Medal className="w-4 h-4 text-[#ff8a80]" />
          Achievements
          <span className="text-xs font-normal text-slate-500">
            {earned.length}/{profile?.achievements.length ?? 0}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {(profile?.achievements ?? []).map((a) => (
            <div
              key={a.id}
              title={`${a.name}${a.earned ? '' : ' (locked)'} — ${a.description}`}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-lg border transition-transform hover:scale-110',
                a.earned
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-zinc-900 border-white/5 opacity-30 grayscale',
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
    const colors = ['text-amber-400', 'text-slate-300', 'text-amber-700']
    return <Medal className={cn('w-4 h-4 shrink-0', colors[rank - 1])} />
  }
  return <span className="w-4 text-[10px] font-mono text-slate-600 text-center shrink-0">{rank}</span>
}

