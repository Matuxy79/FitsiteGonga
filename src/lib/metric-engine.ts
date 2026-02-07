// =============================================================================
// FITSITE GONGA - METRIC CALCULATION ENGINE
// Production-grade fitness calculations and analysis
// =============================================================================

// -----------------------------------------------------------------------------
// ONE REP MAX FORMULAS
// Multiple formulas for cross-validation and accuracy
// -----------------------------------------------------------------------------

export interface OneRepMaxResult {
  estimated1RM: number
  formula: string
  confidence: 'high' | 'medium' | 'low'  // Based on rep range validity
}

export interface ComprehensiveOneRepMaxResult {
  weight: number
  reps: number
  results: OneRepMaxResult[]
  average: number
  recommended: number  // Most accurate for given rep range
  percentages: Record<number, number>  // 1RM percentages for training
}

/**
 * Epley Formula (most common)
 * Accurate for 1-10 reps
 * 1RM = weight × (1 + reps/30)
 */
export function epleyFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

/**
 * Brzycki Formula
 * Accurate for 1-12 reps
 * 1RM = weight × (36 / (37 - reps))
 */
export function brzyckiFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  if (reps >= 37) return weight * 10  // Cap for safety
  return Math.round(weight * (36 / (37 - reps)))
}

/**
 * Lander Formula
 * 1RM = (100 × weight) / (101.3 - 2.67123 × reps)
 */
export function landerFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  const divisor = 101.3 - 2.67123 * reps
  if (divisor <= 0) return weight * 10
  return Math.round((100 * weight) / divisor)
}

/**
 * Lombardi Formula
 * 1RM = weight × reps^0.10
 */
export function lombardiFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * Math.pow(reps, 0.10))
}

/**
 * Mayhew Formula
 * 1RM = (100 × weight) / (52.2 + 41.9 × e^(-0.055 × reps))
 */
export function mayhewFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  const divisor = 52.2 + 41.9 * Math.exp(-0.055 * reps)
  return Math.round((100 * weight) / divisor)
}

/**
 * O'Conner Formula
 * 1RM = weight × (1 + reps/40)
 */
export function oconnerFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 40))
}

/**
 * Wathan Formula
 * 1RM = (100 × weight) / (48.8 + 53.8 × e^(-0.075 × reps))
 */
export function wathanFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  const divisor = 48.8 + 53.8 * Math.exp(-0.075 * reps)
  return Math.round((100 * weight) / divisor)
}

/**
 * Calculate comprehensive 1RM using all formulas
 */
export function calculateOneRepMax(weight: number, reps: number): ComprehensiveOneRepMaxResult {
  if (weight <= 0 || reps <= 0) {
    return {
      weight: 0,
      reps: 0,
      results: [],
      average: 0,
      recommended: 0,
      percentages: {}
    }
  }

  // Determine confidence based on rep range
  const getConfidence = (reps: number): 'high' | 'medium' | 'low' => {
    if (reps <= 6) return 'high'
    if (reps <= 10) return 'medium'
    return 'low'
  }

  const results: OneRepMaxResult[] = [
    { estimated1RM: epleyFormula(weight, reps), formula: 'Epley', confidence: getConfidence(reps) },
    { estimated1RM: brzyckiFormula(weight, reps), formula: 'Brzycki', confidence: getConfidence(reps) },
    { estimated1RM: landerFormula(weight, reps), formula: 'Lander', confidence: getConfidence(reps) },
    { estimated1RM: lombardiFormula(weight, reps), formula: 'Lombardi', confidence: getConfidence(reps) },
    { estimated1RM: mayhewFormula(weight, reps), formula: 'Mayhew', confidence: getConfidence(reps) },
    { estimated1RM: oconnerFormula(weight, reps), formula: 'OConner', confidence: getConfidence(reps) },
    { estimated1RM: wathanFormula(weight, reps), formula: 'Wathan', confidence: getConfidence(reps) },
  ]

  const values = results.map(r => r.estimated1RM)
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length)

  // For most scenarios, Epley and Brzycki are considered most accurate
  // Use Brzycki for lower reps, Epley for higher
  const recommended = reps <= 6 
    ? results.find(r => r.formula === 'Brzycki')!.estimated1RM
    : results.find(r => r.formula === 'Epley')!.estimated1RM

  // Generate training percentages
  const percentages: Record<number, number> = {}
  for (let pct = 50; pct <= 100; pct += 5) {
    percentages[pct] = Math.round(recommended * (pct / 100))
  }

  return {
    weight,
    reps,
    results,
    average,
    recommended,
    percentages
  }
}

