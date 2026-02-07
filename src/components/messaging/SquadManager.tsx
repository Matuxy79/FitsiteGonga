'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  Settings,
  Crown,
  Shield,
  Star,
  User,
  UserPlus,
  LogOut,
  Lock,
  Globe,
  Eye,
  MoreHorizontal,
  MessageSquare,
  Check,
  X,
  ChevronRight,
  Bell,
  BellOff,
  Trash2,
  Edit,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

// Squad interface - compatible with both hook returns and component needs
export interface Squad {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
  ownerId: string
  visibility: 'PUBLIC' | 'INVITE_ONLY' | 'PRIVATE'
  maxMembers: number
  memberCount: number
  // Optional fields - may come from hook or be missing
  unreadCount?: number
  role?: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER'
  isActive?: boolean
  createdAt?: string
}

export interface SquadMember {
  id: string
  squadId: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER'
  joinedAt: string
  notificationsEnabled: boolean
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
    role: string
  }
}

export interface SquadInvite {
  id: string
  squadId: string
  inviterId: string
  inviteeId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  createdAt: string
  squad: {
    id: string
    name: string
    avatarUrl: string | null
  }
  inviter: {
    id: string
    displayName: string
  }
}

interface SquadManagerProps {
  squads: Squad[]
  pendingInvites: SquadInvite[]
  currentUserId: string
  onCreateSquad: (data: CreateSquadData) => Promise<Squad>
  onJoinSquad: (squadId: string) => Promise<void>
  onLeaveSquad: (squadId: string) => Promise<void>
  onInviteUser: (squadId: string, userId: string) => Promise<void>
  onAcceptInvite: (inviteId: string) => Promise<void>
  onDeclineInvite: (inviteId: string) => Promise<void>
  onSelectSquad: (squadId: string) => void
}

interface CreateSquadData {
  name: string
  description?: string
  visibility: 'PUBLIC' | 'INVITE_ONLY' | 'PRIVATE'
  maxMembers: number
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function SquadManager({
  squads,
  pendingInvites,
  currentUserId,
  onCreateSquad,
  onJoinSquad,
  onLeaveSquad,
  onInviteUser,
  onAcceptInvite,
  onDeclineInvite,
  onSelectSquad,
}: SquadManagerProps) {
  const [view, setView] = useState<'list' | 'create' | 'discover'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null)

