'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Apple, Dumbbell, HeartPulse, Sparkles } from 'lucide-react'
import { ProgressFeed } from '../progress/ProgressFeed'
import { ProgressInput } from '../progress/ProgressInput'
import { ChallengeCard } from './ChallengeCard'
import type { Challenge, ProgressLog, User } from '@/types/fitness'

interface ChallengeChannelProps {
  challenge?: Challenge
  userProgress?: ProgressLog[]
  userGoal?: number
  onLogProgress?: (value: number, notes?: string) => void
  canEdit?: boolean
  currentUser?: User
}

export function ChallengeChannel({
  challenge,
  userProgress = [],
  userGoal = 100,
  onLogProgress = () => {},
  canEdit = false,
  currentUser,
}: ChallengeChannelProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'details'>('progress')

  if (!challenge) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent p-8">
        <div className="w-full max-w-md border border-emerald-500/15 bg-black/40 backdrop-blur-xl p-8 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.45em]">
            // System ready
          </div>
          <h2 className="mt-3 text-xl font-black tracking-[0.25em] uppercase text-slate-100">
            No active protocol
          </h2>
          <p className="mt-4 text-sm text-slate-400 font-mono">
            Select a sector on the West rail, then choose a protocol to begin logging.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-mono text-slate-500">
            <div className="border border-white/5 bg-black/30 p-3">
              <div className="tracking-[0.35em] uppercase">Feed</div>
              <div className="mt-2 text-slate-300">Idle</div>
            </div>
            <div className="border border-white/5 bg-black/30 p-3">
              <div className="tracking-[0.35em] uppercase">Telemetry</div>
              <div className="mt-2 text-slate-300">Standby</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentProgress = userProgress.reduce((sum, log) => sum + log.value, 0)
  const progressPercentage = userGoal > 0 ? (currentProgress / userGoal) * 100 : 0

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      {/* Challenge Header */}
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-emerald-300">
                {challenge.category === 'strength' && <Dumbbell className="w-6 h-6" />}
                {challenge.category === 'cardio' && <HeartPulse className="w-6 h-6" />}
                {challenge.category === 'nutrition' && <Apple className="w-6 h-6" />}
                {challenge.category === 'custom' && <Sparkles className="w-6 h-6" />}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">{challenge.name}</h1>
              <span className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-200 text-[10px] font-mono tracking-[0.25em] px-3 py-1 uppercase">
                {challenge.participants.length} ops
              </span>
            </div>

            {challenge.description && (
              <p className="text-slate-300 mb-4 font-mono text-sm">{challenge.description}</p>
            )}

            {/* Progress Bar */}
            <div className="border border-white/5 bg-black/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.35em]">
                  Your progress
                </span>
                <span className="text-xs font-mono text-slate-200">
                  {currentProgress}/{userGoal} {challenge.goal_unit}
                </span>
              </div>
              <div className="w-full h-3 bg-black/40 border border-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="text-right mt-1">
                <span className="text-[10px] font-mono text-slate-500 tracking-[0.35em] uppercase">
                  {Math.round(progressPercentage)}% complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`px-6 py-3 text-[10px] font-mono tracking-[0.35em] uppercase transition-colors ${
            activeTab === 'progress'
              ? 'text-emerald-200 border-b-2 border-emerald-500'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          Progress Feed
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 text-[10px] font-mono tracking-[0.35em] uppercase transition-colors ${
            activeTab === 'details'
              ? 'text-emerald-200 border-b-2 border-emerald-500'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          Challenge Details
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'progress' ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {/* Progress Input */}
              <div className="p-4 border-b border-white/5 bg-black/30 backdrop-blur-xl">
                <ProgressInput challenge={challenge} onLogProgress={onLogProgress} disabled={!canEdit} />
              </div>

              {/* Progress Feed */}
              <div className="flex-1 overflow-y-auto">
                <ProgressFeed
                  logs={userProgress}
                  onReact={() => {}}
                  onComment={() => {}}
                  currentUserId={currentUser?.id || ''}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-6 overflow-y-auto"
            >
              <ChallengeCard
                challenge={challenge}
                userProgress={currentProgress}
                userGoal={userGoal}
                onJoin={() => {}}
                onLeave={() => {}}
                isActive={true}
                canEdit={canEdit}
              />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-white/5 bg-black/30 p-4">
                  <h3 className="text-slate-100 font-black tracking-[0.2em] uppercase text-sm mb-3">
                    Challenge Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-xs">Start:</span>
                      <span className="text-slate-200 font-mono text-xs">
                        {new Date(challenge.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-xs">End:</span>
                      <span className="text-slate-200 font-mono text-xs">
                        {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-xs">Duration:</span>
                      <span className="text-slate-200 font-mono text-xs">
                        {Math.ceil(
                          (new Date(challenge.end_date).getTime() -
                            new Date(challenge.start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-white/5 bg-black/30 p-4">
                  <h3 className="text-slate-100 font-black tracking-[0.2em] uppercase text-sm mb-3">
                    Goal Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-xs">Target:</span>
                      <span className="text-slate-200 font-mono text-xs">
                        {challenge.goal_value} {challenge.goal_unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-xs">Type:</span>
                      <span className="text-slate-200 font-mono text-xs capitalize">
                        {challenge.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-xs">Category:</span>
                      <span className="text-slate-200 font-mono text-xs capitalize">
                        {challenge.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

