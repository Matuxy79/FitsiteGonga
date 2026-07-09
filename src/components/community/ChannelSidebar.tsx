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
    <aside className={cn('w-64 bg-black/40 border-r border-white/5 flex flex-col overflow-hidden', className)}>
      <div className="flex items-center gap-2 px-4 h-14 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#E8453C] text-white flex items-center justify-center font-bold">G</div>
        <span className="font-bold text-slate-100 text-sm">GongaFit Community</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* CHANNELS */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Channels</div>
          <div className="space-y-0.5">
            {channels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.slug || ''] || Hash
              const active = view?.type === 'channel' && view.channel.id === channel.id
              return (
                <button
                  key={channel.id}
                  onClick={() => (channel.locked ? onLockedChannel(channel) : onSelectChannel(channel))}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#E8453C]/15 text-[#ff8a80]'
                      : channel.locked
                        ? 'text-slate-600 hover:bg-white/[0.03]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                  {channel.locked && <Lock className="w-3.5 h-3.5 ml-auto text-amber-500/70" />}
                  {channel.posting_policy === 'ADMIN_ONLY' && !channel.locked && (
                    <span className="ml-auto text-[9px] text-slate-600 font-mono">READ</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* SQUADS */}
        <div>
          <div className="px-2 flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Squads</span>
            <button
              onClick={onCreateSquad}
              className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300"
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
                    'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    active ? 'bg-[#E8453C]/15 text-[#ff8a80]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                  )}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">{squad.name}</span>
                  {(squad.unreadCount || 0) > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-[#E8453C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {squad.unreadCount! > 9 ? '9+' : squad.unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
            <button
              onClick={onFindSquads}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Find squads
              {squadInviteCount > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {squadInviteCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* DIRECT MESSAGES */}
        <div>
          <div className="px-2 flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Direct Messages</span>
            <button
              onClick={onOpenFriends}
              className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300"
              title="Friends"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {conversations.length === 0 && (
              <button
                onClick={onOpenFriends}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-white/[0.03] transition-colors"
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
                    'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    active ? 'bg-[#E8453C]/15 text-[#ff8a80]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                  )}
                >
                  <Avatar src={mediaUrl(conv.peer.avatar_url)} name={conv.peer.display_name} size={6} />
                  <span className="truncate">{conv.peer.display_name}</span>
                  {conv.unreadCount > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-[#E8453C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
      <div className="p-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 px-1">
          <Avatar src={mediaUrl(user?.avatar_url)} name={user?.display_name || 'GF'} size={8} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-slate-200 truncate">{user?.display_name}</p>
              <FlairBadge role={user?.role} membershipTier={user?.membership_tier} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <LevelChip level={profile?.stats.level ?? 1} />
              {profile && profile.stats.current_streak > 0 && (
                <span className="text-[10px] text-orange-400">🔥 {profile.stats.current_streak}d</span>
              )}
            </div>
          </div>
        </div>
        {profile && (
          <div className="mt-2 px-1">
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E8453C] to-amber-500 transition-all"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-mono text-slate-600">
              <span>{profile.levelProgress.xpIntoLevel} XP</span>
              <span>{profile.levelProgress.xpForNextLevel} to Lv {profile.levelProgress.level + 1}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

