// ViewModels expose render-ready data and derived fields
import type { Challenge, ProgressLog, Achievement } from '@/types/fitness'

export interface ChallengeViewModel {
  id: string
  title: string
  subtitle?: string
  icon: string
  participants: number
  goalLabel: string
  category: Challenge['category']
}

export function toChallengeVM(ch: Challenge): ChallengeViewModel {
  const icon = ch.category === 'strength' ? '💪' : ch.category === 'cardio' ? '🏃' : ch.category === 'nutrition' ? '🥗' : '🎯'
  return {
    id: ch.id,
    title: ch.name,
    subtitle: ch.description,
    icon,
    participants: ch.participants.length,
    goalLabel: `${ch.goal_value} ${ch.goal_unit}`,
    category: ch.category,
  }
}

export interface ProgressLogViewModel {
  id: string
  userName: string
  amount: string
  timestamp: string
  notes?: string
}

export function toProgressVM(log: ProgressLog): ProgressLogViewModel {
  return {
    id: log.id,
    userName: log.user?.display_name || 'User',
    amount: `+${log.value} ${log.unit}`,
    timestamp: new Date(log.logged_at).toLocaleString(),
    notes: log.notes,
  }
}

export interface AchievementViewModel {
  id: string
  name: string
  description: string
  icon: string
  tier: Achievement['tier']
  tierColor: string
  progress: number
  progressText: string
  isEarned: boolean
  earnedDate?: string
  category: Achievement['category']
}

export function toAchievementVM(achievement: Achievement, userAchievement?: any): AchievementViewModel {
  const tierColors = {
    bronze: 'text-amber-600',
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
    platinum: 'text-purple-400',
    diamond: 'text-blue-400',
    legendary: 'text-red-500',
  }

  const isEarned = !!userAchievement
  const progress = userAchievement?.progress_value || 0
  const progressText = isEarned ? '100%' : `${Math.min(progress, 100)}%`

  return {
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    tier: achievement.tier,
    tierColor: tierColors[achievement.tier] || 'text-discord-muted',
    progress: isEarned ? 100 : Math.min(progress, 100),
    progressText,
    isEarned,
    earnedDate: userAchievement?.earned_date ? new Date(userAchievement.earned_date).toLocaleDateString() : undefined,
    category: achievement.category,
  }
}


