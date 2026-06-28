'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Minus,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Minus as Stable,
  Timer,
  Flame,
  Target,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Trash2,
  Calculator,
  Dumbbell,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  calculateOneRepMax, 
  calculateVolumeMetrics, 
  getWeightForReps,
  getStrengthLevel,
  calculatePlates,
  recommendProgression,
  REP_PERCENTAGE_CHART,
  type SetData,
  type ComprehensiveOneRepMaxResult
} from '@/lib/metric-engine'
import type { Exercise } from '@/lib/exercises'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface ActiveSet {
  id: string
  weight: number
  reps: number
  rpe?: number
  isWarmup: boolean
  isPR: boolean
  timestamp: Date
  restTime?: number
}

export interface LiftSession {
  liftId: string
  exerciseId: string
  exerciseName: string
  sets: ActiveSet[]
  startTime: Date
  endTime?: Date
  notes?: string
}

export interface LiftTrackerProps {
  exercise: Exercise
  userBodyWeight?: number
  userGender?: 'male' | 'female'
  previousBest?: {
    weight: number
    reps: number
    oneRepMax: number
  }
  workingWeight: number
  workingUnit: 'lbs' | 'kg'
  onSaveSession: (session: LiftSession) => Promise<void>
  onClose: () => void
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function LiftTracker({
  exercise,
  userBodyWeight = 180,
  userGender = 'male',
  previousBest,
  workingWeight,
  workingUnit,
  onSaveSession,
  onClose,
}: LiftTrackerProps) {
  // Session state
  const [sets, setSets] = useState<ActiveSet[]>([])
  const [sessionStartTime] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Current set being entered
  const [currentWeight, setCurrentWeight] = useState(workingWeight)
  const [currentReps, setCurrentReps] = useState(0)
  const [currentRPE, setCurrentRPE] = useState<number | null>(null)
  const [isWarmup, setIsWarmup] = useState(false)

  // UI state
  const [showCalculator, setShowCalculator] = useState(false)
  const [showPlateCalc, setShowPlateCalc] = useState(false)
  const [restTimerActive, setRestTimerActive] = useState(false)
  const [restTime, setRestTime] = useState(0)
  const [targetRestTime, setTargetRestTime] = useState(120) // 2 minutes default

  // Weight increment based on unit
  const weightIncrement = workingUnit === 'lbs' ? 5 : 2.5

  // Calculate session metrics
  const sessionMetrics = useMemo(() => {
    const workingSets = sets.filter(s => !s.isWarmup)
    const setData: SetData[] = workingSets.map(s => ({
      weight: s.weight,
      reps: s.reps,
      rpe: s.rpe
    }))
    return calculateVolumeMetrics(setData, previousBest?.oneRepMax)
  }, [sets, previousBest])

  // Calculate current set's estimated 1RM
  const currentE1RM = useMemo(() => {
    if (currentWeight <= 0 || currentReps <= 0) return null
    return calculateOneRepMax(currentWeight, currentReps)
  }, [currentWeight, currentReps])

  // Check for PR
  const isPotentialPR = useMemo(() => {
    if (!previousBest || !currentE1RM) return false
    return currentE1RM.recommended > previousBest.oneRepMax
  }, [currentE1RM, previousBest])

  // Strength level
  const strengthLevel = useMemo(() => {
    if (!exercise.supportsOneRepMax || !previousBest) return null
    return getStrengthLevel(
      exercise.id,
      previousBest.oneRepMax,
      userBodyWeight,
      userGender
    )
  }, [exercise, previousBest, userBodyWeight, userGender])

  // Plate breakdown
  const plateBreakdown = useMemo(() => {
    const barWeight = workingUnit === 'lbs' ? 45 : 20
    return calculatePlates(currentWeight, barWeight, workingUnit)
  }, [currentWeight, workingUnit])

  // Add set to session
  const addSet = useCallback(() => {
    if (currentWeight <= 0 || currentReps <= 0) return

    const newSet: ActiveSet = {
      id: `set-${Date.now()}`,
      weight: currentWeight,
      reps: currentReps,
      rpe: currentRPE || undefined,
      isWarmup,
      isPR: isPotentialPR && !isWarmup,
      timestamp: new Date(),
      restTime: restTime > 0 ? restTime : undefined
    }

    setSets(prev => [...prev, newSet])
    
    // Reset for next set
    setCurrentReps(0)
    setCurrentRPE(null)
    setIsWarmup(false)
    setRestTime(0)
    
    // Start rest timer
    setRestTimerActive(true)
  }, [currentWeight, currentReps, currentRPE, isWarmup, isPotentialPR, restTime])

  // Remove set
  const removeSet = useCallback((setId: string) => {
    setSets(prev => prev.filter(s => s.id !== setId))
  }, [])

  // Save session
  const handleSave = async () => {
    if (sets.length === 0) return
    
    setIsSaving(true)
    try {
      await onSaveSession({
        liftId: exercise.id,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets,
        startTime: sessionStartTime,
        endTime: new Date(),
        notes: notes || undefined
      })
    } catch (error) {
      console.error('Failed to save session:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Rest timer effect would go here in real implementation

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
              {'// ACTIVE_LIFT'}
            </div>
            <h1 className="mt-1 text-xl font-black tracking-[0.2em] uppercase text-slate-100">
              {exercise.name}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                {exercise.primaryMuscles.join(', ')}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                {exercise.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Previous Best & Strength Level */}
        {previousBest && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 bg-black/30 rounded-lg p-3">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Previous Best
              </div>
              <div className="mt-1 text-lg font-bold text-emerald-400">
                {previousBest.weight} × {previousBest.reps}
              </div>
              <div className="text-xs text-slate-500">
                e1RM: {previousBest.oneRepMax} {workingUnit}
              </div>
            </div>
            {strengthLevel && (
              <div className="flex-1 bg-black/30 rounded-lg p-3">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Strength Level
                </div>
                <div className="mt-1 text-lg font-bold capitalize" style={{
                  color: strengthLevel.level === 'elite' ? '#ffd700' :
                         strengthLevel.level === 'advanced' ? '#c0c0c0' :
                         strengthLevel.level === 'intermediate' ? '#cd7f32' :
                         '#94a3b8'
                }}>
                  {strengthLevel.level}
                </div>
                <div className="text-xs text-slate-500">
                  Top {100 - strengthLevel.percentile}%
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* SET INPUT */}
      {/* ================================================================== */}
      <div className="p-4 border-b border-white/5 bg-black/20">
        <div className="grid grid-cols-2 gap-4">
          {/* Weight Input */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Weight ({workingUnit})
            </label>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setCurrentWeight(w => Math.max(0, w - weightIncrement))}
                className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-slate-300" />
              </button>
              <input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="flex-1 h-12 bg-zinc-900 border border-white/10 rounded-lg text-center text-xl font-bold text-slate-100 focus:border-emerald-500/50 focus:outline-none"
              />
              <button
                onClick={() => setCurrentWeight(w => w + weightIncrement)}
                className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-300" />
              </button>
            </div>
            
            {/* Plate Calculator Toggle */}
            <button
              onClick={() => setShowPlateCalc(!showPlateCalc)}
              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Calculator className="w-3 h-3" />
              Plates: {plateBreakdown.plates.map(p => `${p.count}×${p.weight}`).join(' + ') || 'Bar only'}
            </button>
          </div>

          {/* Reps Input */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Reps
            </label>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setCurrentReps(r => Math.max(0, r - 1))}
                className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-slate-300" />
              </button>
              <input
                type="number"
                value={currentReps}
                onChange={(e) => setCurrentReps(Number(e.target.value))}
                className="flex-1 h-12 bg-zinc-900 border border-white/10 rounded-lg text-center text-xl font-bold text-slate-100 focus:border-emerald-500/50 focus:outline-none"
              />
              <button
                onClick={() => setCurrentReps(r => r + 1)}
                className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* RPE Selector */}
        <div className="mt-4">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            RPE (Rate of Perceived Exertion)
          </label>
          <div className="mt-2 flex items-center gap-1">
            {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((rpe) => (
              <button
                key={rpe}
                onClick={() => setCurrentRPE(currentRPE === rpe ? null : rpe)}
                className={cn(
                  'flex-1 h-8 rounded text-xs font-mono transition-colors',
                  currentRPE === rpe
                    ? rpe >= 9 ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                    : rpe >= 8 ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50'
                    : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700 border border-transparent'
                )}
              >
                {rpe}
              </button>
            ))}
          </div>
        </div>

        {/* Set Type & Actions */}
        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isWarmup}
              onChange={(e) => setIsWarmup(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/50"
            />
            <span className="text-sm text-slate-400">Warmup Set</span>
          </label>

          <div className="flex items-center gap-2">
            {/* PR Indicator */}
            {isPotentialPR && !isWarmup && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400">NEW PR!</span>
              </div>
            )}
            
            {/* Add Set Button */}
            <button
              onClick={addSet}
              disabled={currentWeight <= 0 || currentReps <= 0}
              className={cn(
                'px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all',
                currentWeight > 0 && currentReps > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              )}
            >
              <Check className="w-4 h-4" />
              LOG SET
            </button>
          </div>
        </div>

        {/* Estimated 1RM Preview */}
        {currentE1RM && currentWeight > 0 && currentReps > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-emerald-500/10 rounded-lg border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Estimated 1RM
                </div>
                <div className="text-2xl font-black text-purple-400">
                  {currentE1RM.recommended} <span className="text-sm font-normal text-slate-500">{workingUnit}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Volume
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {currentWeight * currentReps} <span className="text-xs font-normal text-slate-500">{workingUnit}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* SESSION SETS */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
            SESSION SETS ({sets.length})
          </div>
          {sets.length > 0 && (
            <button
              onClick={() => setSets([])}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {sets.length === 0 ? (
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <div className="text-sm text-slate-500">No sets logged yet</div>
            <div className="text-xs text-slate-600 mt-1">Enter weight and reps above to begin</div>
          </div>
        ) : (
          <div className="space-y-2">
            {sets.map((set, index) => {
              const setE1RM = calculateOneRepMax(set.weight, set.reps)
              return (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    set.isWarmup 
                      ? 'bg-zinc-900/50 border-zinc-800' 
                      : set.isPR
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-zinc-900 border-white/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                        set.isWarmup ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500/20 text-emerald-400'
                      )}>
                        {set.isWarmup ? 'W' : index + 1 - sets.filter((s, i) => i < index && s.isWarmup).length}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-100">
                            {set.weight} × {set.reps}
                          </span>
                          {set.isPR && (
                            <span className="px-1.5 py-0.5 bg-yellow-500/30 text-yellow-400 text-[10px] font-bold rounded">
                              PR
                            </span>
                          )}
                          {set.isWarmup && (
                            <span className="px-1.5 py-0.5 bg-zinc-700 text-zinc-400 text-[10px] font-bold rounded">
                              WARMUP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {set.rpe && <span>RPE {set.rpe}</span>}
                          {!set.isWarmup && <span>e1RM: {setE1RM.recommended}</span>}
                          <span>Vol: {set.weight * set.reps}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSet(set.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* SESSION SUMMARY */}
      {/* ================================================================== */}
      {sets.filter(s => !s.isWarmup).length > 0 && (
        <div className="p-4 border-t border-white/5 bg-black/30">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-3">
            SESSION SUMMARY
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-zinc-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-emerald-400">
                {sessionMetrics.totalSets}
              </div>
              <div className="text-[10px] text-slate-500 uppercase">Working Sets</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-purple-400">
                {sessionMetrics.totalReps}
              </div>
              <div className="text-[10px] text-slate-500 uppercase">Total Reps</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-cyan-400">
                {(sessionMetrics.totalVolume / 1000).toFixed(1)}k
              </div>
              <div className="text-[10px] text-slate-500 uppercase">Volume ({workingUnit})</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-yellow-400">
                {sessionMetrics.e1RMAverage}
              </div>
              <div className="text-[10px] text-slate-500 uppercase">Avg e1RM</div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session notes (optional)..."
              className="w-full h-20 bg-zinc-900 border border-white/10 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || sets.length === 0}
            className={cn(
              'mt-4 w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all',
              sets.length > 0
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                SAVING...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                SAVE SESSION
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default LiftTracker
