'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Radio,
  Users,
  Dumbbell,
  Calendar,
  Trophy,
  User,
  UserPlus,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Zap,
  TrendingUp,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User as UserType, Challenge } from '@/types/fitness'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type SectorId = 'nexus' | 'forge' | 'identity'
export type PanelId = 
  | 'global-feed' | 'trainer-link' | 'squads'
  | 'active-lifts' | 'week-planner' | 'challenges'
  | 'profile' | 'friends' | 'settings'

export interface ActiveLift {
  id: string
  exerciseId: string
  exerciseName: string
  workingWeight: number
  workingUnit: 'lbs' | 'kg'
  lastSet: string
  oneRepMax: number
  goalWeight?: number
  trend: 'up' | 'down' | 'stable'
}

export interface Squad {
  id: string
  name: string
  memberCount: number
  unreadCount: number
}

export interface TriSectorSidebarProps {
  operator: UserType | null
  challenges: Challenge[]
  activeLifts: ActiveLift[]
  squads: Squad[]
  activeSector: SectorId
  activePanel: PanelId
  selectedChallengeId: string | null
  selectedLiftId: string | null
  onSectorChange: (sector: SectorId) => void
  onPanelChange: (panel: PanelId) => void
  onChallengeSelect: (challengeId: string) => void
  onLiftSelect: (liftId: string) => void
  onAddLift: () => void
  onCreateSquad: () => void
  onLogout?: () => void
}

interface SectorConfig {
  id: SectorId
  name: string
  code: string
  Icon: typeof MessageSquare
  color: string
  description: string
  panels: PanelConfig[]
}

interface PanelConfig {
  id: PanelId
  name: string
  Icon: typeof MessageSquare
  badge?: number
}

const SECTORS: SectorConfig[] = [
  {
    id: 'nexus',
    name: 'The Nexus',
    code: 'SECTOR_01',
    Icon: MessageSquare,
    color: '#22c55e',
    description: 'Communication Hub',
    panels: [
      { id: 'global-feed', name: 'Global Feed', Icon: Radio },
      { id: 'trainer-link', name: 'Trainer Link', Icon: Target },
      { id: 'squads', name: 'Alpha Squads', Icon: Users },
    ]
  },
  {
    id: 'forge',
    name: 'The Forge',
    code: 'SECTOR_02',
    Icon: Dumbbell,
    color: '#8b5cf6',
    description: 'Fitness & Tracking',
    panels: [
      { id: 'active-lifts', name: 'Active Lifts', Icon: TrendingUp },
      { id: 'week-planner', name: 'Week Planner', Icon: Calendar },
      { id: 'challenges', name: 'Challenges', Icon: Trophy },
    ]
  },
  {
    id: 'identity',
    name: 'Identity',
    code: 'SECTOR_03',
    Icon: User,
    color: '#06b6d4',
    description: 'Account & Settings',
    panels: [
      { id: 'profile', name: 'Profile', Icon: User },
      { id: 'friends', name: 'Friends & Invites', Icon: UserPlus },
      { id: 'settings', name: 'Settings & Security', Icon: Settings },
    ]
  }
]