  // Filter squads
  const filteredSquads = useMemo(() => {
    if (!searchQuery.trim()) return squads
    const query = searchQuery.toLowerCase()
    return squads.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query)
    )
  }, [squads, searchQuery])

  // Group by role
  const { ownedSquads, memberSquads } = useMemo(() => {
    const owned: Squad[] = []
    const member: Squad[] = []
    
    filteredSquads.forEach(squad => {
      if (squad.ownerId === currentUserId) {
        owned.push(squad)
      } else {
        member.push(squad)
      }
    })
    
    return { ownedSquads: owned, memberSquads: member }
  }, [filteredSquads, currentUserId])

  const handleSquadClick = (squad: Squad) => {
    setSelectedSquadId(squad.id)
    onSelectSquad(squad.id)
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="shrink-0 p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
              // ALPHA SQUADS
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-100 tracking-wide">
              {view === 'create' ? 'Create Squad' : view === 'discover' ? 'Discover Squads' : 'Your Squads'}
            </h2>
          </div>
          
          {view === 'list' && (
            <button
              onClick={() => setView('create')}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}
          
          {(view === 'create' || view === 'discover') && (
            <button
              onClick={() => setView('list')}
              className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        {/* View Tabs */}
        {view === 'list' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setView('list')}
              className="flex-1 py-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg"
            >
              My Squads ({squads.length})
            </button>
            <button
              onClick={() => setView('discover')}
              className="flex-1 py-2 text-xs font-medium bg-zinc-800 text-slate-400 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Discover
            </button>
          </div>
        )}

        {/* Search */}
        {view === 'list' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search squads..."
              className="w-full h-9 pl-10 pr-4 bg-zinc-900 border border-white/10 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* PENDING INVITES */}
      {/* ================================================================== */}
      {view === 'list' && pendingInvites.length > 0 && (
        <div className="shrink-0 p-4 border-b border-white/5 bg-yellow-500/5">
          <div className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider mb-3">
            Pending Invites ({pendingInvites.length})
          </div>
          <div className="space-y-2">
            {pendingInvites.map(invite => (
              <InviteCard
                key={invite.id}
                invite={invite}
                onAccept={() => onAcceptInvite(invite.id)}
                onDecline={() => onDeclineInvite(invite.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* LIST VIEW */}
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-6"
            >
              {squads.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                  <h3 className="text-slate-200 font-medium mb-2">No Squads Yet</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Create a squad to train with others or join an existing one
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setView('create')}
                      className="px-4 py-2 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition-colors"
                    >
                      Create Squad
                    </button>
                    <button
                      onClick={() => setView('discover')}
                      className="px-4 py-2 bg-zinc-800 text-slate-200 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                    >
                      Discover
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Owned Squads */}
                  {ownedSquads.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Crown className="w-3 h-3" />
                        Your Squads
                      </div>
                      <div className="space-y-2">
                        {ownedSquads.map(squad => (
                          <SquadCard
                            key={squad.id}
                            squad={squad}
                            isOwner
                            isSelected={squad.id === selectedSquadId}
                            onClick={() => handleSquadClick(squad)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member Squads */}
                  {memberSquads.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Member Of
                      </div>
                      <div className="space-y-2">
                        {memberSquads.map(squad => (
                          <SquadCard
                            key={squad.id}
                            squad={squad}
                            isOwner={false}
                            isSelected={squad.id === selectedSquadId}
                            onClick={() => handleSquadClick(squad)}
                            onLeave={() => onLeaveSquad(squad.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* CREATE VIEW */}
          {view === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <CreateSquadForm
                onCreate={async (data) => {
                  const squad = await onCreateSquad(data)
                  setView('list')
                  handleSquadClick(squad)
                }}
                onCancel={() => setView('list')}
              />
            </motion.div>
          )}

          {/* DISCOVER VIEW */}
          {view === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <DiscoverSquads
                currentSquadIds={squads.map(s => s.id)}
                onJoin={async (squadId) => {
                  await onJoinSquad(squadId)
                  setView('list')
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// SQUAD CARD
// -----------------------------------------------------------------------------

interface SquadCardProps {
  squad: Squad
  isOwner: boolean
  isSelected: boolean
  onClick: () => void
  onLeave?: () => void
}

function SquadCard({ squad, isOwner, isSelected, onClick, onLeave }: SquadCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const VisibilityIcon = squad.visibility === 'PUBLIC' ? Globe 
    : squad.visibility === 'PRIVATE' ? Lock 
    : Eye

  return (
    <div
      className={cn(
        'relative p-3 rounded-lg border transition-colors cursor-pointer group',
        isSelected 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-900'
      )}
    >
      <div onClick={onClick} className="flex items-center gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {squad.avatarUrl ? (
            <img
              src={squad.avatarUrl}
              alt={squad.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {squad.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-100 truncate">
              {squad.name}
            </h3>
            {isOwner && <Crown className="w-3 h-3 text-yellow-500" />}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {squad.memberCount}/{squad.maxMembers}
            </span>
            <span className="flex items-center gap-1">
              <VisibilityIcon className="w-3 h-3" />
              {squad.visibility.toLowerCase().replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/5 rounded transition-all"
        >
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-1 z-10 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden"
          >
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors">
              <MessageSquare className="w-4 h-4" />
              Open Chat
            </button>
            {isOwner ? (
              <>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Invite Members
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors">
                  <Settings className="w-4 h-4" />
                  Squad Settings
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onLeave?.()
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Leave Squad
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// -----------------------------------------------------------------------------
// INVITE CARD
// -----------------------------------------------------------------------------

interface InviteCardProps {
  invite: SquadInvite
  onAccept: () => void
  onDecline: () => void
}

function InviteCard({ invite, onAccept, onDecline }: InviteCardProps) {
  return (
    <div className="p-3 bg-zinc-900 rounded-lg border border-yellow-500/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {invite.squad.avatarUrl ? (
            <img
              src={invite.squad.avatarUrl}
              alt={invite.squad.name}
              className="w-10 h-10 rounded-lg"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-white font-bold">
              {invite.squad.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-100 truncate">
              {invite.squad.name}
            </div>
            <div className="text-xs text-slate-500">
              Invited by {invite.inviter.displayName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDecline}
            className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={onAccept}
            className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded transition-colors text-emerald-400"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// CREATE SQUAD FORM
// -----------------------------------------------------------------------------

interface CreateSquadFormProps {
  onCreate: (data: CreateSquadData) => Promise<void>
  onCancel: () => void
}

function CreateSquadForm({ onCreate, onCancel }: CreateSquadFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'INVITE_ONLY' | 'PRIVATE'>('INVITE_ONLY')
  const [maxMembers, setMaxMembers] = useState(25)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        maxMembers,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="text-sm font-medium text-slate-200 block mb-2">
          Squad Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Lifters"
          maxLength={50}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-slate-200 block mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this squad about?"
          maxLength={300}
          rows={3}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none resize-none"
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="text-sm font-medium text-slate-200 block mb-2">
          Visibility
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'PUBLIC', label: 'Public', icon: Globe, desc: 'Anyone can join' },
            { value: 'INVITE_ONLY', label: 'Invite Only', icon: Eye, desc: 'Invite required' },
            { value: 'PRIVATE', label: 'Private', icon: Lock, desc: 'Hidden from search' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibility(opt.value as typeof visibility)}
              className={cn(
                'p-3 rounded-lg border transition-colors text-left',
                visibility === opt.value
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-zinc-900 border-white/5 hover:border-white/10'
              )}
            >
              <opt.icon className={cn(
                'w-5 h-5 mb-2',
                visibility === opt.value ? 'text-emerald-400' : 'text-slate-500'
              )} />
              <div className="text-sm font-medium text-slate-200">{opt.label}</div>
              <div className="text-[10px] text-slate-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Max Members */}
      <div>
        <label className="text-sm font-medium text-slate-200 block mb-2">
          Max Members: {maxMembers}
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={maxMembers}
          onChange={(e) => setMaxMembers(parseInt(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>5</span>
          <span>100</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-zinc-800 text-slate-200 font-medium rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className={cn(
            'flex-1 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2',
            name.trim() && !loading
              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
          )}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Squad
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// -----------------------------------------------------------------------------
// DISCOVER SQUADS (Placeholder - would fetch from API)
// -----------------------------------------------------------------------------

interface DiscoverSquadsProps {
  currentSquadIds: string[]
  onJoin: (squadId: string) => Promise<void>
}

function DiscoverSquads({ currentSquadIds, onJoin }: DiscoverSquadsProps) {
  // This would fetch public squads from API
  // For now, show placeholder
  
  return (
    <div className="text-center py-12">
      <Globe className="w-16 h-16 mx-auto text-slate-700 mb-4" />
      <h3 className="text-slate-200 font-medium mb-2">Discover Squads</h3>
      <p className="text-sm text-slate-500 mb-6">
        Find and join public training squads
      </p>
      <p className="text-xs text-slate-600">
        Coming soon - search through public squads in your area or with similar training goals
      </p>
    </div>
  )
}

export default SquadManager
