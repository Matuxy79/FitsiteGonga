// Profile and fitness-related types for FitsiteGonga

import { Profile as TrainingProfile, TrainingPreferences } from './training';

export type Gender = 'male' | 'female' | 'nonbinary' | 'prefer_not';
export type UnitSystem = 'metric' | 'imperial';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Season = 'reset' | 'build' | 'challenge';

// Re-export the Profile from training.ts as the main Profile type
export type Profile = TrainingProfile;

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
  // Training preferences
  favorite_movements?: string[];
  training_frequency?: number;
  one_rm_formula?: string;
}

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}
