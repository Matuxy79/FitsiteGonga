'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Trophy,
  Plus,
  ChevronRight,
  Info,
  Flame,
  Zap,
  Calculator,
  History,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  calculateOneRepMax, 
  calculateVolumeMetrics,
  getStrengthLevel,
  recommendProgression,
  calculatePlates,
  REP_PERCENTAGE_CHART,
  type SetData,
  type ComprehensiveOneRepMaxResult,
  type ProgressionRecommendation,
} from '@/lib/metric-engine'
import { EXERCISE_MAP, searchExercises, type Exercise } from '@/lib/exercises'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface TrackedLift {
  id: string
  exerciseId: string
  exerciseName: string
  workingWeight: number
  workingUnit: 'lbs' | 'kg'
  oneRepMax: number | null
  goalWeight: number | null
  goalDate: string | null
  trend: 'up' | 'down' | 'stable'
  lastSet: string | null  // e.g., "225x5"
  totalSets: number
  lastWorkoutDate: string | null
  personalRecord: number | null  // Best e1RM ever
  recentSets: SetData[]
}

export interface SetLogEntry {
  id: string
  liftId: string
  weight: number
  reps: number
  unit: 'lbs' | 'kg'
  rpe?: number
  tempo?: string
  isWarmup: boolean
  isPR: boolean
  notes?: string
  loggedAt: string
  estimated1RM: number
}

