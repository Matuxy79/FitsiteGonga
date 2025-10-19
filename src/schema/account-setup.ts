import { z } from 'zod';
import type { Gender, UnitSystem, ActivityLevel } from '@/types/profile';

export const accountSetupSchema = z.object({
  display_name: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .trim(),

  bio: z.string().max(200, 'Bio must be less than 200 characters').optional().or(z.literal('')),

  birthdate: z
    .string()
    .min(1, 'Birthdate is required')
    .refine(date => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed < new Date();
    }, 'Please enter a valid birthdate')
    .refine(date => {
      const parsed = new Date(date);
      const age = new Date().getFullYear() - parsed.getFullYear();
      return age >= 13 && age <= 120;
    }, 'Age must be between 13 and 120 years'),

  gender: z.enum(['male', 'female', 'nonbinary', 'prefer_not'], {
    required_error: 'Please select a gender option',
  }),

  unit_system: z.enum(['metric', 'imperial'], {
    required_error: 'Please select a unit system',
  }),

  height: z
    .number({
      required_error: 'Height is required',
      invalid_type_error: 'Height must be a number',
    })
    .positive('Height must be positive')
    .min(50, 'Height must be at least 50cm or 20 inches')
    .max(300, 'Height must be less than 300cm or 120 inches'),

  weight: z
    .number({
      required_error: 'Weight is required',
      invalid_type_error: 'Weight must be a number',
    })
    .positive('Weight must be positive')
    .min(20, 'Weight must be at least 20kg or 44lbs')
    .max(500, 'Weight must be less than 500kg or 1100lbs'),

  resting_hr: z
    .number({
      invalid_type_error: 'Resting heart rate must be a number',
    })
    .int('Resting heart rate must be a whole number')
    .min(20, 'Resting heart rate must be at least 20 bpm')
    .max(220, 'Resting heart rate must be less than 220 bpm')
    .optional(),

  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'athlete']).optional(),
});

export type AccountSetupFormValues = z.infer<typeof accountSetupSchema>;

// Step-specific schemas for progressive validation
export const profileStepSchema = accountSetupSchema.pick({
  display_name: true,
  bio: true,
  birthdate: true,
  gender: true,
  unit_system: true,
});

export const metricsStepSchema = accountSetupSchema.pick({
  height: true,
  weight: true,
  resting_hr: true,
  activity_level: true,
});

export type ProfileStepValues = z.infer<typeof profileStepSchema>;
export type MetricsStepValues = z.infer<typeof metricsStepSchema>;
