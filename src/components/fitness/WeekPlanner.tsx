'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  Play,
  Pause,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Zap,
  Moon,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WORKOUT_TYPE_CONFIG } from '@/lib/workoutTypes'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

// Use WorkoutType from shared module (imported via WORKOUT_TYPE_CONFIG)
type WorkoutType = import('@/lib/workoutTypes').WorkoutType

export interface WorkoutTemplate {
  id: string
  name: string
  description?: string
  type: WorkoutType
  exercises: {
    exerciseId: string
    exerciseName: string
    targetSets: number
    targetReps: string  // e.g., "8-12" or "5"
    notes?: string
  }[]
  estimatedDuration: number  // minutes
  isPublic: boolean
  isActive: boolean
}

export interface ScheduledWorkout {
  id: string
  templateId: string | null
  template?: WorkoutTemplate
  scheduledFor: string  // ISO date
  dayOfWeek: number  // 0-6
  isRecurring: boolean
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'RESCHEDULED'
  startedAt?: string
  completedAt?: string
  notes?: string
}

interface WeekPlannerProps {
  templates: WorkoutTemplate[]
  scheduledWorkouts: ScheduledWorkout[]
  currentDate: Date
  onScheduleWorkout: (date: string, templateId: string, isRecurring: boolean) => Promise<void>
  onUpdateWorkout: (workoutId: string, updates: Partial<ScheduledWorkout>) => Promise<void>
  onDeleteWorkout: (workoutId: string) => Promise<void>
  onStartWorkout: (workoutId: string) => void
  onCreateTemplate: () => void
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function WeekPlanner({
  templates,
  scheduledWorkouts,
  currentDate,
  onScheduleWorkout,
  onUpdateWorkout,
  onDeleteWorkout,
  onStartWorkout,
  onCreateTemplate,
}: WeekPlannerProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  // Calculate week days
  const weekDays = useMemo(() => {
    const today = new Date(currentDate)
    today.setDate(today.getDate() - today.getDay() + (weekOffset * 7))
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      return {
        date,
        dayName: DAYS[i],
        fullDayName: FULL_DAYS[i],
        dateString: date.toISOString().split('T')[0],
        isToday: date.toDateString() === currentDate.toDateString(),
        isPast: date < new Date(currentDate.toDateString()),
      }
    })
  }, [currentDate, weekOffset])

  // Get week range string
  const weekRangeString = useMemo(() => {
    const start = weekDays[0].date
    const end = weekDays[6].date
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const year = end.getFullYear()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`
  }, [weekDays])

  // Group workouts by date
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, ScheduledWorkout[]>()
    scheduledWorkouts.forEach(workout => {
      const date = workout.scheduledFor.split('T')[0]
      const existing = map.get(date) || []
      map.set(date, [...existing, workout])
    })
    return map
  }, [scheduledWorkouts])

  const handleDayClick = (dateString: string) => {
    setSelectedDay(dateString)
    setShowTemplateSelector(true)
  }

  const handleSchedule = async (templateId: string, isRecurring: boolean) => {
    if (!selectedDay) return
    await onScheduleWorkout(selectedDay, templateId, isRecurring)
    setShowTemplateSelector(false)
    setSelectedDay(null)
  }

  // Weekly stats
  const weekStats = useMemo(() => {
    const workouts = weekDays.flatMap(d => workoutsByDate.get(d.dateString) || [])
    const completed = workouts.filter(w => w.status === 'COMPLETED').length
    const scheduled = workouts.filter(w => w.status === 'SCHEDULED').length
    const skipped = workouts.filter(w => w.status === 'SKIPPED').length
    
    return { total: workouts.length, completed, scheduled, skipped }
  }, [weekDays, workoutsByDate])

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="shrink-0 p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
              {'// WEEK PLANNER'}
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-100 tracking-wide">
              {weekRangeString}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg transition-colors',
                weekOffset === 0 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'hover:bg-white/5 text-slate-400'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{weekStats.total} workouts</span>
          </div>
          {weekStats.completed > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span>{weekStats.completed} completed</span>
            </div>
          )}
          {weekStats.skipped > 0 && (
            <div className="flex items-center gap-1.5 text-red-400">
              <X className="w-3.5 h-3.5" />
              <span>{weekStats.skipped} skipped</span>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* WEEK GRID */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-7 divide-x divide-white/5">
          {weekDays.map((day) => {
            const dayWorkouts = workoutsByDate.get(day.dateString) || []
            
            return (
              <div
                key={day.dateString}
                className={cn(
                  'flex flex-col min-h-0',
                  day.isPast && 'opacity-60'
                )}
              >
                {/* Day Header */}
                <div className={cn(
                  'shrink-0 p-2 text-center border-b border-white/5',
                  day.isToday && 'bg-emerald-500/10'
                )}>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    {day.dayName}
                  </div>
                  <div className={cn(
                    'mt-1 text-lg font-bold',
                    day.isToday ? 'text-emerald-400' : 'text-slate-200'
                  )}>
                    {day.date.getDate()}
                  </div>
                </div>

                {/* Day Content */}
                <div className="flex-1 overflow-y-auto p-1 space-y-1">
                  {dayWorkouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      isPast={day.isPast}
                      onStart={() => onStartWorkout(workout.id)}
                      onComplete={() => onUpdateWorkout(workout.id, { status: 'COMPLETED' })}
                      onSkip={() => onUpdateWorkout(workout.id, { status: 'SKIPPED' })}
                      onDelete={() => onDeleteWorkout(workout.id)}
                    />
                  ))}
                  
                  {/* Add Workout Button */}
                  {!day.isPast && (
                    <button
                      onClick={() => handleDayClick(day.dateString)}
                      className="w-full p-2 border border-dashed border-white/10 rounded-lg text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-[10px]">Add</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* TEMPLATE SELECTOR MODAL */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showTemplateSelector && selectedDay && (
          <TemplateSelector
            templates={templates}
            selectedDate={selectedDay}
            onSelect={handleSchedule}
            onClose={() => {
              setShowTemplateSelector(false)
              setSelectedDay(null)
            }}
            onCreateTemplate={onCreateTemplate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// -----------------------------------------------------------------------------
// WORKOUT CARD
// -----------------------------------------------------------------------------

interface WorkoutCardProps {
  workout: ScheduledWorkout
  isPast: boolean
  onStart: () => void
  onComplete: () => void
  onSkip: () => void
  onDelete: () => void
}

function WorkoutCard({ workout, isPast, onStart, onComplete, onSkip, onDelete }: WorkoutCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const template = workout.template
  const type = template?.type || 'CUSTOM'
  const config = WORKOUT_TYPE_CONFIG[type]
  const Icon = config.icon

  const statusColors = {
    SCHEDULED: 'border-white/10',
    IN_PROGRESS: 'border-yellow-500/50 bg-yellow-500/5',
    COMPLETED: 'border-emerald-500/50 bg-emerald-500/5',
    SKIPPED: 'border-red-500/30 bg-red-500/5 opacity-50',
    RESCHEDULED: 'border-blue-500/30',
  }

  return (
    <div
      className={cn(
        'relative p-2 rounded-lg border transition-colors group',
        statusColors[workout.status]
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn('shrink-0 w-6 h-6 rounded flex items-center justify-center', config.bgColor)}>
          <Icon className={cn('w-3 h-3', config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-slate-200 truncate">
            {template?.name || 'Custom Workout'}
          </div>
          
          {template?.estimatedDuration && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
              <Clock className="w-2.5 h-2.5" />
              {template.estimatedDuration}min
            </div>
          )}
        </div>

        {/* Status indicator or menu */}
        {workout.status === 'COMPLETED' ? (
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : workout.status === 'SKIPPED' ? (
          <X className="w-4 h-4 text-red-400 shrink-0" />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all shrink-0"
          >
            <MoreHorizontal className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      {/* Recurring indicator */}
      {workout.isRecurring && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
          <RotateCcw className="w-2.5 h-2.5" />
          Weekly
        </div>
      )}

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full left-0 right-0 mt-1 z-10 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden"
          >
            {workout.status === 'SCHEDULED' && !isPast && (
              <button
                onClick={() => { onStart(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <Play className="w-3 h-3" />
                Start Workout
              </button>
            )}
            {workout.status === 'SCHEDULED' && (
              <button
                onClick={() => { onComplete(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                <Check className="w-3 h-3" />
                Mark Complete
              </button>
            )}
            {workout.status === 'SCHEDULED' && (
              <button
                onClick={() => { onSkip(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                <X className="w-3 h-3" />
                Skip
              </button>
            )}
            <button
              onClick={() => { onDelete(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// -----------------------------------------------------------------------------
// TEMPLATE SELECTOR
// -----------------------------------------------------------------------------

interface TemplateSelectorProps {
  templates: WorkoutTemplate[]
  selectedDate: string
  onSelect: (templateId: string, isRecurring: boolean) => void
  onClose: () => void
  onCreateTemplate: () => void
}

function TemplateSelector({ templates, selectedDate, onSelect, onClose, onCreateTemplate }: TemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)

  const dateObj = new Date(selectedDate + 'T00:00:00')
  const dayName = FULL_DAYS[dateObj.getDay()]

  const handleConfirm = () => {
    if (selectedTemplateId) {
      onSelect(selectedTemplateId, isRecurring)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Schedule Workout</h3>
              <p className="text-sm text-slate-500">{dayName}, {dateObj.toLocaleDateString()}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Templates */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 mx-auto text-slate-700 mb-3" />
              <p className="text-sm text-slate-500 mb-4">No workout templates yet</p>
              <button
                onClick={onCreateTemplate}
                className="px-4 py-2 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition-colors"
              >
                Create Template
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map(template => {
                const config = WORKOUT_TYPE_CONFIG[template.type]
                const Icon = config.icon
                const isSelected = selectedTemplateId === template.id
                
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-colors',
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'border-white/5 hover:border-white/10'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bgColor)}>
                        <Icon className={cn('w-5 h-5', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-200">{template.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{template.exercises.length} exercises</span>
                          {template.estimatedDuration && (
                            <>
                              <span>•</span>
                              <span>{template.estimatedDuration} min</span>
                            </>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-emerald-400" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Recurring Option & Actions */}
        {templates.length > 0 && (
          <div className="p-4 border-t border-white/5 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black/30 text-emerald-500 focus:ring-emerald-500/50"
              />
              <div>
                <span className="text-sm text-slate-200">Repeat weekly</span>
                <span className="text-xs text-slate-500 block">
                  Schedule this workout every {dayName}
                </span>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-zinc-800 text-slate-200 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedTemplateId}
                className={cn(
                  'flex-1 py-2.5 rounded-lg font-medium transition-colors',
                  selectedTemplateId
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                )}
              >
                Schedule
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default WeekPlanner
