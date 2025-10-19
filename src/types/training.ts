export type MovementCategory = 'compound' | 'isolation' | 'bodyweight' | 'cardio' | 'mobility';
export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'kettlebell'
  | 'bodyweight'
  | 'other';
export type UserRole = 'client' | 'trainer' | 'admin';
export type OneRMFormula = 'epley' | 'brzycki' | 'lombardi' | 'oconner';

export interface Movement {
  id: string;
  key: string;
  name: string;
  category: MovementCategory;
  primary_muscles: string[];
  secondary_muscles: string[];
  default_equipment: EquipmentType;
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

export interface WorkoutSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  title?: string;
  notes?: string;
  session_exercises?: SessionExercise[];
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  exercise?: Exercise;
  exercise_sets?: ExerciseSet[];
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

export interface LiftGoal {
  id: string;
  user_id: string;
  movement_id: string;
  target_1rm_kg?: number;
  target_weight_kg?: number;
  target_reps?: number;
  due_date?: string;
  created_at: string;
  movement?: Movement;
}

export interface UserPR {
  user_id: string;
  movement_id: string;
  movement_name: string;
  best_1rm_kg: number;
  last_performed_at: string;
}

export interface TrainingPreferences {
  favorite_movements?: string[];
  training_frequency?: number; // days per week
  one_rm_formula?: OneRMFormula;
  default_unit_system?: 'metric' | 'imperial';
}

export interface Profile {
  id: string;
  display_name?: string;
  bio?: string;
  birthdate?: string;
  gender?: string;
  unit_system: 'metric' | 'imperial';
  role: UserRole;
  training_prefs: TrainingPreferences;
  created_at: string;
  updated_at: string;
}
