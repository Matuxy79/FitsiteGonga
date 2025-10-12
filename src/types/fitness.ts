// TypeScript types for FitsiteGonga fitness platform

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'client' | 'trainer' | 'admin';
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  category: 'strength' | 'cardio' | 'nutrition' | 'custom';
  type: 'duration' | 'repetition' | 'distance' | 'custom';
  goal_value: number;
  goal_unit: string;
  start_date: string;
  end_date: string;
  created_by: string;
  is_active: boolean;
  participants: string[];
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  category: 'workout' | 'consistency' | 'milestone' | 'social';
  criteria: {
    workout_count?: number;
    streak_days?: number;
    distance_miles?: number;
    group_challenges?: number;
    encouragements?: number;
    users_helped?: number;
  };
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_date: string;
  progress_value?: number;
  achievement?: Achievement; // Populated via join
}

export interface ProgressLog {
  id: string;
  user_id: string;
  challenge_id: string;
  value: number;
  unit: string;
  notes?: string;
  photo_url?: string;
  logged_at: string;
  created_at: string;
  user?: User; // Populated via join
  challenge?: Challenge; // Populated via join
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  goal_type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'custom';
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Discord-inspired UI types
export interface ChannelCategory {
  id: string;
  name: string;
  icon: string;
  challenges: Challenge[];
}

export interface ServerGroup {
  id: string;
  name: string;
  icon: string;
  channels: ChannelCategory[];
  member_count: number;
}

// Component prop types
export interface ChallengeCardProps {
  challenge: Challenge;
  userProgress?: number;
  userGoal?: number;
  onJoin: () => void;
  onLeave: () => void;
  isActive: boolean;
  canEdit?: boolean;
}

export interface ProgressEntryProps {
  log: ProgressLog;
  user: User;
  onReact: (reaction: string) => void;
  onComment: (comment: string) => void;
  canEdit: boolean;
  reactions?: ProgressReaction[];
}

export interface AchievementBadgeProps {
  achievement: UserAchievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export interface GoalButtonProps {
  goal: FitnessGoal;
  onUpdate: (value: number) => void;
  isActive: boolean;
  disabled?: boolean;
}

export interface SidebarProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  challenges: Challenge[];
  userRole: User['role'];
}

export interface ChallengeChannelProps {
  challenge: Challenge;
  userProgress: ProgressLog[];
  userGoal?: number;
  onLogProgress: (value: number, notes?: string) => void;
  canEdit: boolean;
}

export interface ProgressFeedProps {
  logs: ProgressLog[];
  onReact: (logId: string, reaction: string) => void;
  onComment: (logId: string, comment: string) => void;
  currentUserId: string;
}

export interface AchievementSidebarProps {
  achievements: UserAchievement[];
  totalProgress: number;
  userLevel: number;
  nextLevelProgress: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface CreateChallengeForm {
  name: string;
  description?: string;
  category: Challenge['category'];
  type: Challenge['type'];
  goal_value: number;
  goal_unit: string;
  start_date: string;
  end_date: string;
}

export interface LogProgressForm {
  challenge_id: string;
  value: number;
  notes?: string;
  photo?: File;
}

export interface CreateGoalForm {
  goal_type: FitnessGoal['goal_type'];
  target_value: number;
  unit: string;
  deadline?: string;
}

// Real-time event types
export interface ProgressUpdateEvent {
  type: 'progress_logged';
  user_id: string;
  challenge_id: string;
  value: number;
  timestamp: string;
}

export interface AchievementEvent {
  type: 'achievement_earned';
  user_id: string;
  achievement_id: string;
  achievement_name: string;
  timestamp: string;
}

export interface ChallengeUpdateEvent {
  type: 'challenge_updated' | 'challenge_joined' | 'challenge_left';
  challenge_id: string;
  user_id: string;
  timestamp: string;
}

export type RealtimeEvent = ProgressUpdateEvent | AchievementEvent | ChallengeUpdateEvent;

// Utility types
export interface ProgressReaction {
  id: string;
  log_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface ProgressComment {
  id: string;
  log_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface UserStats {
  total_workouts: number;
  total_distance: number;
  current_streak: number;
  longest_streak: number;
  achievements_earned: number;
  goals_completed: number;
  goals_active: number;
}

export interface ChallengeStats {
  total_participants: number;
  total_progress_logs: number;
  average_progress: number;
  completion_rate: number;
  top_contributors: Array<{
    user_id: string;
    user_name: string;
    total_progress: number;
  }>;
}

// Discord-inspired theme types
export interface DiscordTheme {
  colors: {
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Achievement tier colors and styling
export const ACHIEVEMENT_TIERS = {
  bronze: { color: '#cd7f32', bgColor: '#cd7f3220' },
  silver: { color: '#c0c0c0', bgColor: '#c0c0c020' },
  gold: { color: '#ffd700', bgColor: '#ffd70020' },
  platinum: { color: '#e5e4e2', bgColor: '#e5e4e220' },
  diamond: { color: '#b9f2ff', bgColor: '#b9f2ff20' },
  legendary: { color: '#ff6b6b', bgColor: '#ff6b6b20' },
} as const;

// Challenge category icons and colors
export const CHALLENGE_CATEGORIES = {
  strength: { icon: '💪', color: '#ff6b6b', name: 'Strength' },
  cardio: { icon: '🏃', color: '#4ecdc4', name: 'Cardio' },
  nutrition: { icon: '🥗', color: '#45b7d1', name: 'Nutrition' },
  custom: { icon: '🎯', color: '#96ceb4', name: 'Custom' },
} as const;
