'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Hash, Radio, Trophy, Crown, Megaphone, Users, MessageSquare, MessageCircle, Menu, X, LogOut, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useChannelFeed, useSquadFeed, useDirectFeed, usePresence, type Message } from '@/hooks'
import { useToast } from '@/hooks/useToast'
import { mapApiErrorToToast } from '@/lib/apiFeedback'
import { limitsFor, effectiveTier } from '@/lib/entitlements'
import { mediaUrl } from '@/lib/media'
import { initSocket } from '@/lib/socketClient'
import {
  CommunityRepository,
  type Channel,
  type Squad,
  type Conversation,
  type CommunityProfile,
} from '@/repositories/CommunityRepository'
import { AdminRepository } from '@/repositories/AdminRepository'
import { ChannelSidebar, type CommunityView } from '@/components/community/ChannelSidebar'
import { ChatPanel, ChatHeader } from '@/components/community/ChatPanel'
import { ThreadDrawer } from '@/components/community/ThreadDrawer'
import { LeaderboardPanel } from '@/components/community/LeaderboardPanel'
import { SquadBrowser } from '@/components/community/SquadBrowser'
import { CreateSquadModal } from '@/components/community/CreateSquadModal'
import { FriendsPanel } from '@/components/community/FriendsPanel'
import { UpgradeCta } from '@/components/community/UpgradeCta'
import { Avatar, FlairBadge } from '@/components/community/Badges'

const CHANNEL_HEADER_ICONS: Record<string, typeof Hash> = {
  general: Hash,
  wins: Trophy,
  'live-sessions': Radio,
  'pro-lounge': Crown,
  announcements: Megaphone,
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-140px)] flex items-center justify-center text-gray-400">
          <MessageSquare className="w-8 h-8 animate-pulse" />
        </div>
      }
    >
      <CommunityPageInner />
    </Suspense>
  )
}