export function TriSectorSidebar({
  operator,
  challenges,
  activeLifts,
  squads,
  activeSector,
  activePanel,
  selectedChallengeId,
  selectedLiftId,
  onSectorChange,
  onPanelChange,
  onChallengeSelect,
  onLiftSelect,
  onAddLift,
  onCreateSquad,
  onLogout,
}: TriSectorSidebarProps) {
  const currentSector = SECTORS.find(s => s.id === activeSector)!
  const operatorName = operator?.display_name || 'OPERATOR'
  const operatorInitial = operatorName.trim().charAt(0).toUpperCase() || 'O'
  const operatorRole = (operator?.role || 'client').toUpperCase()

  const sectorBadges = useMemo(() => {
    const squadUnread = squads.reduce((sum, s) => sum + s.unreadCount, 0)
    const challengeBadge = challenges.filter(c => c.is_active).length

    return {
      nexus: squadUnread,
      forge: challengeBadge,
      identity: 0
    }
  }, [squads, challenges])

  return (
    <aside className="flex h-full">
      {/* ICON RAIL */}
      <div className="w-16 bg-black/60 backdrop-blur-xl border-r border-emerald-500/10 flex flex-col items-center">
        <div className="pt-4 flex flex-col items-center gap-3">
          <div className="group relative">
            <button
              type="button"
              className="w-12 h-12 border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center transition-colors hover:bg-emerald-500/10"
              aria-label="FitsiteGonga"
            >
              <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center transform -skew-x-12 border border-emerald-400/30">
                <Zap className="w-5 h-5 text-black" />
              </div>
            </button>
            <Tooltip>FITSITEGONGA</Tooltip>
          </div>

          <div className="w-10 h-px bg-white/10" />

          {SECTORS.map(({ id, name, Icon }) => {
            const isSelected = activeSector === id
            const badge = sectorBadges[id]
            
            return (
              <div key={id} className="group relative w-full flex justify-center">
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[2px] transition-opacity',
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  )}
                  style={{ backgroundColor: currentSector.color }}
                />
                
                <button
                  type="button"
                  onClick={() => onSectorChange(id)}
                  aria-current={isSelected ? 'page' : undefined}
                  className={cn(
                    'w-12 h-12 border flex items-center justify-center transition-all relative',
                    'bg-zinc-950/40 border-white/10 text-slate-300',
                    'hover:text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/5',
                    isSelected && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </button>
                
                <Tooltip>{name.toUpperCase()}</Tooltip>
              </div>
            )
          })}
        </div>

        <div className="mt-auto pb-4 flex flex-col items-center gap-2">
          <div className="group relative">
            <button
              type="button"
              onClick={() => {
                onSectorChange('identity')
                onPanelChange('profile')
              }}
              className={cn(
                'w-12 h-12 border border-white/10 bg-zinc-950/40 transition-colors flex items-center justify-center',
                'hover:bg-emerald-500/5 hover:border-emerald-500/30',
                activeSector === 'identity' && 'border-cyan-500/50 bg-cyan-500/10'
              )}
              aria-label={`Operator ${operatorName}`}
            >
              <span className="font-mono text-xs tracking-[0.3em] text-slate-200">
                [{operatorInitial}]
              </span>
            </button>
            <Tooltip>OPERATOR: {operatorName.toUpperCase()}</Tooltip>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-12 h-12 border border-white/10 bg-zinc-950/40 hover:bg-red-500/10 hover:border-red-500/30 transition-colors flex items-center justify-center text-slate-300 hover:text-red-300"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* SECONDARY PANEL */}
      <div className="w-[300px] bg-zinc-950/60 backdrop-blur-xl border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                {'//'} {currentSector.code}
              </div>
              <div 
                className="mt-2 text-sm font-black tracking-[0.35em] uppercase"
                style={{ color: currentSector.color }}
              >
                {currentSector.name}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                {currentSector.description}
              </div>
            </div>
          </div>
        </div>

        <div className="p-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] px-3 py-2">
            FREQUENCIES
          </div>
          {currentSector.panels.map((panel) => {
            const isActive = activePanel === panel.id
            return (
              <button
                key={panel.id}
                onClick={() => onPanelChange(panel.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                <panel.Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{panel.name}</span>
                {panel.badge && panel.badge > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                    {panel.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        
        {/* NEXUS: Squads List */}
        {activeSector === 'nexus' && activePanel === 'squads' && (
          <div className="flex-1 overflow-y-auto p-2 border-t border-white/5">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                YOUR SQUADS
              </div>
              <button 
                onClick={onCreateSquad}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {squads.map((squad) => (
              <button
                key={squad.id}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>{squad.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{squad.memberCount}</span>
                  {squad.unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                      {squad.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
            {squads.length === 0 && (
              <div className="px-3 py-6 text-center">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-sm text-slate-500">No squads yet</div>
                <button 
                  onClick={onCreateSquad}
                  className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Create your first squad
                </button>
              </div>
            )}
          </div>
        )}

        {/* FORGE: Active Lifts */}
        {activeSector === 'forge' && activePanel === 'active-lifts' && (
          <div className="flex-1 overflow-y-auto p-2 border-t border-white/5">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                TRACKED LIFTS
              </div>
              <button 
                onClick={onAddLift}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {activeLifts.map((lift) => {
                const isSelected = lift.id === selectedLiftId
                return (
                  <button
                    key={lift.id}
                    onClick={() => onLiftSelect(lift.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors',
                      isSelected 
                        ? 'bg-purple-500/10 border border-purple-500/30' 
                        : 'hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <div className="text-left">
                      <div className="text-sm text-slate-200">{lift.exerciseName}</div>
                      <div className="text-xs text-slate-500">
                        Working: {lift.workingWeight} {lift.workingUnit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Last: {lift.lastSet}</div>
                      <div className={cn(
                        'text-xs',
                        lift.trend === 'up' && 'text-emerald-400',
                        lift.trend === 'down' && 'text-red-400',
                        lift.trend === 'stable' && 'text-slate-500'
                      )}>
                        {lift.trend === 'up' && '↗'}
                        {lift.trend === 'down' && '↘'}
                        {lift.trend === 'stable' && '→'}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {activeLifts.length === 0 && (
              <div className="px-3 py-6 text-center">
                <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-sm text-slate-500">No lifts tracked</div>
                <button 
                  onClick={onAddLift}
                  className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Add your first lift
                </button>
              </div>
            )}
          </div>
        )}

        {/* FORGE: Challenges */}
        {activeSector === 'forge' && activePanel === 'challenges' && (
          <div className="flex-1 overflow-y-auto p-2 border-t border-white/5">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] px-3 py-2">
              ACTIVE PROTOCOLS
            </div>
            {challenges.filter(c => c.is_active).map((challenge) => {
              const isSelected = challenge.id === selectedChallengeId
              return (
                <button
                  key={challenge.id}
                  onClick={() => onChallengeSelect(challenge.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 border transition-colors rounded-lg mb-1',
                    isSelected 
                      ? 'border-emerald-500/40 bg-emerald-500/10' 
                      : 'border-transparent hover:border-white/10 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-slate-500 tracking-[0.35em] uppercase">
                        {challenge.category}
                      </div>
                      <div className="mt-1 text-sm text-slate-200 truncate">
                        {challenge.name}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-mono text-emerald-300">
                        {challenge.goal_value} {challenge.goal_unit}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* IDENTITY: User Card */}
        {activeSector === 'identity' && (
          <div className="p-4 mt-2 border-t border-white/5">
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl font-bold text-black">
                  {operatorInitial}
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{operatorName}</div>
                  <div className="text-xs text-emerald-400 font-mono tracking-wider">
                    {operatorRole}_LVL_9
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-emerald-400">47</div>
                  <div className="text-[10px] text-slate-500">Friends</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-purple-400">{squads.length}</div>
                  <div className="text-[10px] text-slate-500">Squads</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-cyan-400">89</div>
                  <div className="text-[10px] text-slate-500">Days</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Footer */}
        <div className="mt-auto p-4 border-t border-white/5">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
            {'// STATUS'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">OPERATOR</span>
            <span className="text-slate-200 truncate max-w-[180px]">{operatorName}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">SECTOR</span>
            <span style={{ color: currentSector.color }}>{currentSector.code}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
      <div className="bg-zinc-950 border border-white/10 px-3 py-2 text-[10px] font-mono tracking-[0.25em] text-slate-200 whitespace-nowrap">
        {children}
      </div>
    </div>
  )
}

export default TriSectorSidebar
