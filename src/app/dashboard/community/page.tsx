'use client'

import { useAuth } from '@/hooks/useAuth'
import { GlobalChat } from '@/components/messaging/GlobalChat'
import { Users, Hash, Radio, Trophy, MessageSquare } from 'lucide-react'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function CommunityPage() {
  const { user, loading } = useAuth()

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-100 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#ff5d4f] text-white flex items-center justify-center font-bold">G</div>
          <span className="font-bold">GongaFit Community</span>
        </div>

        <div className="space-y-1 mb-6">
          <div className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Channels</div>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#ff5d4f]/10 text-[#ff5d4f] font-semibold text-sm">
            <Hash className="w-4 h-4" /> general
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold text-sm">
            <Radio className="w-4 h-4" /> live-sessions
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold text-sm">
            <Trophy className="w-4 h-4" /> wins
          </button>
        </div>

        <div className="space-y-1">
          <div className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Squads</div>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold text-sm">
            <Users className="w-4 h-4" /> Find squads
          </button>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 px-2">
            {user?.avatar_url ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/media/${user.avatar_url}`}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff5d4f] to-[#ff8a80] flex items-center justify-center text-white text-xs font-bold">
                {initials(user?.display_name || 'GF')}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.display_name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role === 'ADMIN' ? 'Admin' : user?.membership_tier === 'PAID' ? 'Paid' : 'Free'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Hash className="w-5 h-5 text-gray-400" />
          <div>
            <h2 className="font-bold">general</h2>
            <p className="text-xs text-gray-500">Global community chat</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading || !user ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <MessageSquare className="w-8 h-8 animate-pulse" />
            </div>
          ) : (
            <GlobalChat
              currentUser={{
                id: user.id,
                displayName: user.display_name,
                avatarUrl: user.avatar_url,
                role: user.role,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
