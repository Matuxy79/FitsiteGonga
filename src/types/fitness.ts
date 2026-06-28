// =============================================================================
// FITSITEGONGA - Production Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// USER & AUTH
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'CLIENT' | 'TRAINER' | 'ADMIN';
  fitness_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  body_weight?: number;
  body_weight_unit?: 'LBS' | 'KG';
  goals: string[];
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// CHALLENGES (Original System)
// -----------------------------------------------------------------------------

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  category: 'STRENGTH' | 'CARDIO' | 'NUTRITION' | 'CUSTOM';
  type: 'DURATION' | 'REPETITION' | 'DISTANCE' | 'CUSTOM';
  goal_value: number;
  goal_unit: string;
  start_date: string;
  end_date: string;
  created_by: string;
  is_active: boolean;
  participants: string[];
  created_at: string;
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
  user?: User;
  challenge?: Challenge;
}

export interface ProgressReaction {
  id: string;
  reaction: string;
  user_id?: string;
}

export interface ProgressEntryProps {
  log: ProgressLog;
  user: User;
  onReact: (reaction: string) => void;
  onComment: (comment: string) => void;
  canEdit?: boolean;
  reactions?: ProgressReaction[];
}

export interface ProgressFeedProps {
  logs: ProgressLog[];
  onReact: (logId: string, reaction: string) => void;
  onComment: (logId: string, comment: string) => void;
  currentUserId: string;
}

// -----------------------------------------------------------------------------
// ACHIEVEMENTS
// -----------------------------------------------------------------------------

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'LEGENDARY';
export type AchievementCategory = 'WORKOUT' | 'CONSISTENCY' | 'MILESTONE' | 'SOCIAL';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  category: AchievementCategory;
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
  achievement?: Achievement;
}

// -----------------------------------------------------------------------------
// LIFT TRACKING (The Forge)
// -----------------------------------------------------------------------------

export type WeightUnit = 'LBS' | 'KG';
export type LiftTrend = 'up' | 'down' | 'stable';

export interface TrackedLift {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  working_weight: number;
  working_unit: WeightUnit;
  one_rep_max: number | null;
  goal_weight: number | null;
  goal_date: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Computed from API
  bestSet?: {
    weight: number;
    reps: number;
    estimated_1rm: number;
    date: string;
  };
  lastSet?: {
    weight: number;
    reps: number;
    date: string;
    formatted: string;
  };
  trend?: LiftTrend;
  totalSets?: number;
}

export interface SetLog {
  id: string;
  lift_id: string;
  user_id: string;
  weight: number;
  reps: number;
  unit: WeightUnit;
  rpe: number | null;
  tempo: string | null;
  rest_time: number | null;
  set_number: number | null;
  is_warmup: boolean;
  is_pr: boolean;
  estimated_1rm: number | null;
  volume: number | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export type GoalType = 'ONE_REP_MAX' | 'WORKING_WEIGHT' | 'VOLUME' | 'CONSISTENCY' | 'REPS';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';

export interface LiftGoal {
  id: string;
  lift_id: string;
  user_id: string;
  goal_type: GoalType;
  target_value: number;
  current_value: number;
  timeframe_days: number | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

// Active session (client-side)
export interface ActiveSet {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup: boolean;
  isPR: boolean;
  timestamp: Date;
  restTime?: number;
}

export interface LiftSession {
  liftId: string;
  exerciseId: string;
  exerciseName: string;
  sets: ActiveSet[];
  startTime: Date;
  endTime?: Date;
  notes?: string;
}

// -----------------------------------------------------------------------------
// WORKOUT PLANNING
// -----------------------------------------------------------------------------

export type WorkoutType = 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER' | 'FULL_BODY' | 'CARDIO' | 'REST' | 'CUSTOM';
export type WorkoutStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'RESCHEDULED';

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: WorkoutType;
  exercises: {
    exercise_id: string;
    sets: number;
    reps_min: number;
    reps_max: number;
    rest_seconds: number;
  }[];
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledWorkout {
  id: string;
  user_id: string;
  template_id: string | null;
  scheduled_for: string;
  day_of_week: number | null;
  is_recurring: boolean;
  status: WorkoutStatus;
  started_at: string | null;
  completed_at: string | null;
  template?: WorkoutTemplate;
}

// -----------------------------------------------------------------------------
// MESSAGING (The Nexus)
// -----------------------------------------------------------------------------

export type ChannelType = 'GLOBAL' | 'SQUAD' | 'DIRECT' | 'TRAINER';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: User['role'];
  };
  channel_type: ChannelType;
  squad_id: string | null;
  recipient_id: string | null;
  parent_id: string | null;
  media_urls: string[];
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
  reactions: MessageReaction[];
  _count?: { replies: number };
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  user: { id: string; display_name: string };
}

// -----------------------------------------------------------------------------
// SQUADS (Alpha Squads)
// -----------------------------------------------------------------------------

export type SquadVisibility = 'PUBLIC' | 'INVITE_ONLY' | 'PRIVATE';
export type SquadRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface Squad {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  owner?: User;
  visibility: SquadVisibility;
  max_members: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  memberCount?: number;
  unreadCount?: number;
  role?: SquadRole;
}

export interface SquadMember {
  id: string;
  squad_id: string;
  user_id: string;
  role: SquadRole;
  joined_at: string;
  notifications_enabled: boolean;
  user?: User;
}

export interface SquadInvite {
  id: string;
  squad_id: string;
  inviter_id: string;
  invitee_id: string;
  status: InviteStatus;
  created_at: string;
  responded_at: string | null;
  squad?: Squad;
  inviter?: User;
}

