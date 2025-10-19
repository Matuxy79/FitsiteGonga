export interface EnergyCheckin {
  id: string;
  user_id: string;
  mode: 'rest' | 'training';
  energy?: 'low' | 'med' | 'high';
  note?: string;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: { display_name: string; avatar_url?: string };
}

export interface Plan {
  user_id: string;
  tier: 'free' | 'premium';
  renews_at?: string;
}

export interface SplitTemplate {
  name: string;
  exercises: Array<{
    movement: string;
    sets: number;
    reps: string;
    notes?: string;
  }>;
}

export interface TrainingPrefs {
  mode?: 'rest' | 'training';
  split?: 'push_pull_legs' | 'upper_lower' | 'full_body' | 'bro';
  weekMap?: Record<string, string>; // day of week -> template name
  template?: string;
  lightDay?: boolean;
}

export interface UserPR {
  movement_id: string;
  movement_name: string;
  best_1rm_kg: number;
  last_performed_at: string;
}

export interface LiftGoal {
  id: string;
  user_id: string;
  movement_id: string;
  target_1rm_kg?: number;
  target_weight_kg?: number;
  target_reps?: number;
  due_date?: string;
  created_at: string;
  movement?: {
    name: string;
    key: string;
  };
}

export interface ExerciseSet {
  id: string;
  session_exercise_id: string;
  set_index: number;
  weight_kg?: number;
  reps?: number;
  rpe?: number;
  tempo?: string;
  duration_sec?: number;
  distance_m?: number;
  est_1rm_kg?: number;
  tonnage_kg?: number;
  notes?: string;
  performed_at: string;
}

export interface MeasurementHistory {
  id: string;
  user_id: string;
  measure_date: string;
  weight_kg?: number;
  body_fat_percent?: number;
  waist_cm?: number;
  hips_cm?: number;
  chest_cm?: number;
  notes?: string;
  created_at: string;
}

export interface FitnessMetrics {
  id: string;
  user_id: string;
  weight_kg?: number;
  height_cm?: number;
  body_fat_percent?: number;
  resting_hr?: number;
  max_hr?: number;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  title?: string;
  notes?: string;
}

export interface Movement {
  id: string;
  key: string;
  name: string;
  category: 'compound' | 'isolation' | 'bodyweight' | 'cardio' | 'mobility';
  primary_muscles: string[];
  secondary_muscles: string[];
  default_equipment:
    | 'barbell'
    | 'dumbbell'
    | 'machine'
    | 'cable'
    | 'kettlebell'
    | 'bodyweight'
    | 'other';
  is_bodyweight: boolean;
  created_at: string;
}

export interface Exercise {
  id: string;
  movement_id: string;
  variation: string;
  name: string;
  media_url?: string;
  movement?: Movement;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  exercise?: Exercise;
}
