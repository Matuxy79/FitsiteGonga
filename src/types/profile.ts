// Profile and fitness-related types for FitsiteGonga

export type Gender = 'male' | 'female' | 'nonbinary' | 'prefer_not';
export type UnitSystem = 'metric' | 'imperial';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Season = 'reset' | 'build' | 'challenge';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  gender: Gender | null;
  birthdate: string | null; // ISO date string
  unit_system: UnitSystem;
  activity_level: ActivityLevel | null;
  season: Season;
  created_at: string;
  updated_at: string;
}

export interface FitnessMetrics {
  id: string;
  user_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_percent: number | null;
  resting_hr: number | null;
  max_hr: number | null;
  updated_at: string;
}

export interface MeasurementHistory {
  id: string;
  user_id: string;
  measure_date: string; // ISO date string
  weight_kg: number | null;
  body_fat_percent: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  chest_cm: number | null;
  notes: string | null;
  created_at: string;
}

export interface UserMetrics {
  user_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  bmr: number | null;
  resting_hr: number | null;
  max_hr: number | null;
  updated_at: string;
}

export interface AccountSetupFormValues {
  display_name: string;
  bio?: string;
  birthdate: string;
  gender: Gender;
  unit_system: UnitSystem;
  height: number;
  weight: number;
  resting_hr?: number;
  activity_level?: ActivityLevel;
}

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}