// -----------------------------------------------------------------------------
// SOCIAL (Friendships & Trainer Links)
// -----------------------------------------------------------------------------

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';
export type TrainerClientStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface Friendship {
  id: string;
  user_a_id: string;
  user_b_id: string;
  status: FriendshipStatus;
  initiated_by: string;
  accepted_at: string | null;
  created_at: string;
  friend?: User; // The other user
}

export interface TrainerClient {
  id: string;
  trainer_id: string;
  client_id: string;
  status: TrainerClientStatus;
  can_view_progress: boolean;
  can_create_workouts: boolean;
  can_modify_goals: boolean;
  started_at: string;
  ended_at: string | null;
  trainer?: User;
  client?: User;
}

// -----------------------------------------------------------------------------
// TRI-SECTOR SIDEBAR STATE
// -----------------------------------------------------------------------------

export type SectorId = 'nexus' | 'forge' | 'identity';

export type NexusPanel = 'global-feed' | 'trainer-link' | 'alpha-squads';
export type ForgePanel = 'active-lifts' | 'week-planner' | 'challenges';
export type IdentityPanel = 'profile' | 'friends' | 'settings';

export type SidebarPanel = NexusPanel | ForgePanel | IdentityPanel;

export interface SidebarState {
  activeSector: SectorId;
  activePanel: SidebarPanel;
  notifications: {
    nexus: number;
    forge: number;
    identity: number;
  };
}

// -----------------------------------------------------------------------------
// API RESPONSES
// -----------------------------------------------------------------------------

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

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// -----------------------------------------------------------------------------
// FORM TYPES
// -----------------------------------------------------------------------------

export interface CreateLiftForm {
  exercise_id: string;
  exercise_name: string;
  working_weight: number;
  working_unit: WeightUnit;
  goal_weight?: number;
  goal_date?: string;
}

export interface LogSetForm {
  weight: number;
  reps: number;
  unit: WeightUnit;
  rpe?: number;
  tempo?: string;
  rest_time?: number;
  set_number?: number;
  is_warmup: boolean;
  notes?: string;
}

export interface LogSessionForm {
  exercise_id: string;
  sets: LogSetForm[];
  notes?: string;
  start_time: string;
  end_time: string;
}

export interface CreateSquadForm {
  name: string;
  description?: string;
  visibility: SquadVisibility;
  max_members: number;
}

export interface SendMessageForm {
  content: string;
  channel_type: ChannelType;
  squad_id?: string;
  recipient_id?: string;
  parent_id?: string;
  media_urls?: string[];
}

// -----------------------------------------------------------------------------
// REALTIME EVENTS
// -----------------------------------------------------------------------------

export interface MessageEvent {
  type: 'message:global' | 'message:squad' | 'message:direct';
  message: Message;
}

export interface ReactionEvent {
  type: 'message:reaction';
  messageId: string;
  emoji: string;
  userId: string;
  action: 'added' | 'removed';
}

export interface SquadEvent {
  type: 'squad:invite' | 'squad:member-joined' | 'squad:member-left';
  squadId: string;
  userId: string;
}

export interface LiftEvent {
  type: 'lift:pr' | 'lift:session-complete';
  liftId: string;
  userId: string;
  data: Record<string, unknown>;
}

export type RealtimeEvent = MessageEvent | ReactionEvent | SquadEvent | LiftEvent;

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

export const ACHIEVEMENT_TIERS = {
  BRONZE: { color: '#cd7f32', bgColor: '#cd7f3220' },
  SILVER: { color: '#c0c0c0', bgColor: '#c0c0c020' },
  GOLD: { color: '#ffd700', bgColor: '#ffd70020' },
  PLATINUM: { color: '#e5e4e2', bgColor: '#e5e4e220' },
  DIAMOND: { color: '#b9f2ff', bgColor: '#b9f2ff20' },
  LEGENDARY: { color: '#ff6b6b', bgColor: '#ff6b6b20' },
} as const;

export const CHALLENGE_CATEGORIES = {
  STRENGTH: { icon: '💪', color: '#ff6b6b', name: 'Strength' },
  CARDIO: { icon: '🏃', color: '#4ecdc4', name: 'Cardio' },
  NUTRITION: { icon: '🥗', color: '#45b7d1', name: 'Nutrition' },
  CUSTOM: { icon: '🎯', color: '#96ceb4', name: 'Custom' },
} as const;

export const SECTOR_COLORS = {
  nexus: '#10b981',    // Emerald/Green
  forge: '#a855f7',    // Purple
  identity: '#06b6d4', // Cyan
} as const;

export const WORKOUT_TYPES = {
  PUSH: { icon: '💪', color: '#ef4444', name: 'Push' },
  PULL: { icon: '🔙', color: '#3b82f6', name: 'Pull' },
  LEGS: { icon: '🦵', color: '#22c55e', name: 'Legs' },
  UPPER: { icon: '⬆️', color: '#f59e0b', name: 'Upper' },
  LOWER: { icon: '⬇️', color: '#06b6d4', name: 'Lower' },
  FULL_BODY: { icon: '🏋️', color: '#8b5cf6', name: 'Full Body' },
  CARDIO: { icon: '🏃', color: '#ec4899', name: 'Cardio' },
  REST: { icon: '😴', color: '#6b7280', name: 'Rest' },
  CUSTOM: { icon: '⚙️', color: '#64748b', name: 'Custom' },
} as const;
