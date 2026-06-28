'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProgramRepository, type Program, type CalendarEvent } from '@/repositories/ProgramRepository'
import { WorkoutRepository, type WorkoutTemplate } from '@/repositories/WorkoutRepository'
import { useToast } from '@/providers/ToastProvider'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Loader2, Crown, Check } from 'lucide-react'

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
    } catch (err: any) {
      toast({ title: err.error || 'Failed to load programs', variant: "destructive" })
    }
  }

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
                  <div
                    key={i}
                    className={`min-h-[100px] rounded-xl border p-2 ${
                      isCurrentMonth ? 'bg-white border-gray-100' : 'bg-gray-50 border-transparent'
                    } ${isToday ? 'ring-2 ring-[#ff5d4f]/30' : ''}`}
                  >
                    <p className={`text-sm font-bold mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                      {day.getDate()}
                    </p>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((evt, idx) => (
                        <div
                          key={idx}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded ${
                            evt.type === 'program' ? 'bg-[#d7fb48]/40' : 'bg-[#ff5d4f]/10 text-[#ff5d4f]'
                          }`}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-gray-400">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </div>
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
                    } catch (err: any) {
                      toast({ title: err.error || 'Failed to enroll', variant: "destructive" })
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
    } catch (err: any) {
      toast({ title: err.error || 'Failed to create program', variant: "destructive" })
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
