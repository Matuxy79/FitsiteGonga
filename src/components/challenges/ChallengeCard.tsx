'use client'

import { motion } from 'framer-motion'
import { CHALLENGE_CATEGORIES } from '@/types/fitness'
import type { ChallengeCardProps } from '@/types/fitness'

export function ChallengeCard({
  challenge,
  userProgress = 0,
  userGoal = 100,
  onJoin,
  onLeave,
  isActive = false,
  canEdit = false
}: ChallengeCardProps) {
  const categoryConfig = CHALLENGE_CATEGORIES[challenge.category]
  const progressPercentage = userGoal > 0 ? (userProgress / userGoal) * 100 : 0
  const isCompleted = progressPercentage >= 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-discord-darker rounded-lg border transition-all duration-200 ${
        isActive 
          ? 'border-discord-accent shadow-lg shadow-discord-accent/20' 
          : 'border-discord-dark hover:border-discord-medium'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-discord-dark">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
              style={{ backgroundColor: categoryConfig.color + '20' }}
            >
              {categoryConfig.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold">{challenge.name}</h3>
              <p className="text-discord-muted text-sm">{challenge.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: categoryConfig.color + '20',
                color: categoryConfig.color 
              }}
            >
              {challenge.category}
            </span>
            {isCompleted && (
              <span className="px-2 py-1 bg-discord-success text-white rounded-full text-xs font-medium">
                Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-discord-muted">Your Progress</span>
            <span className="text-sm text-white font-medium">
              {userProgress}/{userGoal} {challenge.goal_unit}
            </span>
          </div>
          <div className="w-full h-2 bg-discord-dark rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-discord-accent to-discord-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-xs text-discord-muted">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
        </div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-discord-dark rounded-lg p-3">
            <div className="text-lg font-bold text-white">{challenge.participants.length}</div>
            <div className="text-xs text-discord-muted">Participants</div>
          </div>
          <div className="bg-discord-dark rounded-lg p-3">
            <div className="text-lg font-bold text-white">{challenge.goal_value}</div>
            <div className="text-xs text-discord-muted">Target {challenge.goal_unit}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-discord-dark rounded-lg p-3 mb-4">
          <h4 className="text-white font-medium text-sm mb-2">Challenge Timeline</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-discord-muted">Start:</span>
              <span className="text-white">{new Date(challenge.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-discord-muted">End:</span>
              <span className="text-white">{new Date(challenge.end_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {isActive ? (
            <button
              onClick={onLeave}
              className="flex-1 bg-discord-error hover:bg-discord-error/80 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Leave Challenge
            </button>
          ) : (
            <button
              onClick={onJoin}
              className="flex-1 bg-discord-accent hover:bg-discord-accent/80 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Join Challenge
            </button>
          )}
          
          {canEdit && (
            <button className="bg-discord-medium hover:bg-discord-medium/80 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              Edit
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
