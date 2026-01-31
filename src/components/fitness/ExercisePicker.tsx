'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Filter,
  Dumbbell,
  ChevronRight,
  Plus,
  Check,
  Target,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ALL_EXERCISES,
  searchExercises,
  getExercisesByMuscle,
  getExercisesByEquipment,
  MUSCLE_GROUPS,
  EQUIPMENT_INFO,
  type Exercise,
  type MuscleGroup,
  type EquipmentType,
} from '@/lib/exercises'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

interface ExercisePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (exercise: Exercise, config: ExerciseConfig) => void
  alreadyTracked?: string[]  // Exercise IDs already being tracked
}

interface ExerciseConfig {
  workingWeight: number
  workingUnit: 'lbs' | 'kg'
  goalWeight?: number
  goalDate?: string
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function ExercisePicker({
  isOpen,
  onClose,
  onSelect,
  alreadyTracked = [],
}: ExercisePickerProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Selection state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [config, setConfig] = useState<ExerciseConfig>({
    workingWeight: 0,
    workingUnit: 'lbs',
  })

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let results = ALL_EXERCISES

    // Search filter
    if (searchQuery.trim()) {
      results = searchExercises(searchQuery)
    }

    // Muscle filter
    if (selectedMuscle) {
      results = results.filter(
        ex => ex.primaryMuscles.includes(selectedMuscle) || 
              ex.secondaryMuscles.includes(selectedMuscle)
      )
    }

    // Equipment filter
    if (selectedEquipment) {
      results = results.filter(ex => ex.equipment.includes(selectedEquipment))
    }

    // Sort: already tracked last
    return results.sort((a, b) => {
      const aTracked = alreadyTracked.includes(a.id)
      const bTracked = alreadyTracked.includes(b.id)
      if (aTracked && !bTracked) return 1
      if (!aTracked && bTracked) return -1
      return 0
    })
  }, [searchQuery, selectedMuscle, selectedEquipment, alreadyTracked])

  // Group exercises by category
  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {
      compound: [],
      isolation: [],
      other: [],
    }
    
    filteredExercises.forEach(ex => {
      if (ex.category === 'compound') groups.compound.push(ex)
      else if (ex.category === 'isolation') groups.isolation.push(ex)
      else groups.other.push(ex)
    })
    
    return groups
  }, [filteredExercises])

  // Handle exercise selection
  const handleSelectExercise = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise)
    // Set sensible defaults based on exercise
    setConfig({
      workingWeight: exercise.supportsOneRepMax ? 135 : 50,
      workingUnit: 'lbs',
    })
  }, [])

  // Handle final add
  const handleAdd = useCallback(() => {
    if (!selectedExercise || config.workingWeight <= 0) return
    onSelect(selectedExercise, config)
    // Reset state
    setSelectedExercise(null)
    setConfig({ workingWeight: 0, workingUnit: 'lbs' })
    setSearchQuery('')
    onClose()
  }, [selectedExercise, config, onSelect, onClose])

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedMuscle(null)
    setSelectedEquipment(null)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-950 border border-white/10 rounded-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {selectedExercise ? 'Configure Lift' : 'Add Lift to Track'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {selectedExercise 
                  ? 'Set your working weight and optional goal'
                  : `${ALL_EXERCISES.length} exercises available`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedExercise ? (
            /* ============================================================== */
            /* EXERCISE LIST VIEW */
            /* ============================================================== */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              {/* Search & Filters */}
              <div className="p-4 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exercises... (e.g., bench, squat, deadlift)"
                    className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-white/10 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors',
                      showFilters
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700'
                    )}
                  >
                    <Filter className="w-3 h-3" />
                    Filters
                  </button>

                  {(selectedMuscle || selectedEquipment) && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear filters
                    </button>
                  )}

                  <div className="ml-auto text-xs text-slate-500">
                    {filteredExercises.length} results
                  </div>
                </div>

                {/* Filter Options */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-2">
                        {/* Muscle Filter */}
                        <div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                            Muscle Group
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(MUSCLE_GROUPS).slice(0, 12).map(([id, { name }]) => (
                              <button
                                key={id}
                                onClick={() => setSelectedMuscle(selectedMuscle === id as MuscleGroup ? null : id as MuscleGroup)}
                                className={cn(
                                  'px-2 py-1 rounded text-xs transition-colors',
                                  selectedMuscle === id
                                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                    : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700'
                                )}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Equipment Filter */}
                        <div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                            Equipment
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(EQUIPMENT_INFO).slice(0, 8).map(([id, { name, icon }]) => (
                              <button
                                key={id}
                                onClick={() => setSelectedEquipment(selectedEquipment === id as EquipmentType ? null : id as EquipmentType)}
                                className={cn(
                                  'px-2 py-1 rounded text-xs transition-colors flex items-center gap-1',
                                  selectedEquipment === id
                                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                                    : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700'
                                )}
                              >
                                <span>{icon}</span>
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Exercise List */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <div className="text-sm text-slate-500">No exercises found</div>
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Compound Exercises */}
                    {groupedExercises.compound.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider mb-2 sticky top-0 bg-zinc-950 py-1">
                          COMPOUND MOVEMENTS ({groupedExercises.compound.length})
                        </div>
                        <div className="space-y-1">
                          {groupedExercises.compound.map((exercise) => (
                            <ExerciseRow
                              key={exercise.id}
                              exercise={exercise}
                              isTracked={alreadyTracked.includes(exercise.id)}
                              onSelect={() => handleSelectExercise(exercise)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Isolation Exercises */}
                    {groupedExercises.isolation.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono text-purple-500 uppercase tracking-wider mb-2 sticky top-0 bg-zinc-950 py-1">
                          ISOLATION MOVEMENTS ({groupedExercises.isolation.length})
                        </div>
                        <div className="space-y-1">
                          {groupedExercises.isolation.map((exercise) => (
                            <ExerciseRow
                              key={exercise.id}
                              exercise={exercise}
                              isTracked={alreadyTracked.includes(exercise.id)}
                              onSelect={() => handleSelectExercise(exercise)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other */}
                    {groupedExercises.other.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-zinc-950 py-1">
                          OTHER ({groupedExercises.other.length})
                        </div>
                        <div className="space-y-1">
                          {groupedExercises.other.map((exercise) => (
                            <ExerciseRow
                              key={exercise.id}
                              exercise={exercise}
                              isTracked={alreadyTracked.includes(exercise.id)}
                              onSelect={() => handleSelectExercise(exercise)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ============================================================== */
            /* CONFIGURATION VIEW */
            /* ============================================================== */
            <motion.div
              key="config"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-4"
            >
              {/* Back button */}
              <button
                onClick={() => setSelectedExercise(null)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to exercises
              </button>

              {/* Selected Exercise Info */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-4 mb-6 border border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">
                      {selectedExercise.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {selectedExercise.primaryMuscles.join(', ')}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-700 text-slate-400 rounded text-xs">
                        {selectedExercise.category}
                      </span>
                    </div>
                  </div>
                  {selectedExercise.supportsOneRepMax && (
                    <div className="px-2 py-1 bg-emerald-500/20 rounded-lg">
                      <div className="text-[10px] text-emerald-400 font-mono">1RM TRACKED</div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-3">
                  {selectedExercise.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>Equipment: {selectedExercise.equipment.map(e => EQUIPMENT_INFO[e]?.icon || e).join(' ')}</span>
                  <span>Level: {selectedExercise.minimumLevel}</span>
                </div>
              </div>

              {/* Configuration Form */}
              <div className="space-y-6">
                {/* Working Weight */}
                <div>
                  <label className="text-sm font-medium text-slate-200 block mb-2">
                    Current Working Weight *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={config.workingWeight || ''}
                      onChange={(e) => setConfig(c => ({ ...c, workingWeight: Number(e.target.value) }))}
                      placeholder="0"
                      className="flex-1 h-12 bg-zinc-900 border border-white/10 rounded-lg px-4 text-lg font-bold text-slate-100 focus:border-emerald-500/50 focus:outline-none"
                    />
                    <div className="flex border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setConfig(c => ({ ...c, workingUnit: 'lbs' }))}
                        className={cn(
                          'px-4 py-3 text-sm transition-colors',
                          config.workingUnit === 'lbs'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700'
                        )}
                      >
                        lbs
                      </button>
                      <button
                        onClick={() => setConfig(c => ({ ...c, workingUnit: 'kg' }))}
                        className={cn(
                          'px-4 py-3 text-sm transition-colors',
                          config.workingUnit === 'kg'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700'
                        )}
                      >
                        kg
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This is typically the weight you use for your working sets
                  </p>
                </div>

                {/* Goal Weight (Optional) */}
                <div>
                  <label className="text-sm font-medium text-slate-200 block mb-2">
                    Goal Weight <span className="text-slate-500">(optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        value={config.goalWeight || ''}
                        onChange={(e) => setConfig(c => ({ ...c, goalWeight: Number(e.target.value) || undefined }))}
                        placeholder="Set a target"
                        className="w-full h-12 pl-10 pr-4 bg-zinc-900 border border-white/10 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>
                    <span className="text-sm text-slate-400 w-12">
                      {config.workingUnit}
                    </span>
                  </div>
                </div>

                {/* Goal Date (Optional) */}
                {config.goalWeight && (
                  <div>
                    <label className="text-sm font-medium text-slate-200 block mb-2">
                      Target Date <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={config.goalDate || ''}
                      onChange={(e) => setConfig(c => ({ ...c, goalDate: e.target.value || undefined }))}
                      className="w-full h-12 bg-zinc-900 border border-white/10 rounded-lg px-4 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>
                )}

                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p>Once added, you can log sets and track your progress over time.</p>
                    {selectedExercise.supportsOneRepMax && (
                      <p className="mt-1">This exercise supports 1RM estimation from your working sets.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <div className="sticky bottom-0 pt-4 mt-6 border-t border-white/5 bg-zinc-950">
                <button
                  onClick={handleAdd}
                  disabled={config.workingWeight <= 0}
                  className={cn(
                    'w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all',
                    config.workingWeight > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  ADD TO TRACKED LIFTS
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// EXERCISE ROW COMPONENT
// -----------------------------------------------------------------------------

interface ExerciseRowProps {
  exercise: Exercise
  isTracked: boolean
  onSelect: () => void
}

function ExerciseRow({ exercise, isTracked, onSelect }: ExerciseRowProps) {
  return (
    <button
      onClick={onSelect}
      disabled={isTracked}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left',
        isTracked
          ? 'bg-zinc-900/50 opacity-50 cursor-not-allowed'
          : 'hover:bg-white/5'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
          exercise.category === 'compound' ? 'bg-emerald-500/20 text-emerald-400' :
          exercise.category === 'isolation' ? 'bg-purple-500/20 text-purple-400' :
          'bg-zinc-700 text-slate-400'
        )}>
          {EQUIPMENT_INFO[exercise.equipment[0]]?.icon || '💪'}
        </div>
        <div className="min-w-0">
          <div className="text-sm text-slate-200 truncate">{exercise.name}</div>
          <div className="text-xs text-slate-500 truncate">
            {exercise.primaryMuscles.join(', ')}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {exercise.supportsOneRepMax && (
          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded">
            1RM
          </span>
        )}
        {isTracked ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <Check className="w-3 h-3" />
            Tracked
          </span>
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </div>
    </button>
  )
}

export default ExercisePicker