// -----------------------------------------------------------------------------
// REP RANGE & PERCENTAGE CHARTS
// -----------------------------------------------------------------------------

export interface RepPercentageRow {
  reps: number
  percentOf1RM: number
  trainingFocus: string
}

export const REP_PERCENTAGE_CHART: RepPercentageRow[] = [
  { reps: 1, percentOf1RM: 100, trainingFocus: 'Max Strength / Testing' },
  { reps: 2, percentOf1RM: 95, trainingFocus: 'Max Strength' },
  { reps: 3, percentOf1RM: 93, trainingFocus: 'Strength' },
  { reps: 4, percentOf1RM: 90, trainingFocus: 'Strength' },
  { reps: 5, percentOf1RM: 87, trainingFocus: 'Strength' },
  { reps: 6, percentOf1RM: 85, trainingFocus: 'Strength / Hypertrophy' },
  { reps: 7, percentOf1RM: 83, trainingFocus: 'Strength / Hypertrophy' },
  { reps: 8, percentOf1RM: 80, trainingFocus: 'Hypertrophy' },
  { reps: 9, percentOf1RM: 77, trainingFocus: 'Hypertrophy' },
  { reps: 10, percentOf1RM: 75, trainingFocus: 'Hypertrophy' },
  { reps: 11, percentOf1RM: 72, trainingFocus: 'Hypertrophy / Endurance' },
  { reps: 12, percentOf1RM: 70, trainingFocus: 'Hypertrophy / Endurance' },
  { reps: 15, percentOf1RM: 65, trainingFocus: 'Muscular Endurance' },
  { reps: 20, percentOf1RM: 60, trainingFocus: 'Muscular Endurance' },
  { reps: 25, percentOf1RM: 55, trainingFocus: 'Endurance' },
]

/**
 * Get weight for target reps based on 1RM
 */
export function getWeightForReps(oneRepMax: number, targetReps: number): number {
  const row = REP_PERCENTAGE_CHART.find(r => r.reps === targetReps)
  if (row) {
    return Math.round(oneRepMax * (row.percentOf1RM / 100))
  }
  // Interpolate for non-standard rep ranges
  const estimatedPercent = 100 - (targetReps * 2.5)
  return Math.round(oneRepMax * Math.max(estimatedPercent, 50) / 100)
}

/**
 * Get estimated reps for a given weight and 1RM
 */
export function getEstimatedReps(oneRepMax: number, weight: number): number {
  const percentage = (weight / oneRepMax) * 100
  for (let i = 0; i < REP_PERCENTAGE_CHART.length; i++) {
    if (percentage >= REP_PERCENTAGE_CHART[i].percentOf1RM) {
      return REP_PERCENTAGE_CHART[i].reps
    }
  }
  return 25 // Max reps for very light weight
}

// -----------------------------------------------------------------------------
// VOLUME CALCULATIONS
// -----------------------------------------------------------------------------

export interface SetData {
  weight: number
  reps: number
  rpe?: number  // Rate of Perceived Exertion (1-10)
}

export interface VolumeMetrics {
  totalVolume: number          // weight × reps summed
  totalReps: number
  totalSets: number
  averageWeight: number
  maxWeight: number
  effectiveVolume: number      // RPE-adjusted volume
  volumeLoad: number           // sets × reps × weight
  relativeIntensity: number    // % of 1RM average
  e1RMAverage: number          // Average estimated 1RM across sets
}

/**
 * Calculate comprehensive volume metrics from a workout
 */
export function calculateVolumeMetrics(sets: SetData[], oneRepMax?: number): VolumeMetrics {
  if (sets.length === 0) {
    return {
      totalVolume: 0,
      totalReps: 0,
      totalSets: 0,
      averageWeight: 0,
      maxWeight: 0,
      effectiveVolume: 0,
      volumeLoad: 0,
      relativeIntensity: 0,
      e1RMAverage: 0
    }
  }

  const totalVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
  const totalReps = sets.reduce((sum, set) => sum + set.reps, 0)
  const totalSets = sets.length
  const averageWeight = Math.round(totalVolume / totalReps)
  const maxWeight = Math.max(...sets.map(s => s.weight))

  // RPE-adjusted volume (if RPE is provided)
  // Higher RPE = more effective volume
  const effectiveVolume = sets.reduce((sum, set) => {
    const rpeMultiplier = set.rpe ? (set.rpe / 10) : 0.8  // Default to RPE 8 if not provided
    return sum + (set.weight * set.reps * rpeMultiplier)
  }, 0)

  // Volume Load (traditional)
  const volumeLoad = totalVolume

  // Relative intensity (if 1RM provided)
  const relativeIntensity = oneRepMax 
    ? Math.round((averageWeight / oneRepMax) * 100) 
    : 0

  // Average e1RM across all sets
  const e1RMs = sets.map(s => calculateOneRepMax(s.weight, s.reps).recommended)
  const e1RMAverage = Math.round(e1RMs.reduce((a, b) => a + b, 0) / e1RMs.length)

  return {
    totalVolume: Math.round(totalVolume),
    totalReps,
    totalSets,
    averageWeight,
    maxWeight,
    effectiveVolume: Math.round(effectiveVolume),
    volumeLoad: Math.round(volumeLoad),
    relativeIntensity,
    e1RMAverage
  }
}

