'use client'

import { Hash, Lock, Users, Plus, MessageCircle, UserPlus, Megaphone, Radio, Trophy, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/lib/media'
import type { Channel, Squad, Conversation } from '@/repositories/CommunityRepository'
import type { CommunityProfile } from '@/repositories/CommunityRepository'
import { Avatar, FlairBadge, LevelChip } from './Badges'

export type CommunityView =
  | { type: 'channel'; channel: Channel }
  | { type: 'squad'; squadId: string }
  | { type: 'dm'; peerId: string }

const CHANNEL_ICONS: Record<string, typeof Hash> = {
  general: Hash,
  wins: Trophy,
  'live-sessions': Radio,
  'pro-lounge': Crown,
  announcements: Megaphone,
}

interface ChannelSidebarProps {
  channels: Channel[]
  squads: Squad[]
  conversations: Conversation[]
  view: CommunityView | null
  profile: CommunityProfile | null
  user: { id: string; display_name: string; avatar_url?: string | null; role?: string; membership_tier?: string } | null
  onSelectChannel: (channel: Channel) => void
  onSelectSquad: (squadId: string) => void
  onSelectDm: (peerId: string) => void
  onFindSquads: () => void
  onCreateSquad: () => void
  onOpenFriends: () => void
  onLockedChannel: (channel: Channel) => void
  squadInviteCount: number
  className?: string
}

export function ChannelSidebar({
  channels,
  squads,
  conversations,
  view,
  profile,
  user,
  onSelectChannel,
  onSelectSquad,
  onSelectDm,
  onFindSquads,
  onCreateSquad,
  onOpenFriends,
  onLockedChannel,
  squadInviteCount,
  className,
}: ChannelSidebarProps) {
  const levelPct = profile
    ? Math.min(100, Math.round((profile.levelProgress.xpIntoLevel / Math.max(1, profile.levelProgress.xpForNextLevel)) * 100))
    : 0

  return (
    <aside className={cn('w-64 bg-clean-sidebar border-r border-clean-border flex flex-col overflow-hidden', className)}>
      <div className="flex items-center gap-2 px-4 h-14 border-b border-clean-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clean-accent text-sm font-bold text-white shadow-sm">G</div>
        <span className="text-sm font-bold text-clean-text">GongaFit Community</span>
      </div>

      <div className="flex-1 overflow-y-auto clean-scrollbar p-3 space-y-6">
        {/* CHANNELS */}
        <div>
          <div className="px-2 text-[10px] font-bold text-clean-muted uppercase tracking-widest mb-2">Channels</div>
          <div className="space-y-0.5">
            {channels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.slug || ''] || Hash
              const active = view?.type === 'channel' && view.channel.id === channel.id
              return (
                <button
                  key={channel.id}
                  onClick={() => (channel.locked ? onLockedChannel(channel) : onSelectChannel(channel))}
                  className={cn(
                    'relative w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150',
                    active
                      ? 'bg-clean-accent-soft text-clean-accent'
                      : channel.locked
                        ? 'text-clean-muted hover:bg-clean-hover'
                        : 'text-clean-muted hover:bg-clean-hover hover:text-clean-text',
                  )}
                >
                  {active && (
                    <span aria-hidden className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-clean-accent" />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                  {channel.locked && <Lock className="w-3.5 h-3.5 ml-auto text-status-warning" />}
                  {channel.posting_policy === 'ADMIN_ONLY' && !channel.locked && (
                    <span className="ml-auto text-[9px] text-clean-muted font-mono">READ</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* SQUADS */}
        <div>
          <div className="px-2 flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-clean-muted uppercase tracking-widest">Squads</span>
            <button
              onClick={onCreateSquad}
              className="rounded-md p-1 text-clean-muted transition-colors hover:bg-clean-hover hover:text-clean-text"
              title="Create squad"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {squads.map((squad) => {
              const active = view?.type === 'squad' && view.squadId === squad.id
              return (
                <button
                  key={squad.id}
                  onClick={() => onSelectSquad(squad.id)}
                  className={cn(
                    'relative w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150',
                    active ? 'bg-clean-accent-soft text-clean-accent' : 'text-clean-muted hover:bg-clean-hover hover:text-clean-text',
                  )}
                >
                  {active && (
                    <span aria-hidden className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-clean-accent" />
                  )}
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">{squad.name}</span>
                  {(squad.unreadCount || 0) > 0 && (
                    <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-clean-accent px-1 text-[10px] font-bold text-white">
                      {squad.unreadCount! > 9 ? '9+' : squad.unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
            <button
              onClick={onFindSquads}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-clean-muted transition-colors duration-150 hover:bg-clean-hover hover:text-clean-text"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Find squads
              {squadInviteCount > 0 && (
                <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-status-warning px-1 text-[10px] font-bold text-white">
                  {squadInviteCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* DIRECT MESSAGES */}
        <div>
          <div className="px-2 flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-clean-muted uppercase tracking-widest">Direct Messages</span>
            <button
              onClick={onOpenFriends}
              className="rounded-md p-1 text-clean-muted transition-colors hover:bg-clean-hover hover:text-clean-text"
              title="Friends"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {conversations.length === 0 && (
              <button
                onClick={onOpenFriends}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-clean-muted hover:bg-clean-hover transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Message a friend
              </button>
            )}
            {conversations.map((conv) => {
              const active = view?.type === 'dm' && view.peerId === conv.peer.id
              return (
                <button
                  key={conv.peer.id}
                  onClick={() => onSelectDm(conv.peer.id)}
                  className={cn(
                    'relative w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150',
                    active ? 'bg-clean-accent-soft text-clean-accent' : 'text-clean-muted hover:bg-clean-hover hover:text-clean-text',
                  )}
                >
                  {active && (
                    <span aria-hidden className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-clean-accent" />
                  )}
                  <Avatar src={mediaUrl(conv.peer.avatar_url)} name={conv.peer.display_name} size={6} />
                  <span className="truncate">{conv.peer.display_name}</span>
                  {conv.unreadCount > 0 && (
                    <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-clean-accent px-1 text-[10px] font-bold text-white">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Profile strip with level progress */}
      <div className="shrink-0 border-t border-clean-border p-3">
        <div className="rounded-2xl border border-clean-border bg-clean-surface-2 p-3">
          <div className="flex items-center gap-2">
            <Avatar src={mediaUrl(user?.avatar_url)} name={user?.display_name || 'GF'} size={8} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-clean-text">{user?.display_name}</p>
                <FlairBadge role={user?.role} membershipTier={user?.membership_tier} />
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <LevelChip level={profile?.stats.level ?? 1} />
                {profile && profile.stats.current_streak > 0 && (
                  <span className="text-[10px] font-medium text-orange-500">🔥 {profile.stats.current_streak}d</span>
                )}
              </div>
            </div>
          </div>
          {profile && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-clean-accent to-status-warning transition-all duration-500"
                  style={{ width: `${levelPct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[9px] text-clean-muted">
                <span>{profile.levelProgress.xpIntoLevel} XP</span>
                <span>{profile.levelProgress.xpForNextLevel} to Lv {profile.levelProgress.level + 1}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
