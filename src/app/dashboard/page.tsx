'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { AnimatePresence } from 'framer-motion'
import { AppLayout } from '@/components/layout/AppLayout'
import { TriSectorSidebar, SectorId, PanelId, ActiveLift, Squad } from '@/components/layout/TriSectorSidebar'
import { GlobalChat } from '@/components/messaging/GlobalChat'
import { SquadManager } from '@/components/messaging/SquadManager'
import { ActiveLiftTracker, TrackedLift as ComponentTrackedLift, SetLogEntry } from '@/components/fitness/ActiveLiftTracker'
import { LiftTracker } from '@/components/fitness/LiftTracker'
import { ExercisePicker } from '@/components/fitness/ExercisePicker'
import { WeekPlanner, WorkoutTemplate, ScheduledWorkout } from '@/components/fitness/WeekPlanner'
import { EXERCISE_MAP } from '@/lib/exercises'
import { useChallengeController } from '@/controllers/useChallengeController'
import { useAuth } from '@/hooks/useAuth'
import {
  useTrackedLifts,
  useLiftSession,
  useSquads,
  TrackedLift as HookTrackedLift,
} from '@/hooks'

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()

  // Sector/Panel state
  const [activeSector, setActiveSector] = useState<SectorId>('forge')
  const [activePanel, setActivePanel] = useState<PanelId>('active-lifts')
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null)
  const [selectedLiftId, setSelectedLiftId] = useState<string | null>(null)
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null)

  // Modal state
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [showLiftTracker, setShowLiftTracker] = useState(false)
  const [liftTrackerExercise, setLiftTrackerExercise] = useState<any>(null)

  // Socket state
  const [socket, setSocket] = useState<Socket | null>(null)

  // Custom hooks for data
  const { 
    trackedLifts, 
    loading: liftsLoading, 
    addTrackedLift, 
    removeTrackedLift,
    refreshLifts 
  } = useTrackedLifts()
  
  const { 
    logSet, 
    saveSession, 
    sessionSets, 
    clearSession 
  } = useLiftSession(selectedLiftId || '')
  
  const { 
    squads, 
    pendingInvites,
    loading: squadsLoading, 
    createSquad, 
    joinSquad, 
    leaveSquad,
    acceptInvite,
    declineInvite
  } = useSquads()

  // Challenge controller
  const { loading: loadingChallenges, challenges } = useChallengeController()

  // User profile data (for metrics)
  const [userProfile, setUserProfile] = useState({
    bodyweight: 180,
    gender: 'male' as 'male' | 'female',
    unit: 'lbs' as 'lbs' | 'kg'
  })

  // Week planner data (placeholder for now)
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([])
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([])

  // ==========================================================================
  // AUTH REDIRECT
  // ==========================================================================
  
  useEffect(() => {
    if (!authLoading && !user) {
      const hasStoredToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken')
      const reason = hasStoredToken ? 'session-expired' : 'login-required'
      router.replace(`/?reason=${reason}`)
    }
  }, [authLoading, user, router])

  // ==========================================================================
  // SOCKET CONNECTION
  // ==========================================================================

  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'
    
    const newSocket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected')
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [user])

  // Auto-select first lift
  useEffect(() => {
    if (!selectedLiftId && trackedLifts.length > 0) {
      setSelectedLiftId(trackedLifts[0].id)
    }
  }, [selectedLiftId, trackedLifts])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSectorChange = (sector: SectorId) => {
    setActiveSector(sector)
    const defaultPanels: Record<SectorId, PanelId> = {
      nexus: 'global-feed',
      forge: 'active-lifts',
      identity: 'profile',
    }
    setActivePanel(defaultPanels[sector])
  }

  const handlePanelChange = (panel: PanelId) => {
    setActivePanel(panel)
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/?reason=signed-out')
  }

  const handleAddLift = () => {
    setShowExercisePicker(true)
  }

  const handleExerciseSelect = async (exercise: any, config: any) => {
    await addTrackedLift({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      workingWeight: config.workingWeight,
      workingUnit: config.unit,
      goalWeight: config.goalWeight,
      goalDate: config.goalDate,
    })
    setShowExercisePicker(false)
    refreshLifts()
  }

  const handleLiftSelect = (liftId: string) => {
    setSelectedLiftId(liftId)
  }

  const handleOpenLiftTracker = (lift: ComponentTrackedLift) => {
    const exercise = EXERCISE_MAP.get(lift.exerciseId)
    if (exercise) {
      setLiftTrackerExercise({
        ...exercise,
        workingWeight: lift.workingWeight,
        workingUnit: lift.workingUnit,
        liftId: lift.id,
      })
      setShowLiftTracker(true)
    }
  }

  const handleLogSet = async (liftId: string, setData: Omit<SetLogEntry, 'id' | 'loggedAt' | 'estimated1RM' | 'isPR'>) => {
    await logSet({
      weight: setData.weight,
      reps: setData.reps,
      unit: setData.unit,
      rpe: setData.rpe,
      isWarmup: setData.isWarmup,
    })
    refreshLifts()
  }

  const handleUpdateGoal = async (liftId: string, goalWeight: number, goalDate?: string) => {
    // TODO: Implement goal update
    console.log('Update goal:', liftId, goalWeight, goalDate)
  }

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallengeId(challengeId)
  }

  const handleCreateSquad = async (data: any) => {
    await createSquad(data)
  }

  const handleSelectSquad = (squadId: string) => {
    setSelectedSquadId(squadId)
    // Switch to squad chat panel if needed
  }

  // Week planner handlers (placeholder)
  const handleScheduleWorkout = async (date: string, templateId: string, isRecurring: boolean) => {
    console.log('Schedule workout:', date, templateId, isRecurring)
  }

  const handleUpdateWorkout = async (workoutId: string, updates: Partial<ScheduledWorkout>) => {
    console.log('Update workout:', workoutId, updates)
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    console.log('Delete workout:', workoutId)
  }

  const handleStartWorkout = (workoutId: string) => {
    console.log('Start workout:', workoutId)
  }

  const handleCreateTemplate = () => {
    console.log('Create template')
  }

  // ==========================================================================
  // TRANSFORM DATA FOR COMPONENTS
  // ==========================================================================

  // Convert trackedLifts to ActiveLift format for sidebar
  const activeLiftsForSidebar: ActiveLift[] = trackedLifts.map(lift => ({
    id: lift.id,
    exerciseId: lift.exerciseId,
    exerciseName: lift.exerciseName,
    workingWeight: lift.workingWeight,
    workingUnit: (lift.workingUnit?.toLowerCase() || 'lbs') as 'lbs' | 'kg',
    lastSet: lift.lastSet?.formatted || 'No sets',
    oneRepMax: lift.oneRepMax || 0,
    goalWeight: lift.goalWeight,
    trend: lift.trend,
  }))

  // Transform for ActiveLiftTracker component (different interface)
  const liftsForTracker: ComponentTrackedLift[] = trackedLifts.map(lift => ({
    id: lift.id,
    exerciseId: lift.exerciseId,
    exerciseName: lift.exerciseName,
    workingWeight: lift.workingWeight,
    workingUnit: (lift.workingUnit?.toLowerCase() || 'lbs') as 'lbs' | 'kg',
    oneRepMax: lift.oneRepMax,
    goalWeight: lift.goalWeight,
    goalDate: lift.goalDate,
    trend: lift.trend,
    lastSet: lift.lastSet?.formatted || null,
    totalSets: lift.totalSets,
    lastWorkoutDate: lift.lastSet?.date || null,
    personalRecord: lift.bestSet?.estimated1RM || null,
    recentSets: [],  // TODO: Fetch from history endpoint
  }))

  // Convert squads for sidebar
  const squadsForSidebar: Squad[] = squads.map(s => ({
    id: s.id,
    name: s.name,
    memberCount: s.memberCount || 0,
    unreadCount: 0,
  }))

  // Already tracked exercise IDs for picker
  const alreadyTrackedIds = trackedLifts.map(l => l.exerciseId)

  // ==========================================================================
  // RENDER: MAIN CONTENT BASED ON SECTOR/PANEL
  // ==========================================================================

  const renderMainContent = () => {
    // NEXUS SECTOR
    if (activeSector === 'nexus') {
      if (activePanel === 'global-feed') {
        return (
          <GlobalChat
            currentUser={{
              id: user?.id || '',
              displayName: user?.display_name || 'User',
              avatarUrl: user?.avatar_url || null,
              role: user?.role || 'CLIENT',
            }}
          />
        )
      }

      if (activePanel === 'trainer-link') {
        return (
          <div className="h-full flex items-center justify-center bg-zinc-950">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Trainer Link</h2>
              <p className="text-slate-500">Connect with certified trainers</p>
              <p className="text-xs text-slate-600 mt-4">Coming soon...</p>
            </div>
          </div>
        )
      }

      if (activePanel === 'squads') {
        return (
          <SquadManager
            squads={squads}
            pendingInvites={pendingInvites}
            currentUserId={user?.id || ''}
            onCreateSquad={handleCreateSquad}
            onJoinSquad={joinSquad}
            onLeaveSquad={leaveSquad}
            onInviteUser={(squadId, email) => console.log('Invite:', squadId, email)}
            onAcceptInvite={acceptInvite}
            onDeclineInvite={declineInvite}
            onSelectSquad={handleSelectSquad}
          />
        )
      }
    }

    // FORGE SECTOR
    if (activeSector === 'forge') {
      if (activePanel === 'active-lifts') {
        return (
          <ActiveLiftTracker
            lifts={liftsForTracker}
            selectedLiftId={selectedLiftId}
            userBodyweight={userProfile.bodyweight}
            userGender={userProfile.gender}
            onSelectLift={handleLiftSelect}
            onAddLift={handleAddLift}
            onLogSet={handleLogSet}
            onUpdateGoal={handleUpdateGoal}
          />
        )
      }

      if (activePanel === 'week-planner') {
        return (
          <WeekPlanner
            templates={workoutTemplates}
            scheduledWorkouts={scheduledWorkouts}
            currentDate={new Date()}
            onScheduleWorkout={handleScheduleWorkout}
            onUpdateWorkout={handleUpdateWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onStartWorkout={handleStartWorkout}
            onCreateTemplate={handleCreateTemplate}
          />
        )
      }

      if (activePanel === 'challenges') {
        const selectedChallenge = challenges.find(c => c.id === selectedChallengeId)
        
        return (
          <div className="h-full flex flex-col bg-zinc-950">
            <div className="p-4 border-b border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                // CHALLENGES
              </div>
              <h1 className="mt-1 text-lg font-bold text-yellow-400 tracking-wide">
                {selectedChallenge ? selectedChallenge.name.toUpperCase() : 'SELECT A CHALLENGE'}
              </h1>
            </div>
            {selectedChallenge ? (
              <div className="flex-1 p-4">
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">
                    {selectedChallenge.category}
                  </div>
                  <h2 className="text-xl font-bold text-slate-200 mt-2">
                    {selectedChallenge.name}
                  </h2>
                  <p className="text-slate-400 mt-2">
                    {selectedChallenge.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div>
                      <div className="text-xs text-slate-500">Goal</div>
                      <div className="text-lg font-bold text-emerald-400">
                        {selectedChallenge.goal_value} {selectedChallenge.goal_unit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-slate-500">Select a challenge from the sidebar</p>
                </div>
              </div>
            )}
          </div>
        )
      }
    }

    // IDENTITY SECTOR
    if (activeSector === 'identity') {
      if (activePanel === 'profile') {
        return (
          <div className="h-full flex flex-col bg-zinc-950">
            <div className="p-4 border-b border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                // IDENTITY
              </div>
              <h1 className="mt-1 text-lg font-bold text-cyan-400 tracking-wide">
                PROFILE
              </h1>
            </div>
            <div className="flex-1 p-4">
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-3xl font-bold text-black">
                    {user?.display_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-200">
                      {user?.display_name || 'User'}
                    </h2>
                    <p className="text-slate-500">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full uppercase tracking-wider">
                      {user?.role || 'Client'}
                    </span>
                  </div>
                </div>

                {/* Profile Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Tracked Lifts</div>
                    <div className="text-2xl font-bold text-purple-400 mt-1">{trackedLifts.length}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Squads</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{squads.length}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Challenges</div>
                    <div className="text-2xl font-bold text-yellow-400 mt-1">{challenges.length}</div>
                  </div>
                </div>

                {/* Body Profile */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Body Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500">Bodyweight ({userProfile.unit})</label>
                      <input
                        type="number"
                        value={userProfile.bodyweight}
                        onChange={(e) => setUserProfile(p => ({ ...p, bodyweight: parseInt(e.target.value) || 0 }))}
                        className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Gender</label>
                      <select
                        value={userProfile.gender}
                        onChange={(e) => setUserProfile(p => ({ ...p, gender: e.target.value as 'male' | 'female' }))}
                        className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500/50 focus:outline-none"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      if (activePanel === 'friends') {
        return (
          <div className="h-full flex items-center justify-center bg-zinc-950">
            <div className="text-center">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Friends & Invites</h2>
              <p className="text-slate-500">Manage your connections</p>
              <p className="text-xs text-slate-600 mt-4">Coming soon...</p>
            </div>
          </div>
        )
      }

      if (activePanel === 'settings') {
        return (
          <div className="h-full flex items-center justify-center bg-zinc-950">
            <div className="text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Settings & Security</h2>
              <p className="text-slate-500">Customize your experience</p>
              <p className="text-xs text-slate-600 mt-4">Coming soon...</p>
            </div>
          </div>
        )
      }
    }

    return null
  }

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  if (authLoading || loadingChallenges) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-300 font-mono text-sm tracking-[0.2em] uppercase">
            Initializing command center...
          </p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <>
      <AppLayout
        west={
          <TriSectorSidebar
            operator={user}
            challenges={challenges}
            activeLifts={activeLiftsForSidebar}
            squads={squadsForSidebar}
            activeSector={activeSector}
            activePanel={activePanel}
            selectedChallengeId={selectedChallengeId}
            selectedLiftId={selectedLiftId}
            onSectorChange={handleSectorChange}
            onPanelChange={handlePanelChange}
            onChallengeSelect={handleChallengeSelect}
            onLiftSelect={handleLiftSelect}
            onAddLift={handleAddLift}
            onCreateSquad={() => setActivePanel('squads')}
            onLogout={handleLogout}
          />
        }
      >
        {renderMainContent()}
      </AppLayout>

      {/* ================================================================== */}
      {/* MODALS */}
      {/* ================================================================== */}

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {showExercisePicker && (
          <ExercisePicker
            isOpen={showExercisePicker}
            onClose={() => setShowExercisePicker(false)}
            onSelect={handleExerciseSelect}
            alreadyTracked={alreadyTrackedIds}
          />
        )}
      </AnimatePresence>

      {/* Lift Tracker Modal */}
      <AnimatePresence>
        {showLiftTracker && liftTrackerExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-xl overflow-hidden">
              <LiftTracker
                exercise={liftTrackerExercise}
                userBodyWeight={userProfile.bodyweight}
                userGender={userProfile.gender}
                previousBest={null}
                workingWeight={liftTrackerExercise.workingWeight}
                workingUnit={liftTrackerExercise.workingUnit}
                onSaveSession={async (sessionData) => {
                  await saveSession(sessionData.notes)
                  setShowLiftTracker(false)
                  setLiftTrackerExercise(null)
                  refreshLifts()
                }}
                onClose={() => {
                  setShowLiftTracker(false)
                  setLiftTrackerExercise(null)
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