// -----------------------------------------------------------------------------
// STRENGTH STANDARDS (Relative to Body Weight)
// -----------------------------------------------------------------------------

export type StrengthLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite'

export interface StrengthStandard {
  exercise: string
  beginner: number    // Multiplier of bodyweight
  novice: number
  intermediate: number
  advanced: number
  elite: number
}

// Standards as multipliers of body weight (for male lifters)
// Female standards are typically 60-70% of these values
export const STRENGTH_STANDARDS_MALE: StrengthStandard[] = [
  { exercise: 'barbell-back-squat', beginner: 0.75, novice: 1.25, intermediate: 1.5, advanced: 2.0, elite: 2.5 },
  { exercise: 'conventional-deadlift', beginner: 1.0, novice: 1.5, intermediate: 1.75, advanced: 2.25, elite: 3.0 },
  { exercise: 'barbell-bench-press', beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
  { exercise: 'overhead-press', beginner: 0.35, novice: 0.55, intermediate: 0.75, advanced: 1.0, elite: 1.35 },
  { exercise: 'barbell-row', beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.25, elite: 1.5 },
  { exercise: 'pull-up', beginner: 0, novice: 0.1, intermediate: 0.25, advanced: 0.5, elite: 0.75 },  // Added weight
  { exercise: 'dip-chest', beginner: 0, novice: 0.1, intermediate: 0.3, advanced: 0.5, elite: 0.75 },  // Added weight
  { exercise: 'barbell-curl', beginner: 0.2, novice: 0.35, intermediate: 0.5, advanced: 0.65, elite: 0.85 },
  { exercise: 'hip-thrust', beginner: 0.75, novice: 1.25, intermediate: 1.75, advanced: 2.25, elite: 3.0 },
  { exercise: 'romanian-deadlift', beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
]

export const STRENGTH_STANDARDS_FEMALE: StrengthStandard[] = [
  { exercise: 'barbell-back-squat', beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
  { exercise: 'conventional-deadlift', beginner: 0.5, novice: 1.0, intermediate: 1.25, advanced: 1.75, elite: 2.25 },
  { exercise: 'barbell-bench-press', beginner: 0.25, novice: 0.5, intermediate: 0.75, advanced: 1.0, elite: 1.25 },
  { exercise: 'overhead-press', beginner: 0.2, novice: 0.35, intermediate: 0.5, advanced: 0.65, elite: 0.85 },
  { exercise: 'barbell-row', beginner: 0.3, novice: 0.5, intermediate: 0.65, advanced: 0.85, elite: 1.1 },
  { exercise: 'pull-up', beginner: 0, novice: 0, intermediate: 0.1, advanced: 0.25, elite: 0.5 },
  { exercise: 'dip-chest', beginner: 0, novice: 0, intermediate: 0.15, advanced: 0.3, elite: 0.5 },
  { exercise: 'barbell-curl', beginner: 0.1, novice: 0.2, intermediate: 0.35, advanced: 0.45, elite: 0.6 },
  { exercise: 'hip-thrust', beginner: 0.5, novice: 1.0, intermediate: 1.5, advanced: 2.0, elite: 2.5 },
  { exercise: 'romanian-deadlift', beginner: 0.35, novice: 0.6, intermediate: 0.85, advanced: 1.15, elite: 1.5 },
]

/**
 * Determine strength level based on lift and body weight
 */
export function getStrengthLevel(
  exerciseId: string,
  oneRepMax: number,
  bodyWeight: number,
  gender: 'male' | 'female'
): { level: StrengthLevel; percentile: number; nextLevel: StrengthLevel | null; weightNeeded: number } {
  const standards = gender === 'male' ? STRENGTH_STANDARDS_MALE : STRENGTH_STANDARDS_FEMALE
  const standard = standards.find(s => s.exercise === exerciseId)
  
  if (!standard) {
    return { level: 'beginner', percentile: 0, nextLevel: 'novice', weightNeeded: 0 }
  }

  const ratio = oneRepMax / bodyWeight
  
  let level: StrengthLevel = 'beginner'
  let nextLevel: StrengthLevel | null = 'novice'
  let percentile = 0

  if (ratio >= standard.elite) {
    level = 'elite'
    nextLevel = null
    percentile = 99
  } else if (ratio >= standard.advanced) {
    level = 'advanced'
    nextLevel = 'elite'
    percentile = 90 + ((ratio - standard.advanced) / (standard.elite - standard.advanced)) * 9
  } else if (ratio >= standard.intermediate) {
    level = 'intermediate'
    nextLevel = 'advanced'
    percentile = 70 + ((ratio - standard.intermediate) / (standard.advanced - standard.intermediate)) * 20
  } else if (ratio >= standard.novice) {
    level = 'novice'
    nextLevel = 'intermediate'
    percentile = 40 + ((ratio - standard.novice) / (standard.intermediate - standard.novice)) * 30
  } else if (ratio >= standard.beginner) {
    level = 'beginner'
    nextLevel = 'novice'
    percentile = 10 + ((ratio - standard.beginner) / (standard.novice - standard.beginner)) * 30
  } else {
    percentile = (ratio / standard.beginner) * 10
  }

  // Calculate weight needed for next level
  const weightNeeded = nextLevel 
    ? Math.round(bodyWeight * standard[nextLevel] - oneRepMax)
    : 0

  return { 
    level, 
    percentile: Math.round(percentile), 
    nextLevel, 
    weightNeeded: Math.max(0, weightNeeded)
  }
}

// -----------------------------------------------------------------------------
// BODY COMPOSITION METRICS
// -----------------------------------------------------------------------------

/**
 * BMI Calculator
 */
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  
  let category: string
  if (bmi < 18.5) category = 'Underweight'
  else if (bmi < 25) category = 'Normal'
  else if (bmi < 30) category = 'Overweight'
  else category = 'Obese'

  return { bmi: Math.round(bmi * 10) / 10, category }
}

/**
 * TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor
 */
export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): { bmr: number; tdee: number; maintenance: number } {
  // Mifflin-St Jeor Equation
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }

  const tdee = bmr * activityMultipliers[activityLevel]

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    maintenance: Math.round(tdee)
  }
}

