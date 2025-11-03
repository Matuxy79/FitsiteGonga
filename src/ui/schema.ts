// UI Schema: Component contracts that define how components render domain concepts
// Provides defaults (copy, icons, color tokens, layout options) and per-category overrides

import type { Challenge, ProgressLog, Achievement } from '@/types/fitness'

// Base schema interface
export interface ComponentSchema<T> {
  defaults: T
  overrides?: Partial<Record<string, Partial<T>>>
}

// Challenge Card Schema
export interface ChallengeCardSchema {
  icon: string
  title: string
  subtitle?: string
  participantsLabel: string
  goalLabel: string
  statusColor: string
  statusText: string
  actionText: string
  emptyStateText: string
  emptyStateIcon: string
}

export const challengeCardSchema: ComponentSchema<ChallengeCardSchema> = {
  defaults: {
    icon: '🎯',
    title: 'Challenge',
    subtitle: 'Complete your fitness goals',
    participantsLabel: 'participants',
    goalLabel: 'goal',
    statusColor: 'text-discord-muted',
    statusText: 'Inactive',
    actionText: 'Join Challenge',
    emptyStateText: 'No challenges available',
    emptyStateIcon: '📭',
  },
  overrides: {
    strength: {
      icon: '💪',
      title: 'Strength Challenge',
      statusColor: 'text-discord-warning',
      statusText: 'Active',
      actionText: 'Start Lifting',
    },
    cardio: {
      icon: '🏃',
      title: 'Cardio Challenge',
      statusColor: 'text-discord-success',
      statusText: 'Active',
      actionText: 'Start Running',
    },
    nutrition: {
      icon: '🥗',
      title: 'Nutrition Challenge',
      statusColor: 'text-discord-accent',
      statusText: 'Active',
      actionText: 'Start Eating',
    },
    custom: {
      icon: '🎯',
      title: 'Custom Challenge',
      statusColor: 'text-discord-muted',
      statusText: 'Custom',
      actionText: 'Join Challenge',
    },
  },
}

// Progress Entry Schema
export interface ProgressEntrySchema {
  userName: string
  amount: string
  timestamp: string
  notes?: string
  reactionEmojis: string[]
  commentPlaceholder: string
  emptyStateText: string
  emptyStateIcon: string
}

export const progressEntrySchema: ComponentSchema<ProgressEntrySchema> = {
  defaults: {
    userName: 'User',
    amount: '+0 units',
    timestamp: 'Just now',
    notes: '',
    reactionEmojis: ['👍', '💪', '🔥', '🎉', '❤️'],
    commentPlaceholder: 'Add a comment...',
    emptyStateText: 'No progress logged yet',
    emptyStateIcon: '📝',
  },
  overrides: {
    strength: {
      reactionEmojis: ['💪', '🔥', '🏋️', '💯', '👑'],
      commentPlaceholder: 'How did the workout feel?',
    },
    cardio: {
      reactionEmojis: ['🏃', '💨', '⚡', '🎯', '🌟'],
      commentPlaceholder: 'How was your run?',
    },
    nutrition: {
      reactionEmojis: ['🥗', '🍎', '💚', '✨', '🎊'],
      commentPlaceholder: 'What did you eat?',
    },
  },
}

// Achievement Badge Schema
export interface AchievementBadgeSchema {
  icon: string
  name: string
  description: string
  tierColor: string
  tierText: string
  progressText: string
  earnedDate: string
  emptyStateText: string
  emptyStateIcon: string
}

export const achievementBadgeSchema: ComponentSchema<AchievementBadgeSchema> = {
  defaults: {
    icon: '🏆',
    name: 'Achievement',
    description: 'Complete challenges to earn achievements',
    tierColor: 'text-discord-muted',
    tierText: 'Locked',
    progressText: '0%',
    earnedDate: 'Not earned',
    emptyStateText: 'No achievements yet',
    emptyStateIcon: '🔒',
  },
  overrides: {
    bronze: {
      tierColor: 'text-amber-600',
      tierText: 'Bronze',
    },
    silver: {
      tierColor: 'text-gray-400',
      tierText: 'Silver',
    },
    gold: {
      tierColor: 'text-yellow-500',
      tierText: 'Gold',
    },
    platinum: {
      tierColor: 'text-purple-400',
      tierText: 'Platinum',
    },
    diamond: {
      tierColor: 'text-blue-400',
      tierText: 'Diamond',
    },
    legendary: {
      tierColor: 'text-red-500',
      tierText: 'Legendary',
    },
  },
}

// Helper function to get schema with overrides
export function getSchemaWithOverrides<T>(
  schema: ComponentSchema<T>,
  category?: string
): T {
  if (!category || !schema.overrides?.[category]) {
    return schema.defaults
  }
  
  return {
    ...schema.defaults,
    ...schema.overrides[category],
  }
}

// Type-safe schema getters
export function getChallengeCardSchema(category?: Challenge['category']): ChallengeCardSchema {
  return getSchemaWithOverrides(challengeCardSchema, category)
}

export function getProgressEntrySchema(category?: string): ProgressEntrySchema {
  return getSchemaWithOverrides(progressEntrySchema, category)
}

export function getAchievementBadgeSchema(tier?: Achievement['tier']): AchievementBadgeSchema {
  return getSchemaWithOverrides(achievementBadgeSchema, tier)
}