function CommunityPageInner() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const presence = usePresence()

  const [channels, setChannels] = useState<Channel[]>([])
  const [squads, setSquads] = useState<Squad[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [profile, setProfile] = useState<CommunityProfile | null>(null)
  const [inviteCount, setInviteCount] = useState(0)
  const [view, setView] = useState<CommunityView | null>(null)
  const [dmPeer, setDmPeer] = useState<{ id: string; display_name: string; avatar_url: string | null } | null>(null)

  const [threadRoot, setThreadRoot] = useState<Message | null>(null)
  const [findSquadsOpen, setFindSquadsOpen] = useState(false)
  const [createSquadOpen, setCreateSquadOpen] = useState(false)
  const [friendsOpen, setFriendsOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>()
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const userId = user?.id ?? ''
  const isAdmin = user?.role === 'ADMIN'
  const limits = limitsFor(user)

  // ---- Feeds (all hooks always called; inactive ones get null ids) ----------
  const activeChannelId = view?.type === 'channel' ? view.channel.id : null
  const activeSquadId = view?.type === 'squad' ? view.squadId : null
  const activeDmPeerId = view?.type === 'dm' ? view.peerId : null

  const channelFeed = useChannelFeed(activeChannelId, userId)
  const squadFeed = useSquadFeed(activeSquadId, userId)
  const dmFeed = useDirectFeed(activeDmPeerId, userId)

  // ---- Data loading -----------------------------------------------------------
  const loadSidebarData = useCallback(async () => {
    try {
      const [ch, sq, convs, invites] = await Promise.all([
        CommunityRepository.getChannels(),
        CommunityRepository.getMySquads(),
        CommunityRepository.getConversations(),
        CommunityRepository.getSquadInvites().catch(() => []),
      ])
      setChannels(ch)
      setSquads(sq)
      setConversations(convs)
      setInviteCount(invites.length)
      return ch
    } catch (error) {
      console.error('Failed to load community data:', error)
      return []
    }
  }, [])

  const loadProfile = useCallback(() => {
    CommunityRepository.getProfile()
      .then(setProfile)
      .catch(() => undefined)
  }, [])

  // Initial load + deep-link resolution
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const ch = await loadSidebarData()
      loadProfile()
      if (cancelled) return

      const channelParam = searchParams.get('channel')
      const squadParam = searchParams.get('squad')
      const dmParam = searchParams.get('dm')

      if (dmParam) {
        selectDm(dmParam)
      } else if (squadParam) {
        setView({ type: 'squad', squadId: squadParam })
      } else {
        const target =
          (channelParam && ch.find((c) => c.slug === channelParam || c.id === channelParam)) ||
          ch.find((c) => c.is_default) ||
          ch[0]
        if (target && !target.locked) {
          setView({ type: 'channel', channel: target })
        } else if (target) {
          const fallback = ch.find((c) => !c.locked)
          if (fallback) setView({ type: 'channel', channel: fallback })
        }
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Live sidebar refreshers + entitlement changes
  useEffect(() => {
    if (!user) return
    let socket
    try {
      socket = initSocket()
    } catch {
      return
    }

    const refreshConvs = () => {
      CommunityRepository.getConversations().then(setConversations).catch(() => undefined)
    }
    const refreshInvites = () => {
      CommunityRepository.getSquadInvites().then((i) => setInviteCount(i.length)).catch(() => undefined)
    }
    const onEntitlements = () => {
      refreshUser()
      CommunityRepository.getChannels().then(setChannels).catch(() => undefined)
      toast({ title: 'Your membership was updated', variant: 'success' })
    }
    const onDenied = ({ reason }: any) => {
      if (reason === 'TIER_LOCKED') {
        setUpgradeFeature('This channel')
        setUpgradeOpen(true)
      }
    }
    const onGamification = () => loadProfile()

    socket.on('message:direct', refreshConvs)
    socket.on('squad:invite', refreshInvites)
    socket.on('entitlements:changed', onEntitlements)
    socket.on('channel:denied', onDenied)
    socket.on('achievement:earned', onGamification)
    socket.on('level:up', onGamification)

    return () => {
      socket?.off('message:direct', refreshConvs)
      socket?.off('squad:invite', refreshInvites)
      socket?.off('entitlements:changed', onEntitlements)
      socket?.off('channel:denied', onDenied)
      socket?.off('achievement:earned', onGamification)
      socket?.off('level:up', onGamification)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Keep the URL in sync with the active view (nice for sharing/deep links).
  useEffect(() => {
    if (!view) return
    const params = new URLSearchParams()
    if (view.type === 'channel') params.set('channel', view.channel.slug || view.channel.id)
    if (view.type === 'squad') params.set('squad', view.squadId)
    if (view.type === 'dm') params.set('dm', view.peerId)
    router.replace(`/dashboard/community?${params}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  // ---- View switching -----------------------------------------------------------
  const selectChannel = (channel: Channel) => {
    setThreadRoot(null)
    setMobileSidebar(false)
    setView({ type: 'channel', channel })
  }

  const selectSquad = (squadId: string) => {
    setThreadRoot(null)
    setMobileSidebar(false)
    setView({ type: 'squad', squadId })
    // Clear unread badge locally right away
    setSquads((prev) => prev.map((s) => (s.id === squadId ? { ...s, unreadCount: 0 } : s)))
  }

  const selectDm = async (peerId: string) => {
    setThreadRoot(null)
    setMobileSidebar(false)
    setView({ type: 'dm', peerId })
    const known = conversations.find((c) => c.peer.id === peerId)
    if (known) {
      setDmPeer({ id: known.peer.id, display_name: known.peer.display_name, avatar_url: known.peer.avatar_url })
      setConversations((prev) => prev.map((c) => (c.peer.id === peerId ? { ...c, unreadCount: 0 } : c)))
    } else {
      try {
        const data = await CommunityRepository.getUserStats(peerId)
        setDmPeer({ id: data.user.id, display_name: data.user.display_name, avatar_url: data.user.avatar_url })
      } catch {
        setDmPeer({ id: peerId, display_name: 'Member', avatar_url: null })
      }
    }
  }

  const onLockedChannel = (channel: Channel) => {
    setUpgradeFeature(`#${channel.name}`)
    setUpgradeOpen(true)
  }

  const handleMuteAuthor = isAdmin
    ? async (targetId: string, minutes: number) => {
        await AdminRepository.muteCommunityUser(targetId, minutes)
      }
    : undefined

  // ---- Loading gate ---------------------------------------------------------------
  if (authLoading || !user) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center text-gray-400">
        <MessageSquare className="w-8 h-8 animate-pulse" />
      </div>
    )
  }

  // ---- Active panel wiring -----------------------------------------------------------
  let panel: React.ReactNode = null

  if (view?.type === 'channel') {
    const channel = view.channel
    const Icon = CHANNEL_HEADER_ICONS[channel.slug || ''] || Hash
    panel = (
      <ChatPanel
        header={
          <ChatHeader
            icon={<Icon className="w-4 h-4 text-white" />}
            title={`#${channel.name}`}
            subtitle={channel.description || undefined}
            connected={channelFeed.connected}
            online={presence.online}
            right={<MobileMenuButton onClick={() => setMobileSidebar(true)} />}
          />
        }
        feed={channelFeed}
        pinned={channelFeed.pinned}
        currentUserId={userId}
        isAdmin={isAdmin}
        canPost={channel.canPost}
        cannotPostReason={
          channel.posting_policy === 'ADMIN_ONLY'
            ? `Only admins can post in #${channel.name}`
            : `Upgrade to PRO to post in #${channel.name}`
        }
        composerPlaceholder={`Message #${channel.name}`}
        maxUploadBytes={limits.maxUploadBytes}
        maxMediaPerMessage={limits.maxMediaPerMessage}
        onOpenThread={setThreadRoot}
        onMuteAuthor={handleMuteAuthor}
        order="newest-first"
      />
    )
  } else if (view?.type === 'squad') {
    const squadRole: string | undefined = squadFeed.membership?.role
    const canModerate = !!squadRole && ['OWNER', 'ADMIN', 'MODERATOR'].includes(squadRole)
    panel = (
      <ChatPanel
        header={
          <ChatHeader
            icon={<Users className="w-4 h-4 text-white" />}
            title={squadFeed.squad?.name || 'Squad'}
            subtitle={`${squadFeed.squad?.members?.length ?? 0} members · ${squadRole?.toLowerCase() ?? 'member'}`}
            connected={squadFeed.connected}
            right={
              <div className="flex items-center gap-1">
                <button
                  onClick={async () => {
                    if (!confirm('Leave this squad?')) return
                    try {
                      await CommunityRepository.leaveSquad(view.squadId)
                      setSquads((prev) => prev.filter((s) => s.id !== view.squadId))
                      const general = channels.find((c) => c.is_default)
                      if (general) selectChannel(general)
                    } catch (error) {
                      toast(mapApiErrorToToast(error, { action: 'leave this squad' }))
                    }
                  }}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400"
                  title="Leave squad"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <MobileMenuButton onClick={() => setMobileSidebar(true)} />
              </div>
            }
          />
        }
        feed={squadFeed}
        currentUserId={userId}
        isAdmin={isAdmin}
        canModerate={canModerate}
        canPost
        composerPlaceholder={`Message ${squadFeed.squad?.name ?? 'your squad'}`}
        maxUploadBytes={limits.maxUploadBytes}
        maxMediaPerMessage={limits.maxMediaPerMessage}
        onOpenThread={setThreadRoot}
        onMuteAuthor={handleMuteAuthor}
        order="oldest-first"
      />
    )
  } else if (view?.type === 'dm') {
    panel = (
      <ChatPanel
        header={
          <ChatHeader
            icon={<MessageCircle className="w-4 h-4 text-white" />}
            title={dmPeer?.display_name || 'Direct message'}
            subtitle="Direct message"
            connected={dmFeed.connected}
            right={<MobileMenuButton onClick={() => setMobileSidebar(true)} />}
          />
        }
        feed={dmFeed}
        currentUserId={userId}
        isAdmin={isAdmin}
        canPost
        composerPlaceholder={`Message ${dmPeer?.display_name ?? ''}`}
        maxUploadBytes={limits.maxUploadBytes}
        maxMediaPerMessage={limits.maxMediaPerMessage}
        enableMentions={false}
        order="oldest-first"
      />
    )
  } else {
    panel = (
      <div className="h-full flex items-center justify-center text-slate-600 bg-zinc-950">
        <MessageSquare className="w-8 h-8 animate-pulse" />
      </div>
    )
  }

  const activeSendReply =
    view?.type === 'channel' ? channelFeed.sendMessage : view?.type === 'squad' ? squadFeed.sendMessage : dmFeed.sendMessage

  return (
    <div className="h-[calc(100vh-140px)] bg-zinc-950 rounded-3xl border border-white/10 shadow-sm overflow-hidden flex relative">
      {/* Sidebar (desktop) */}
      <ChannelSidebar
        className="hidden md:flex"
        channels={channels}
        squads={squads}
        conversations={conversations}
        view={view}
        profile={profile}
        user={user}
        onSelectChannel={selectChannel}
        onSelectSquad={selectSquad}
        onSelectDm={selectDm}
        onFindSquads={() => setFindSquadsOpen(true)}
        onCreateSquad={() => setCreateSquadOpen(true)}
        onOpenFriends={() => setFriendsOpen(true)}
        onLockedChannel={onLockedChannel}
        squadInviteCount={inviteCount}
      />

      {/* Sidebar (mobile drawer) */}
      {mobileSidebar && (
        <div className="absolute inset-0 z-50 flex md:hidden">
          <ChannelSidebar
            className="flex w-72 h-full"
            channels={channels}
            squads={squads}
            conversations={conversations}
            view={view}
            profile={profile}
            user={user}
            onSelectChannel={selectChannel}
            onSelectSquad={selectSquad}
            onSelectDm={selectDm}
            onFindSquads={() => {
              setMobileSidebar(false)
              setFindSquadsOpen(true)
            }}
            onCreateSquad={() => {
              setMobileSidebar(false)
              setCreateSquadOpen(true)
            }}
            onOpenFriends={() => {
              setMobileSidebar(false)
              setFriendsOpen(true)
            }}
            onLockedChannel={onLockedChannel}
            squadInviteCount={inviteCount}
          />
          <button className="flex-1 bg-black/60" onClick={() => setMobileSidebar(false)}>
            <X className="w-6 h-6 text-white/70 m-4" />
          </button>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 min-w-0 relative">
        {panel}

        <ThreadDrawer
          rootMessage={threadRoot}
          onClose={() => setThreadRoot(null)}
          currentUserId={userId}
          isAdmin={isAdmin}
          maxUploadBytes={limits.maxUploadBytes}
          maxMediaPerMessage={limits.maxMediaPerMessage}
          onSendReply={activeSendReply}
          canPost={view?.type !== 'channel' || view.channel.canPost}
        />
      </div>

      {/* Right rail */}
      {view?.type === 'squad' ? (
        <SquadMembersRail
          squad={squadFeed.squad}
          currentUserId={userId}
          canInvite={!!squadFeed.membership && ['OWNER', 'ADMIN', 'MODERATOR'].includes(squadFeed.membership.role)}
          onInvited={() => squadFeed.refresh()}
          className="hidden xl:flex"
        />
      ) : (
        <LeaderboardPanel currentUserId={userId} profile={profile} className="hidden xl:flex" />
      )}

      {/* Modals */}
      <SquadBrowser
        open={findSquadsOpen}
        onClose={() => setFindSquadsOpen(false)}
        onJoined={async (squadId) => {
          await loadSidebarData()
          selectSquad(squadId)
        }}
      />
      <CreateSquadModal
        open={createSquadOpen}
        onClose={() => setCreateSquadOpen(false)}
        canCreate={limits.canCreateSquads}
        onUpgrade={() => {
          setCreateSquadOpen(false)
          setUpgradeFeature('Squad creation')
          setUpgradeOpen(true)
        }}
        onCreated={async (squadId) => {
          await loadSidebarData()
          selectSquad(squadId)
        }}
      />
      <FriendsPanel open={friendsOpen} onClose={() => setFriendsOpen(false)} onMessage={selectDm} />
      <UpgradeCta open={upgradeOpen} onClose={() => setUpgradeOpen(false)} featureName={upgradeFeature} />
    </div>
  )
}

function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 md:hidden" aria-label="Menu">
      <Menu className="w-4 h-4" />
    </button>
  )
}

// -----------------------------------------------------------------------------
// Squad members rail (right side while viewing a squad)
// -----------------------------------------------------------------------------

function SquadMembersRail({
  squad,
  currentUserId,
  canInvite,
  onInvited,
  className,
}: {
  squad: any | null
  currentUserId: string
  canInvite: boolean
  onInvited: () => void
  className?: string
}) {
  const { toast } = useToast()
  const [inviteQuery, setInviteQuery] = useState('')
  const [inviteResults, setInviteResults] = useState<any[]>([])

  useEffect(() => {
    if (inviteQuery.trim().length < 2) {
      setInviteResults([])
      return
    }
    const t = setTimeout(() => {
      CommunityRepository.searchUsers(inviteQuery.trim())
        .then(setInviteResults)
        .catch(() => setInviteResults([]))
    }, 300)
    return () => clearTimeout(t)
  }, [inviteQuery])

  const members = useMemo(() => {
    const list = (squad?.members ?? []) as any[]
    const order: Record<string, number> = { OWNER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3 }
    return [...list].sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9))
  }, [squad])

  const memberIds = new Set(members.map((m) => m.user?.id))

  return (
    <aside className={cn('w-72 bg-black/40 border-l border-white/5 flex-col overflow-y-auto', className)}>
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 mb-3">
          <Users className="w-4 h-4 text-[#ff8a80]" />
          Members
          <span className="text-xs font-normal text-slate-500">{members.length}</span>
        </div>

        <div className="space-y-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
              <Avatar src={mediaUrl(m.user?.avatar_url)} name={m.user?.display_name || '?'} size={7} />
              <span className={cn('text-xs truncate', m.user?.id === currentUserId ? 'text-[#ff8a80] font-semibold' : 'text-slate-300')}>
                {m.user?.display_name}
              </span>
              <FlairBadge role={m.user?.role} />
              {m.role !== 'MEMBER' && (
                <span className="ml-auto text-[9px] font-mono text-amber-500/80 uppercase">{m.role}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {canInvite && (
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <UserPlus className="w-3.5 h-3.5" />
            Invite members
          </div>
          <input
            value={inviteQuery}
            onChange={(e) => setInviteQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:border-[#E8453C]/50 focus:outline-none"
          />
          <div className="mt-2 space-y-1">
            {inviteResults
              .filter((u) => !memberIds.has(u.id))
              .slice(0, 5)
              .map((u) => (
                <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-900/60">
                  <Avatar src={mediaUrl(u.avatar_url)} name={u.display_name} size={6} />
                  <span className="text-xs text-slate-300 truncate flex-1">{u.display_name}</span>
                  <button
                    onClick={async () => {
                      try {
                        await CommunityRepository.inviteToSquad(squad.id, u.id)
                        toast({ title: `Invite sent to ${u.display_name}`, variant: 'success' })
                        setInviteQuery('')
                        onInvited()
                      } catch (error) {
                        toast(mapApiErrorToToast(error, { action: 'send this invite' }))
                      }
                    }}
                    className="px-2 py-1 bg-[#E8453C] hover:bg-[#ff5d4f] text-white text-[10px] font-semibold rounded-md"
                  >
                    Invite
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </aside>
  )
}
