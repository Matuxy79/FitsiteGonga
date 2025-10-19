import { OneRMFormula } from '@/types/training';

/**
 * Calculate 1RM using the Epley formula
 * 1RM = weight * (1 + reps/30)
 */
export function est1RMEpley(weight: number, reps: number): number | null {
  if (!weight || !reps || reps < 1) return null;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Calculate 1RM using the Brzycki formula
 * 1RM = weight * (36 / (37 - reps))
 */
export function est1RMBrzycki(weight: number, reps: number): number | null {
  if (!weight || !reps || reps < 1) return null;
  if (reps === 1) return weight;
  if (reps >= 37) return null; // Invalid for this formula
  return weight * (36 / (37 - reps));
}

/**
 * Calculate 1RM using the Lombardi formula
 * 1RM = weight * (reps^0.1)
 */
export function est1RMLombardi(weight: number, reps: number): number | null {
  if (!weight || !reps || reps < 1) return null;
  if (reps === 1) return weight;
  return weight * Math.pow(reps, 0.1);
}

/**
 * Calculate 1RM using the O'Conner formula
 * 1RM = weight * (1 + reps/40)
 */
export function est1RMOConner(weight: number, reps: number): number | null {
  if (!weight || !reps || reps < 1) return null;
  if (reps === 1) return weight;
  return weight * (1 + reps / 40);
}

/**
 * Calculate 1RM using the specified formula
 */
export function calculate1RM(
  weight: number,
  reps: number,
  formula: OneRMFormula = 'epley'
): number | null {
  switch (formula) {
    case 'epley':
      return est1RMEpley(weight, reps);
    case 'brzycki':
      return est1RMBrzycki(weight, reps);
    case 'lombardi':
      return est1RMLombardi(weight, reps);
    case 'oconner':
      return est1RMOConner(weight, reps);
    default:
      return est1RMEpley(weight, reps);
  }
}

/**
 * Calculate tonnage (total weight moved)
 */
export function calculateTonnage(weight: number, reps: number): number | null {
  if (!weight || !reps) return null;
  return weight * reps;
}

/**
 * Format weight for display based on unit system
 */
export function formatWeight(
  weightKg: number,
  unitSystem: 'metric' | 'imperial' = 'metric'
): string {
  if (unitSystem === 'imperial') {
    const lbs = weightKg * 2.20462;
    return `${lbs.toFixed(1)} lbs`;
  }
  return `${weightKg.toFixed(1)} kg`;
}

/**
 * Format 1RM for display with formula indicator
 */
export function format1RM(
  weightKg: number,
  unitSystem: 'metric' | 'imperial' = 'metric',
  formula: OneRMFormula = 'epley'
): string {
  const formatted = formatWeight(weightKg, unitSystem);
  const formulaNames = {
    epley: 'Epley',
    brzycki: 'Brzycki',
    lombardi: 'Lombardi',
    oconner: "O'Conner",
  };
  return `${formatted} (${formulaNames[formula]})`;
}

/**
 * Get formula options for dropdowns
 */
export function getFormulaOptions() {
  return [
    { value: 'epley', label: 'Epley (1 + reps/30)' },
    { value: 'brzycki', label: 'Brzycki (36/(37-reps))' },
    { value: 'lombardi', label: 'Lombardi (reps^0.1)' },
    { value: 'oconner', label: "O'Conner (1 + reps/40)" },
  ];
}

/**
 * Get common movement options for account setup
 */
export function getMovementOptions() {
  return [
    { value: 'bench_press', label: 'Bench Press' },
    { value: 'back_squat', label: 'Back Squat' },
    { value: 'deadlift', label: 'Deadlift' },
    { value: 'overhead_press', label: 'Overhead Press' },
    { value: 'pull_up', label: 'Pull Up' },
    { value: 'barbell_row', label: 'Barbell Row' },
  ];
}