/**
 * Body Fat Percentage Estimation (Navy Method)
 */
export function estimateBodyFat(
  gender: 'male' | 'female',
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipsCm?: number  // Required for females
): number {
  if (gender === 'male') {
    // Male formula: 495 / (1.0324 - 0.19077 × log10(waist - neck) + 0.15456 × log10(height)) - 450
    const bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450
    return Math.round(bf * 10) / 10
  } else {
    // Female formula requires hips
    if (!hipsCm) return 0
    const bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450
    return Math.round(bf * 10) / 10
  }
}

/**
 * Wilks Score (Powerlifting comparison across weight classes)
 */
export function calculateWilks(
  totalKg: number,  // Squat + Bench + Deadlift
  bodyweightKg: number,
  gender: 'male' | 'female'
): number {
  // Wilks coefficients
  const maleCoef = {
    a: -216.0475144,
    b: 16.2606339,
    c: -0.002388645,
    d: -0.00113732,
    e: 7.01863e-6,
    f: -1.291e-8
  }
  
  const femaleCoef = {
    a: 594.31747775582,
    b: -27.23842536447,
    c: 0.82112226871,
    d: -0.00930733913,
    e: 4.731582e-5,
    f: -9.054e-8
  }

  const coef = gender === 'male' ? maleCoef : femaleCoef
  const x = bodyweightKg

  const denominator = coef.a + 
    coef.b * x + 
    coef.c * Math.pow(x, 2) + 
    coef.d * Math.pow(x, 3) + 
    coef.e * Math.pow(x, 4) + 
    coef.f * Math.pow(x, 5)

  const wilks = (500 / denominator) * totalKg
  return Math.round(wilks * 100) / 100
}

// -----------------------------------------------------------------------------
// PROGRESSION CALCULATIONS
// -----------------------------------------------------------------------------

export interface ProgressionRecommendation {
  currentWeight: number
  currentReps: number
  nextWeight: number
  nextReps: number
  progressionType: 'weight' | 'reps' | 'both' | 'maintain' | 'deload'
  reason: string
}

/**
 * Recommend next workout progression
 */
