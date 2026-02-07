// =============================================================================
// FITSITE GONGA - METRIC CALCULATION ENGINE
// Production-grade fitness calculations and analysis
// =============================================================================

// -----------------------------------------------------------------------------
// ONE REP MAX FORMULAS
// -----------------------------------------------------------------------------

export interface OneRepMaxResult {
  estimated1RM: number
  formula: string
  confidence: 'high' | 'medium' | 'low'
}

export interface ComprehensiveOneRepMaxResult {
  weight: number
  reps: number
  results: OneRepMaxResult[]
  average: number
  recommended: number
  percentages: Record<number, number>
}

export function epleyFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export function brzyckiFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  if (reps >= 37) return weight * 10
  return Math.round(weight * (36 / (37 - reps)))
}

export function landerFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  const divisor = 101.3 - 2.67123 * reps
  if (divisor <= 0) return weight * 10
  return Math.round((100 * weight) / divisor)
}

export function lombardiFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * Math.pow(reps, 0.10))
}

export function mayhewFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  const divisor = 52.2 + 41.9 * Math.exp(-0.055 * reps)
  return Math.round((100 * weight) / divisor)
}

export function oconnerFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 40))
}

export function wathanFormula(weight: number, reps: number): number {
  if (reps === 1) return weight
  const divisor = 48.8 + 53.8 * Math.exp(-0.075 * reps)
  return Math.round((100 * weight) / divisor)
}

export function calculateOneRepMax(weight: number, reps: number): ComprehensiveOneRepMaxResult {
  if (weight <= 0 || reps <= 0) {
    return { weight: 0, reps: 0, results: [], average: 0, recommended: 0, percentages: {} }
  }

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
  const recommended = reps <= 6 
    ? results.find(r => r.formula === 'Brzycki')!.estimated1RM
    : results.find(r => r.formula === 'Epley')!.estimated1RM

  const percentages: Record<number, number> = {}
  for (let pct = 50; pct <= 100; pct += 5) {
    percentages[pct] = Math.round(recommended * (pct / 100))
  }

  return { weight, reps, results, average, recommended, percentages }
}

// -----------------------------------------------------------------------------
// REP PERCENTAGE CHART
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
  { reps: 12, percentOf1RM: 70, trainingFocus: 'Hypertrophy / Endurance' },
  { reps: 15, percentOf1RM: 65, trainingFocus: 'Muscular Endurance' },
  { reps: 20, percentOf1RM: 60, trainingFocus: 'Muscular Endurance' },
]

export function getWeightForReps(oneRepMax: number, targetReps: number): number {
  const row = REP_PERCENTAGE_CHART.find(r => r.reps === targetReps)
  if (row) return Math.round(oneRepMax * (row.percentOf1RM / 100))
  const estimatedPercent = 100 - (targetReps * 2.5)
  return Math.round(oneRepMax * Math.max(estimatedPercent, 50) / 100)
}

// -----------------------------------------------------------------------------
// VOLUME CALCULATIONS
// -----------------------------------------------------------------------------

export interface SetData {
  weight: number
  reps: number
  rpe?: number
}

export interface VolumeMetrics {
  totalVolume: number
  totalReps: number
  totalSets: number
  averageWeight: number
  maxWeight: number
  effectiveVolume: number
  e1RMAverage: number
}

export function calculateVolumeMetrics(sets: SetData[], oneRepMax?: number): VolumeMetrics {
  if (sets.length === 0) {
    return { totalVolume: 0, totalReps: 0, totalSets: 0, averageWeight: 0, maxWeight: 0, effectiveVolume: 0, e1RMAverage: 0 }
  }

  const totalVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
  const totalReps = sets.reduce((sum, set) => sum + set.reps, 0)
  const totalSets = sets.length
  const averageWeight = Math.round(totalVolume / totalReps)
  const maxWeight = Math.max(...sets.map(s => s.weight))

  const effectiveVolume = sets.reduce((sum, set) => {
    const rpeMultiplier = set.rpe ? (set.rpe / 10) : 0.8
    return sum + (set.weight * set.reps * rpeMultiplier)
  }, 0)

  const e1RMs = sets.map(s => calculateOneRepMax(s.weight, s.reps).recommended)
  const e1RMAverage = Math.round(e1RMs.reduce((a, b) => a + b, 0) / e1RMs.length)

  return {
    totalVolume: Math.round(totalVolume),
    totalReps,
    totalSets,
    averageWeight,
    maxWeight,
    effectiveVolume: Math.round(effectiveVolume),
    e1RMAverage
  }
}

