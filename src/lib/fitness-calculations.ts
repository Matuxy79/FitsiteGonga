// Fitness calculation utilities for FitsiteGonga

import type { Gender } from '@/types/profile';

/**
 * Calculate BMI (Body Mass Index)
 * Formula: weight(kg) / height(m)²
 */
export function calcBMI(weightKg?: number, heightCm?: number): number | undefined {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return undefined;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return Number(bmi.toFixed(1));
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
 * Formula varies by gender:
 * - Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
 * - Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
 */
export function calcBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;

  switch (gender) {
    case 'male':
      return Math.round(baseBMR + 5);
    case 'female':
      return Math.round(baseBMR - 161);
    case 'nonbinary':
    case 'prefer_not':
    default:
      // Use average of male and female formulas
      return Math.round(baseBMR - 78);
  }
}

/**
 * Calculate age from birthdate
 */
export function ageFromBirthdate(birthdate?: string): number | undefined {
  if (!birthdate) return undefined;

  const birth = new Date(birthdate);
  const today = new Date();

  if (isNaN(birth.getTime())) return undefined;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure) based on activity level
 */
export function calcTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };

  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate ideal weight range based on height and BMI range (18.5-24.9)
 */
export function calcIdealWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  const minBMI = 18.5;
  const maxBMI = 24.9;

  return {
    min: Number((minBMI * heightM * heightM).toFixed(1)),
    max: Number((maxBMI * heightM * heightM).toFixed(1)),
  };
}

/**
 * Calculate maximum heart rate using age
 */
export function calcMaxHR(age: number): number {
  return 220 - age;
}

/**
 * Calculate target heart rate zones
 */
export function calcHeartRateZones(maxHR: number): {
  fatBurn: { min: number; max: number };
  cardio: { min: number; max: number };
  peak: { min: number; max: number };
} {
  return {
    fatBurn: {
      min: Math.round(maxHR * 0.5),
      max: Math.round(maxHR * 0.6),
    },
    cardio: {
      min: Math.round(maxHR * 0.6),
      max: Math.round(maxHR * 0.7),
    },
    peak: {
      min: Math.round(maxHR * 0.7),
      max: Math.round(maxHR * 0.9),
    },
  };
}
