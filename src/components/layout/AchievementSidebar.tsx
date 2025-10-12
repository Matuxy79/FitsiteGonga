'use client'

import { motion } from 'framer-motion'
import type { UserAchievement } from '@/types/fitness'
import { ACHIEVEMENT_TIERS } from '@/types/fitness'

interface AchievementSidebarProps {
  achievements?: UserAchievement[]
  totalProgress?: number
  userLevel?: number
  nextLevelProgress?: number
}

export function AchievementSidebar({ 
  achievements = [],
  totalProgress = 0,
  userLevel = 1,
  nextLevelProgress = 100
}: AchievementSidebarProps) {
  const recentAchievements = achievements.slice(0, 5)
  const levelProgress = (totalProgress / nextLevelProgress) * 100

  return (
    <div className="w-80 bg-discord-darker border-l border-discord-dark flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-discord-dark">
        <h3 className="text-white font-semibold mb-2">Achievements & Progress</h3>
        
        {/* User Level */}
        <div className="bg-discord-dark rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-discord-muted">Level {userLevel}</span>
            <span className="text-xs text-discord-muted">{totalProgress}/{nextLevelProgress} XP</span>
          </div>
          <div className="w-full h-2 bg-discord-darker rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-discord-accent to-discord-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(levelProgress, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <span className="mr-2">🏆</span>
          Recent Achievements
        </h4>
        
        {recentAchievements.length > 0 ? (
          <div className="space-y-3">
            {recentAchievements.map((achievement) => {
              const tier = achievement.achievement?.tier || 'bronze'
              const tierConfig = ACHIEVEMENT_TIERS[tier]
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-discord-dark rounded-lg p-3 border border-discord-medium hover:border-opacity-50 transition-colors"
                  style={{ borderColor: tierConfig.color + '40' }}
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: tierConfig.bgColor }}
                    >
                      {achievement.achievement?.icon || '🏆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-medium text-sm truncate">
                        {achievement.achievement?.name || 'Achievement'}
                      </h5>
                      <p className="text-discord-muted text-xs mt-1 line-clamp-2">
                        {achievement.achievement?.description || 'Achievement description'}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ 
                            backgroundColor: tierConfig.bgColor,
                            color: tierConfig.color 
                          }}
                        >
                          {tier.toUpperCase()}
                        </span>
                        <span className="text-xs text-discord-muted">
                          {new Date(achievement.earned_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-discord-muted text-sm">No achievements yet</p>
            <p className="text-discord-muted text-xs mt-1">Complete challenges to earn your first badge!</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-discord-dark">
        <h4 className="text-white font-medium mb-3">Quick Stats</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-discord-dark rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{achievements.length}</div>
            <div className="text-xs text-discord-muted">Achievements</div>
          </div>
          <div className="bg-discord-dark rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{userLevel}</div>
            <div className="text-xs text-discord-muted">Level</div>
          </div>
        </div>
      </div>
    </div>
  )
}