// -----------------------------------------------------------------------------
// STRENGTH STANDARDS
// -----------------------------------------------------------------------------

export type StrengthLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite'

export interface StrengthStandard {
  exercise: string
  beginner: number
  novice: number
  intermediate: number
  advanced: number
  elite: number
}

export const STRENGTH_STANDARDS_MALE: StrengthStandard[] = [
  { exercise: 'barbell-back-squat', beginner: 0.75, novice: 1.25, intermediate: 1.5, advanced: 2.0, elite: 2.5 },
  { exercise: 'conventional-deadlift', beginner: 1.0, novice: 1.5, intermediate: 1.75, advanced: 2.25, elite: 3.0 },
  { exercise: 'barbell-bench-press', beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
  { exercise: 'overhead-press', beginner: 0.35, novice: 0.55, intermediate: 0.75, advanced: 1.0, elite: 1.35 },
  { exercise: 'barbell-row', beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.25, elite: 1.5 },
]

export const STRENGTH_STANDARDS_FEMALE: StrengthStandard[] = [
  { exercise: 'barbell-back-squat', beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.5, elite: 2.0 },
  { exercise: 'conventional-deadlift', beginner: 0.5, novice: 1.0, intermediate: 1.25, advanced: 1.75, elite: 2.25 },
  { exercise: 'barbell-bench-press', beginner: 0.25, novice: 0.5, intermediate: 0.75, advanced: 1.0, elite: 1.25 },
  { exercise: 'overhead-press', beginner: 0.2, novice: 0.35, intermediate: 0.5, advanced: 0.65, elite: 0.85 },
  { exercise: 'barbell-row', beginner: 0.3, novice: 0.5, intermediate: 0.65, advanced: 0.85, elite: 1.1 },
]

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
    level = 'elite'; nextLevel = null; percentile = 99
  } else if (ratio >= standard.advanced) {
    level = 'advanced'; nextLevel = 'elite'
    percentile = 90 + ((ratio - standard.advanced) / (standard.elite - standard.advanced)) * 9
  } else if (ratio >= standard.intermediate) {
    level = 'intermediate'; nextLevel = 'advanced'
    percentile = 70 + ((ratio - standard.intermediate) / (standard.advanced - standard.intermediate)) * 20
  } else if (ratio >= standard.novice) {
    level = 'novice'; nextLevel = 'intermediate'
    percentile = 40 + ((ratio - standard.novice) / (standard.intermediate - standard.novice)) * 30
  } else if (ratio >= standard.beginner) {
    level = 'beginner'; nextLevel = 'novice'
    percentile = 10 + ((ratio - standard.beginner) / (standard.novice - standard.beginner)) * 30
  }

  const weightNeeded = nextLevel ? Math.round(bodyWeight * standard[nextLevel] - oneRepMax) : 0

  return { level, percentile: Math.round(percentile), nextLevel, weightNeeded: Math.max(0, weightNeeded) }
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

export function calculatePlates(
  targetWeight: number,
  barWeight: number = 45,
  unit: 'lbs' | 'kg' = 'lbs'
): PlateBreakdown {
  const availablePlates = unit === 'lbs' ? STANDARD_PLATES_LBS : STANDARD_PLATES_KG
  const perSide = (targetWeight - barWeight) / 2
  
  if (perSide < 0) {
    return { totalWeight: barWeight, barWeight, perSide: 0, plates: [], isPossible: false }
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

  return { totalWeight: targetWeight, barWeight, perSide, plates, isPossible: remaining === 0 }
}

// -----------------------------------------------------------------------------
// EXPORT
// -----------------------------------------------------------------------------

export const MetricEngine = {
  calculateOneRepMax,
  epleyFormula,
  brzyckiFormula,
  getWeightForReps,
  calculateVolumeMetrics,
  getStrengthLevel,
  calculatePlates,
  REP_PERCENTAGE_CHART,
  STRENGTH_STANDARDS_MALE,
  STRENGTH_STANDARDS_FEMALE,
}

export default MetricEngine