export function recommendProgression(
  targetReps: number,
  recentSets: SetData[],
  weightIncrement: number = 5
): ProgressionRecommendation {
  if (recentSets.length === 0) {
    return {
      currentWeight: 0,
      currentReps: 0,
      nextWeight: 0,
      nextReps: targetReps,
      progressionType: 'maintain',
      reason: 'No previous data'
    }
  }

  const lastSet = recentSets[recentSets.length - 1]
  const avgReps = Math.round(recentSets.reduce((sum, s) => sum + s.reps, 0) / recentSets.length)
  const avgRPE = recentSets.reduce((sum, s) => sum + (s.rpe || 7), 0) / recentSets.length

  // If hitting target reps easily (low RPE), increase weight
  if (avgReps >= targetReps && avgRPE < 7) {
    return {
      currentWeight: lastSet.weight,
      currentReps: avgReps,
      nextWeight: lastSet.weight + weightIncrement,
      nextReps: targetReps,
      progressionType: 'weight',
      reason: 'Reps achieved with low effort - increase weight'
    }
  }

  // If hitting target reps with moderate effort, increase weight slightly
  if (avgReps >= targetReps && avgRPE <= 8) {
    return {
      currentWeight: lastSet.weight,
      currentReps: avgReps,
      nextWeight: lastSet.weight + weightIncrement,
      nextReps: targetReps,
      progressionType: 'weight',
      reason: 'Target reps achieved - progress weight'
    }
  }

  // If close to target reps with high effort, maintain and build reps
  if (avgReps >= targetReps - 2 && avgRPE >= 8) {
    return {
      currentWeight: lastSet.weight,
      currentReps: avgReps,
      nextWeight: lastSet.weight,
      nextReps: targetReps,
      progressionType: 'reps',
      reason: 'Close to target - focus on completing all reps before adding weight'
    }
  }

  // If struggling (low reps, high RPE), consider deload
  if (avgReps < targetReps - 3 && avgRPE >= 9) {
    return {
      currentWeight: lastSet.weight,
      currentReps: avgReps,
      nextWeight: Math.round(lastSet.weight * 0.9),
      nextReps: targetReps,
      progressionType: 'deload',
      reason: 'Struggling with current weight - deload 10% and rebuild'
    }
  }

  // Default: maintain current weight
  return {
    currentWeight: lastSet.weight,
    currentReps: avgReps,
    nextWeight: lastSet.weight,
    nextReps: targetReps,
    progressionType: 'maintain',
    reason: 'Maintain current weight and focus on form'
  }
}

// -----------------------------------------------------------------------------
// PLATE CALCULATOR
// -----------------------------------------------------------------------------

export interface PlateBreakdown {
  totalWeight: number
  barWeight: number
  perSide: number
  plates: { weight: number; count: number }[]
  isPossible: boolean
}

const STANDARD_PLATES_LBS = [45, 35, 25, 10, 5, 2.5]
const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25]

/**
 * Calculate plates needed for target weight
 */
export function calculatePlates(
  targetWeight: number,
  barWeight: number = 45,
  unit: 'lbs' | 'kg' = 'lbs'
): PlateBreakdown {
  const availablePlates = unit === 'lbs' ? STANDARD_PLATES_LBS : STANDARD_PLATES_KG
  const perSide = (targetWeight - barWeight) / 2
  
  if (perSide < 0) {
    return {
      totalWeight: barWeight,
      barWeight,
      perSide: 0,
      plates: [],
      isPossible: false
    }
  }

  let remaining = perSide
  const plates: { weight: number; count: number }[] = []

  for (const plateWeight of availablePlates) {
    const count = Math.floor(remaining / plateWeight)
    if (count > 0) {
      plates.push({ weight: plateWeight, count })
      remaining -= count * plateWeight
    }
  }

  // Check if we achieved exact weight
  const isPossible = remaining === 0

  return {
    totalWeight: targetWeight,
    barWeight,
    perSide,
    plates,
    isPossible
  }
}

// -----------------------------------------------------------------------------
// EXPORT ALL
// -----------------------------------------------------------------------------

export const MetricEngine = {
  // 1RM
  calculateOneRepMax,
  epleyFormula,
  brzyckiFormula,
  landerFormula,
  lombardiFormula,
  mayhewFormula,
  oconnerFormula,
  wathanFormula,
  
  // Rep/Weight
  getWeightForReps,
  getEstimatedReps,
  REP_PERCENTAGE_CHART,
  
  // Volume
  calculateVolumeMetrics,
  
  // Standards
  getStrengthLevel,
  STRENGTH_STANDARDS_MALE,
  STRENGTH_STANDARDS_FEMALE,
  
  // Body Composition
  calculateBMI,
  calculateTDEE,
  estimateBodyFat,
  calculateWilks,
  
  // Progression
  recommendProgression,
  
  // Utilities
  calculatePlates
}

export default MetricEngine