interface ActiveLiftTrackerProps {
  lifts: TrackedLift[]
  selectedLiftId: string | null
  userBodyweight: number
  userGender: 'male' | 'female'
  onSelectLift: (liftId: string) => void
  onAddLift: () => void
  onLogSet: (liftId: string, setData: Omit<SetLogEntry, 'id' | 'loggedAt' | 'estimated1RM' | 'isPR'>) => void
  onUpdateGoal: (liftId: string, goalWeight: number, goalDate?: string) => void
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function ActiveLiftTracker({
  lifts,
  selectedLiftId,
  userBodyweight,
  userGender,
  onSelectLift,
  onAddLift,
  onLogSet,
  onUpdateGoal,
}: ActiveLiftTrackerProps) {
  const [showCalculator, setShowCalculator] = useState(false)
  const [calcWeight, setCalcWeight] = useState('')
  const [calcReps, setCalcReps] = useState('')

  const selectedLift = useMemo(() => 
    lifts.find(l => l.id === selectedLiftId) || null
  , [lifts, selectedLiftId])

  const exercise = useMemo(() => 
    selectedLift ? EXERCISE_MAP.get(selectedLift.exerciseId) : null
  , [selectedLift])

  // Calculate metrics for selected lift
  const metrics = useMemo(() => {
    if (!selectedLift) return null

    const oneRM = selectedLift.oneRepMax || 0
    const volumeMetrics = calculateVolumeMetrics(selectedLift.recentSets, oneRM)
    const progression = recommendProgression(8, selectedLift.recentSets)
    const strengthLevel = exercise?.supportsOneRepMax && oneRM > 0
      ? getStrengthLevel(selectedLift.exerciseId, oneRM, userBodyweight, userGender)
      : null
    const plates = oneRM > 0 
      ? calculatePlates(oneRM, 45, selectedLift.workingUnit)
      : null

    return { volumeMetrics, progression, strengthLevel, plates }
  }, [selectedLift, exercise, userBodyweight, userGender])

  // Calculator result
  const calcResult = useMemo(() => {
    const w = parseFloat(calcWeight)
    const r = parseInt(calcReps)
    if (w > 0 && r > 0 && r <= 30) {
      return calculateOneRepMax(w, r)
    }
    return null
  }, [calcWeight, calcReps])

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="shrink-0 p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
              {'// THE FORGE'}
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-100 tracking-wide">
              Active Lift Tracker
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                showCalculator 
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'border-white/10 text-slate-400 hover:bg-white/5'
              )}
              title="1RM Calculator"
            >
              <Calculator className="w-4 h-4" />
            </button>
            <button
              onClick={onAddLift}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lift
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 1RM CALCULATOR (Collapsible) */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="p-4 bg-purple-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">
                  One Rep Max Calculator
                </span>
              </div>
              
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Weight
                  </label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    placeholder="225"
                    className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Reps
                  </label>
                  <input
                    type="number"
                    value={calcReps}
                    onChange={(e) => setCalcReps(e.target.value)}
                    placeholder="5"
                    min="1"
                    max="30"
                    className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
              </div>

              {calcResult && (
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold text-purple-400">
                      {calcResult.recommended} lbs
                    </div>
                    <div className="text-xs text-slate-500">Estimated 1RM</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[90, 80, 70].map(pct => (
                      <div key={pct} className="bg-black/30 rounded p-2">
                        <div className="text-slate-200 font-mono">
                          {calcResult.percentages[pct]} lbs
                        </div>
                        <div className="text-slate-500">{pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* LIFT LIST */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-y-auto">
        {lifts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-emerald-500/50" />
            </div>
            <h3 className="text-slate-200 font-medium mb-1">No Lifts Tracked</h3>
            <p className="text-sm text-slate-500 mb-4">
              Add exercises to track your progress and see detailed metrics
            </p>
            <button
              onClick={onAddLift}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Lift
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {lifts.map((lift) => (
              <LiftCard
                key={lift.id}
                lift={lift}
                isSelected={lift.id === selectedLiftId}
                userBodyweight={userBodyweight}
                userGender={userGender}
                onSelect={() => onSelectLift(lift.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* SELECTED LIFT DETAILS PANEL */}
      {/* ================================================================== */}
      {selectedLift && metrics && (
        <div className="shrink-0 border-t border-white/5 bg-zinc-900/50 max-h-[40%] overflow-y-auto">
          <LiftDetailPanel
            lift={selectedLift}
            exercise={exercise}
            metrics={metrics}
            userBodyweight={userBodyweight}
            onLogSet={(setData) => onLogSet(selectedLift.id, setData)}
            onUpdateGoal={(goalWeight, goalDate) => onUpdateGoal(selectedLift.id, goalWeight, goalDate)}
          />
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// LIFT CARD
// -----------------------------------------------------------------------------

interface LiftCardProps {
  lift: TrackedLift
  isSelected: boolean
  userBodyweight: number
  userGender: 'male' | 'female'
  onSelect: () => void
}

function LiftCard({ lift, isSelected, userBodyweight, userGender, onSelect }: LiftCardProps) {
  const exercise = EXERCISE_MAP.get(lift.exerciseId)
  const strengthLevel = exercise?.supportsOneRepMax && lift.oneRepMax
    ? getStrengthLevel(lift.exerciseId, lift.oneRepMax, userBodyweight, userGender)
    : null

  const TrendIcon = lift.trend === 'up' ? TrendingUp : lift.trend === 'down' ? TrendingDown : Minus
  const trendColor = lift.trend === 'up' ? 'text-emerald-400' : lift.trend === 'down' ? 'text-red-400' : 'text-slate-500'

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 transition-colors',
        isSelected ? 'bg-purple-500/10' : 'hover:bg-white/5'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-100 truncate">
              {lift.exerciseName}
            </h3>
            {lift.personalRecord && lift.oneRepMax && lift.oneRepMax >= lift.personalRecord && (
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            )}
          </div>
          
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            {exercise && (
              <span className="capitalize">{exercise.primaryMuscles[0]}</span>
            )}
            {lift.lastWorkoutDate && (
              <span>Last: {new Date(lift.lastWorkoutDate).toLocaleDateString()}</span>
            )}
          </div>

          {strengthLevel && (
            <div className="mt-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/30">
                <span className={cn(
                  strengthLevel.level === 'beginner' && 'text-slate-400',
                  strengthLevel.level === 'novice' && 'text-blue-400',
                  strengthLevel.level === 'intermediate' && 'text-green-400',
                  strengthLevel.level === 'advanced' && 'text-purple-400',
                  strengthLevel.level === 'elite' && 'text-yellow-400',
                )}>
                  {strengthLevel.level}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500">Top {100 - strengthLevel.percentile}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center gap-1.5">
            <TrendIcon className={cn('w-4 h-4', trendColor)} />
            <span className="text-lg font-bold text-slate-100">
              {lift.workingWeight}
            </span>
            <span className="text-xs text-slate-500">{lift.workingUnit}</span>
          </div>
          
          {lift.lastSet && (
            <div className="mt-0.5 text-xs text-slate-500">
              Last: {lift.lastSet}
            </div>
          )}
          
          {lift.oneRepMax && (
            <div className="mt-1 text-xs text-purple-400 font-mono">
              e1RM: {lift.oneRepMax}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar to goal */}
      {lift.goalWeight && lift.goalWeight > lift.workingWeight && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-500">Progress to goal</span>
            <span className="text-emerald-400">{lift.goalWeight} {lift.workingUnit}</span>
          </div>
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (lift.workingWeight / lift.goalWeight) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </button>
  )
}

// -----------------------------------------------------------------------------
// LIFT DETAIL PANEL
// -----------------------------------------------------------------------------

interface LiftDetailPanelProps {
  lift: TrackedLift
  exercise: Exercise | null | undefined
  metrics: {
    volumeMetrics: ReturnType<typeof calculateVolumeMetrics>
    progression: ProgressionRecommendation
    strengthLevel: ReturnType<typeof getStrengthLevel> | null
    plates: ReturnType<typeof calculatePlates> | null
  }
  userBodyweight: number
  onLogSet: (setData: Omit<SetLogEntry, 'id' | 'loggedAt' | 'estimated1RM' | 'isPR'>) => void
  onUpdateGoal: (goalWeight: number, goalDate?: string) => void
}

function LiftDetailPanel({ lift, exercise, metrics, userBodyweight, onLogSet, onUpdateGoal }: LiftDetailPanelProps) {
  const [logWeight, setLogWeight] = useState(lift.workingWeight.toString())
  const [logReps, setLogReps] = useState('5')
  const [logRPE, setLogRPE] = useState('')
  const [isWarmup, setIsWarmup] = useState(false)
  const [activeTab, setActiveTab] = useState<'log' | 'metrics' | 'chart'>('log')

  const handleLogSet = () => {
    const weight = parseFloat(logWeight)
    const reps = parseInt(logReps)
    const rpe = logRPE ? parseFloat(logRPE) : undefined

    if (weight > 0 && reps > 0) {
      onLogSet({
        liftId: lift.id,
        weight,
        reps,
        unit: lift.workingUnit,
        rpe,
        isWarmup,
      })
      // Reset RPE and warmup, keep weight/reps for next set
      setLogRPE('')
      setIsWarmup(false)
    }
  }

  const previewE1RM = useMemo(() => {
    const w = parseFloat(logWeight)
    const r = parseInt(logReps)
    if (w > 0 && r > 0) {
      return calculateOneRepMax(w, r).recommended
    }
    return null
  }, [logWeight, logReps])

  return (
    <div className="p-4">
      {/* Exercise Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-100">{lift.exerciseName}</h3>
        {exercise && (
          <div className="mt-1 flex flex-wrap gap-2">
            {exercise.primaryMuscles.map(m => (
              <span key={m} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded-full capitalize">
                {m}
              </span>
            ))}
            {exercise.equipment.map(e => (
              <span key={e} className="px-2 py-0.5 bg-slate-500/10 text-slate-400 text-xs rounded-full capitalize">
                {e.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 p-1 bg-black/30 rounded-lg">
        {(['log', 'metrics', 'chart'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors capitalize',
              activeTab === tab 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {tab === 'log' && 'Log Set'}
            {tab === 'metrics' && 'Metrics'}
            {tab === 'chart' && 'Percentages'}
          </button>
        ))}
      </div>

      {/* LOG SET TAB */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          {/* Quick Log Form */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Weight ({lift.workingUnit})
              </label>
              <input
                type="number"
                value={logWeight}
                onChange={(e) => setLogWeight(e.target.value)}
                className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-slate-100 text-lg font-mono focus:border-emerald-500/50 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Reps
              </label>
              <input
                type="number"
                value={logReps}
                onChange={(e) => setLogReps(e.target.value)}
                min="1"
                max="100"
                className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-slate-100 text-lg font-mono focus:border-emerald-500/50 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                RPE (opt)
              </label>
              <input
                type="number"
                value={logRPE}
                onChange={(e) => setLogRPE(e.target.value)}
                min="1"
                max="10"
                step="0.5"
                placeholder="7.5"
                className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-slate-100 text-lg font-mono focus:border-emerald-500/50 focus:outline-none text-center"
              />
            </div>
          </div>

          {/* Preview */}
          {previewE1RM && (
            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
              <span className="text-xs text-purple-300">Estimated 1RM</span>
              <span className="text-lg font-bold text-purple-400">{previewE1RM} {lift.workingUnit}</span>
            </div>
          )}

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isWarmup}
                onChange={(e) => setIsWarmup(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black/30 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-sm text-slate-400">Warmup set</span>
            </label>
          </div>

          {/* Log Button */}
          <button
            onClick={handleLogSet}
            className="w-full py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Log Set
          </button>

          {/* Progression Recommendation */}
          {metrics.progression && (
            <div className="p-3 bg-black/30 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  Next Workout
                </span>
              </div>
              <p className="text-sm text-slate-300">{metrics.progression.reason}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded font-mono">
                  {metrics.progression.nextWeight} × {metrics.progression.nextReps}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* METRICS TAB */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard 
              label="Total Volume" 
              value={metrics.volumeMetrics.totalVolume.toLocaleString()} 
              unit={lift.workingUnit}
              icon={BarChart3}
            />
            <MetricCard 
              label="Total Sets" 
              value={metrics.volumeMetrics.totalSets} 
              icon={History}
            />
            <MetricCard 
              label="Average Weight" 
              value={metrics.volumeMetrics.averageWeight} 
              unit={lift.workingUnit}
              icon={TrendingUp}
            />
            <MetricCard 
              label="Max Weight" 
              value={metrics.volumeMetrics.maxWeight} 
              unit={lift.workingUnit}
              icon={Flame}
            />
          </div>

          {/* Strength Level */}
          {metrics.strengthLevel && (
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                Strength Level
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold capitalize text-purple-400">
                    {metrics.strengthLevel.level}
                  </div>
                  <div className="text-xs text-slate-500">
                    Top {100 - metrics.strengthLevel.percentile}% of lifters
                  </div>
                </div>
                {metrics.strengthLevel.nextLevel && (
                  <div className="text-right">
                    <div className="text-xs text-slate-500">To reach {metrics.strengthLevel.nextLevel}</div>
                    <div className="text-sm font-mono text-emerald-400">
                      +{metrics.strengthLevel.weightNeeded} {lift.workingUnit}
                    </div>
                  </div>
                )}
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                  style={{ width: `${metrics.strengthLevel.percentile}%` }}
                />
              </div>
            </div>
          )}

          {/* Plate Calculator */}
          {metrics.plates && metrics.plates.isPossible && lift.oneRepMax && (
            <div className="p-3 bg-black/30 rounded-lg">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                Plates for 1RM ({lift.oneRepMax} {lift.workingUnit})
              </div>
              <div className="flex flex-wrap gap-2">
                {metrics.plates.plates.map((plate, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-700 text-slate-200 text-xs rounded font-mono">
                    {plate.count}× {plate.weight}
                  </span>
                ))}
                <span className="text-xs text-slate-500 self-center">per side</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PERCENTAGE CHART TAB */}
      {activeTab === 'chart' && lift.oneRepMax && (
        <div className="space-y-2">
          <div className="text-xs text-slate-500 mb-3">
            Training weights based on your estimated 1RM of <span className="text-purple-400 font-mono">{lift.oneRepMax} {lift.workingUnit}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {REP_PERCENTAGE_CHART.slice(0, 12).map(row => {
              const weight = Math.round(lift.oneRepMax! * (row.percentOf1RM / 100))
              return (
                <div 
                  key={row.reps}
                  className="flex items-center justify-between p-2 bg-black/20 rounded-lg"
                >
                  <div>
                    <span className="text-slate-200 font-mono">{row.reps} rep{row.reps > 1 ? 's' : ''}</span>
                    <span className="text-slate-500 text-xs ml-2">({row.percentOf1RM}%)</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">{weight}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// METRIC CARD HELPER
// -----------------------------------------------------------------------------

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon: typeof TrendingUp
}

function MetricCard({ label, value, unit, icon: Icon }: MetricCardProps) {
  return (
    <div className="p-3 bg-black/30 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-lg font-bold text-slate-100">
        {value}
        {unit && <span className="text-xs text-slate-500 ml-1">{unit}</span>}
      </div>
    </div>
  )
}

export default ActiveLiftTracker
