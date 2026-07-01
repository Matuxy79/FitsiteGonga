'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProgramRepository, type Program, type CalendarEvent } from '@/repositories/ProgramRepository'
import { WorkoutRepository, type WorkoutTemplate } from '@/repositories/WorkoutRepository'
import { useToast } from '@/providers/ToastProvider'
import { mapApiErrorToToast } from '@/lib/apiFeedback'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Loader2, Crown, Check, X, Clock, Dumbbell, Flame, Heart, Zap, Moon, Play, Trash2 } from 'lucide-react'
import { WORKOUT_TYPE_CONFIG, getWorkoutTypeConfig } from '@/lib/workoutTypes'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import WorkoutWidget from '@/components/fitness/WorkoutWidget'

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0]
}

export default function ProgramsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isPaid = user?.membership_tier === 'PAID' || user?.role === 'ADMIN'
  const isTrainer = user?.role === 'TRAINER' || user?.role === 'ADMIN'

  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [myPrograms, setMyPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [showDayPanel, setShowDayPanel] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const loadCalendar = async () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const evts = await ProgramRepository.getCalendar(start.toISOString(), end.toISOString())
    setEvents(evts)
  }

  const loadPrograms = async () => {
    try {
      const [p, mp] = await Promise.all([ProgramRepository.listPrograms(), ProgramRepository.getMyPrograms()])
      setPrograms(p)
      setMyPrograms(mp)
    } catch (err) {
      toast(mapApiErrorToToast(err, { action: 'load your programs' }))
    }
  }

  // Load templates when panel opens
  useEffect(() => {
    if (showDayPanel && templates.length === 0) {
      WorkoutRepository.listTemplates().then(setTemplates).catch(console.error)
    }
  }, [showDayPanel, templates.length])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadCalendar(), loadPrograms()]).finally(() => setLoading(false))
  }, [currentDate])

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const startDay = start.getDay()
    const days: Date[] = []
    for (let i = -startDay; i < 42 - startDay; i++) {
      days.push(addDays(start, i))
    }
    return days
  }, [currentDate])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((evt) => {
      const key = formatDateKey(new Date(evt.date))
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(evt)
    })
    return map
  }, [events])

  const enrolledIds = new Set(myPrograms.map((mp) => mp.program_id))

  // Handle scheduled workout actions
  const handleCompleteWorkout = async (eventId: string) => {
    setActionLoading(true)
    try {
      await WorkoutRepository.updateSchedule(eventId, { status: 'COMPLETED' })
      toast({ title: 'Workout marked complete!', variant: 'success' })
      loadCalendar()
    } catch (err) {
      toast(mapApiErrorToToast(err, { action: 'update this workout' }))
    } finally {
      setActionLoading(false)
    }
  }

  const handleSkipWorkout = async (eventId: string) => {
    setActionLoading(true)
    try {
      await WorkoutRepository.updateSchedule(eventId, { status: 'SKIPPED' })
      toast({ title: 'Workout skipped', variant: 'success' })
      loadCalendar()
    } catch (err) {
      toast(mapApiErrorToToast(err, { action: 'skip this workout' }))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteWorkout = async (eventId: string) => {
    setActionLoading(true)
    try {
      await WorkoutRepository.deleteSchedule(eventId)
      toast({ title: 'Workout removed', variant: 'success' })
      loadCalendar()
    } catch (err) {
      toast(mapApiErrorToToast(err, { action: 'delete this workout' }))
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddWorkout = async (templateId: string) => {
    if (!selectedDate) return
    setActionLoading(true)
    try {
      await WorkoutRepository.createSchedule({
        template_id: templateId,
        scheduled_for: new Date(selectedDate).toISOString()
      })
      toast({ title: 'Workout scheduled!', variant: 'success' })
      loadCalendar()
      setShowDayPanel(false)
    } catch (err) {
      toast(mapApiErrorToToast(err, { action: 'schedule this workout' }))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-sm text-gray-500">Enroll in structured training plans and view your calendar.</p>
        </div>
        {isTrainer && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 bg-[#ff5d4f] text-white rounded-xl text-sm font-bold hover:bg-[#e54d3f] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create program
          </button>
        )}
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff5d4f]" />
        </div>
      ) : (
        <>
          {/* Calendar */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  className="p-2 rounded-xl hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 rounded-xl bg-gray-100 text-sm font-bold hover:bg-gray-200"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  className="p-2 rounded-xl hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const key = formatDateKey(day)
                const dayEvents = eventsByDay.get(key) || []
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = formatDateKey(new Date()) === key

                return (
                  <button
                    key={i}
                    onClick={() => { setSelectedDate(key); setShowDayPanel(true); }}
                    className={`min-h-[100px] rounded-xl border p-2 text-left hover:ring-2 hover:ring-[#ff5d4f]/30 transition-all ${
                      isCurrentMonth ? 'bg-white border-gray-100' : 'bg-gray-50 border-transparent'
                    } ${isToday ? 'ring-2 ring-[#ff5d4f]/30' : ''}`}
                  >
                    <p className={`text-sm font-bold mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                      {day.getDate()}
                    </p>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((evt, idx) => {
                        // Get workout type config for colorful badges
                        const typeConfig = evt.type === 'scheduled' && evt.template?.type 
                          ? getWorkoutTypeConfig(evt.template.type)
                          : null
                        
                        return (
                          <div
                            key={idx}
                            className={`text-[10px] truncate px-1.5 py-0.5 rounded ${
                              evt.type === 'program' 
                                ? 'bg-[#d7fb48]/40 text-gray-800' 
                                : typeConfig 
                                  ? `${typeConfig.bgColor} ${typeConfig.textColor}`
                                  : 'bg-[#ff5d4f]/10 text-[#ff5d4f]'
                            }`}
                          >
                            {evt.title}
                          </div>
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-gray-400">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Program browser */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-lg mb-4">Available programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  enrolled={enrolledIds.has(program.id)}
                  isPaid={isPaid}
                  onEnroll={async () => {
                    try {
                      await ProgramRepository.enroll(program.id)
                      toast({ title: 'Enrolled', variant: "success" })
                      loadPrograms()
                      loadCalendar()
                    } catch (err) {
                      toast(mapApiErrorToToast(err, { action: 'enroll in this program' }))
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {showCreate && isTrainer && (
        <CreateProgramModal
          templates={[]}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            loadPrograms()
            setShowCreate(false)
          }}
        />
      )}

      {/* Day Detail Panel - Full Workout Widget */}
      <AnimatePresence>
        {showDayPanel && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => { setShowDayPanel(false); setSelectedDate(null); }}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <WorkoutWidget />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProgramCard({
  program,
  enrolled,
  isPaid,
  onEnroll,
}: {
  program: Program
  enrolled: boolean
  isPaid: boolean
  onEnroll: () => void
}) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold">{program.name}</h3>
        <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded-full">{program.difficulty}</span>
      </div>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{program.description || 'No description'}</p>
      <p className="text-xs text-gray-400 mb-4">
        {program.duration_weeks} weeks • {program.weeks.reduce((acc, w) => acc + w.workouts.length, 0)} workouts
      </p>
      {enrolled ? (
        <div className="flex items-center gap-2 text-sm font-bold text-[#d7fb48] bg-black px-3 py-2 rounded-xl w-fit">
          <Check className="w-4 h-4" /> Enrolled
        </div>
      ) : isPaid ? (
        <button
          onClick={onEnroll}
          className="px-4 py-2 bg-[#ff5d4f] text-white rounded-xl text-sm font-bold hover:bg-[#e54d3f]"
        >
          Enroll
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Crown className="w-3.5 h-3.5" /> Paid feature
        </div>
      )}
    </div>
  )
}

function CreateProgramModal({ templates, onClose, onCreated }: { templates: WorkoutTemplate[]; onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      await ProgramRepository.createProgram({
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || undefined,
        duration_weeks: parseInt(formData.get('duration') as string) || 4,
        difficulty: (formData.get('difficulty') as any) || 'BEGINNER',
        is_public: true,
        weeks: [
          {
            week_number: 1,
            focus: 'Week 1',
            workouts: [],
          },
        ],
      })
      toast({ title: 'Program created', variant: "success" })
      onCreated()
    } catch (err) {
      toast(mapApiErrorToToast(err, { action: 'create this program' }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Create program</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <input name="name" required placeholder="Program name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 min-h-[80px]"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="duration"
            type="number"
            min={1}
            defaultValue={4}
            placeholder="Weeks"
            className="px-4 py-2.5 rounded-xl border border-gray-200"
          />
          <select name="difficulty" className="px-4 py-2.5 rounded-xl border border-gray-200">
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-[#ff5d4f] text-white rounded-xl font-bold hover:bg-[#e54d3f] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create program
        </button>
      </form>
    </div>
  )
}

// Day Detail Panel Component - slide-over for day actions
interface DayDetailPanelProps {
  date: string
  events: CalendarEvent[]
  onClose: () => void
  onComplete: (eventId: string) => void
  onSkip: (eventId: string) => void
  onDelete: (eventId: string) => void
  onAddWorkout: (templateId: string) => void
  loading: boolean
  templates: WorkoutTemplate[]
}

function DayDetailPanel({ date, events, onClose, onComplete, onSkip, onDelete, onAddWorkout, loading, templates }: DayDetailPanelProps) {
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [showQuickBuilder, setShowQuickBuilder] = useState(false)
  const [quickName, setQuickName] = useState('')
  const [quickType, setQuickType] = useState('PUSH')
  const [quickDuration, setQuickDuration] = useState(45)
  
  const dateObj = new Date(date + 'T00:00:00')
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const scheduledEvents = events.filter(e => e.type === 'scheduled')
  const programEvents = events.filter(e => e.type === 'program')
  
  const workoutTypes = [
    { value: 'PUSH', label: 'Push', color: 'bg-red-50 text-red-600' },
    { value: 'PULL', label: 'Pull', color: 'bg-blue-50 text-blue-600' },
    { value: 'LEGS', label: 'Legs', color: 'bg-purple-50 text-purple-600' },
    { value: 'UPPER', label: 'Upper', color: 'bg-orange-50 text-orange-600' },
    { value: 'LOWER', label: 'Lower', color: 'bg-pink-50 text-pink-600' },
    { value: 'FULL_BODY', label: 'Full Body', color: 'bg-emerald-50 text-emerald-600' },
    { value: 'CARDIO', label: 'Cardio', color: 'bg-cyan-50 text-cyan-600' },
    { value: 'REST', label: 'Rest', color: 'bg-slate-50 text-slate-600' },
    { value: 'CUSTOM', label: 'Custom', color: 'bg-yellow-50 text-yellow-600' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg">{dayName}</h3>
            <p className="text-sm text-gray-500">{dateStr}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Scheduled Workouts */}
          {scheduledEvents.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Workouts</h4>
              <div className="space-y-2">
                {scheduledEvents.map(evt => {
                  const typeConfig = evt.template?.type ? getWorkoutTypeConfig(evt.template.type) : null
                  const Icon = typeConfig?.icon || Dumbbell
                  
                  return (
                    <div key={evt.id} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        {typeConfig && (
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', typeConfig.bgColor)}>
                            <Icon className={cn('w-5 h-5', typeConfig.textColor)} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{evt.title}</div>
                          <div className="text-xs text-gray-500">
                            {evt.template?.type && typeConfig?.label}
                            {evt.status && <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100">{evt.status}</span>}
                          </div>
                        </div>
                      </div>
                      {evt.status === 'SCHEDULED' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => onComplete(evt.id)}
                            disabled={loading}
                            className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => onSkip(evt.id)}
                            disabled={loading}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => onDelete(evt.id)}
                            disabled={loading}
                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Program Events */}
          {programEvents.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Program Workouts</h4>
              <div className="space-y-2">
                {programEvents.map(evt => (
                  <div key={evt.id} className="bg-[#d7fb48]/20 border border-[#d7fb48]/30 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{evt.title}</div>
                    </div>
                    {evt.programName && (
                      <div className="text-xs text-gray-500 mt-1">{evt.programName}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No events message */}
          {events.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No workouts scheduled</p>
            </div>
          )}

          {/* Add Workout Section */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {!showAddTemplate && !showQuickBuilder ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowAddTemplate(true)}
                  className="py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-[#ff5d4f] hover:text-[#ff5d4f] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  From Template
                </button>
                <button
                  onClick={() => setShowQuickBuilder(true)}
                  className="py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-[#ff5d4f] hover:text-[#ff5d4f] transition-colors flex items-center justify-center gap-2"
                >
                  <Dumbbell className="w-4 h-4" />
                  Quick Create
                </button>
              </div>
            ) : showAddTemplate ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Select Template</h4>
                  <button onClick={() => setShowAddTemplate(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {templates.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No templates available</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {templates.map(template => {
                      const typeConfig = getWorkoutTypeConfig(template.type)
                      const Icon = typeConfig.icon
                      
                      return (
                        <button
                          key={template.id}
                          onClick={() => onAddWorkout(template.id)}
                          disabled={loading}
                          className="w-full p-3 border border-gray-100 rounded-xl text-left hover:border-[#ff5d4f]/30 hover:bg-gray-50 transition-colors flex items-center gap-3 disabled:opacity-50"
                        >
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', typeConfig.bgColor)}>
                            <Icon className={cn('w-5 h-5', typeConfig.textColor)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{ template.name }</div>
                            <div className="text-xs text-gray-500">{typeConfig.label}</div>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : showQuickBuilder ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Quick Create Workout</h4>
                  <button onClick={() => setShowQuickBuilder(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Workout Name</label>
                    <input
                      type="text"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="e.g., Morning Push"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                    <select
                      value={quickType}
                      onChange={(e) => setQuickType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                    >
                      {workoutTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={quickDuration}
                      onChange={(e) => setQuickDuration(parseInt(e.target.value) || 45)}
                      min={5}
                      max={180}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      if (quickName.trim()) {
                        // Quick create - would call onAddWorkout with new template
                        // For now just close and show success
                        setShowQuickBuilder(false)
                        setQuickName('')
                      }
                    }}
                    disabled={!quickName.trim() || loading}
                    className="w-full py-2.5 bg-[#ff5d4f] text-white rounded-xl font-medium text-sm hover:bg-[#e54d3f] disabled:opacity-50"
                  >
                    Create Workout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
