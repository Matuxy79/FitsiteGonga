'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { ChallengeChannel } from '@/components/challenges/ChallengeChannel'
import type { User, Challenge, ProgressLog, UserAchievement } from '@/types/fitness'

// Mock data for demonstration
const mockChallenges: Challenge[] = [
  {
    id: '1',
    name: '2-Hour Gym Challenge',
    description: 'Spend 2 hours in the gym this week building strength and endurance',
    category: 'strength',
    type: 'duration',
    goal_value: 120,
    goal_unit: 'minutes',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'trainer-1',
    is_active: true,
    participants: ['user-1', 'user-2', 'user-3'],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Daily Steps Goal',
    description: 'Walk 10,000 steps every day for a week',
    category: 'cardio',
    type: 'repetition',
    goal_value: 7,
    goal_unit: 'days',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'trainer-1',
    is_active: true,
    participants: ['user-1', 'user-2'],
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Meal Prep Master',
    description: 'Prepare healthy meals for the entire week',
    category: 'nutrition',
    type: 'custom',
    goal_value: 1,
    goal_unit: 'week',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'trainer-1',
    is_active: true,
    participants: ['user-1'],
    created_at: new Date().toISOString()
  }
]

const mockProgressLogs: ProgressLog[] = [
  {
    id: '1',
    user_id: 'user-1',
    challenge_id: '1',
    value: 45,
    unit: 'minutes',
    notes: 'Great workout today! Focused on upper body strength training.',
    logged_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-1',
      email: 'user@example.com',
      display_name: 'John Doe',
      role: 'client',
      fitness_level: 'intermediate',
      goals: ['strength', 'endurance'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    user_id: 'user-2',
    challenge_id: '1',
    value: 60,
    unit: 'minutes',
    notes: 'Cardio session - feeling strong!',
    logged_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-2',
      email: 'user2@example.com',
      display_name: 'Jane Smith',
      role: 'client',
      fitness_level: 'advanced',
      goals: ['cardio', 'strength'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
]

const mockAchievements: UserAchievement[] = [
  {
    id: '1',
    user_id: 'user-1',
    achievement_id: '1',
    earned_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    progress_value: 1,
    achievement: {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first workout',
      icon: '👶',
      tier: 'bronze',
      category: 'workout',
      criteria: { workout_count: 1 },
      created_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    user_id: 'user-1',
    achievement_id: '2',
    earned_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    progress_value: 5,
    achievement: {
      id: '2',
      name: 'Getting Started',
      description: 'Complete 5 workouts',
      icon: '🏃',
      tier: 'bronze',
      category: 'workout',
      criteria: { workout_count: 5 },
      created_at: new Date().toISOString()
    }
  }
]

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(mockChallenges[0])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/')
        return
      }
      
      // Create user object from auth user
      const userObj: User = {
        id: authUser.id,
        email: authUser.email || '',
        display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
        avatar_url: authUser.user_metadata?.avatar_url,
        role: 'client',
        fitness_level: 'beginner',
        goals: [],
        created_at: authUser.created_at,
        updated_at: authUser.updated_at || authUser.created_at
      }
      
      setUser(userObj)
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleLogProgress = async (value: number, notes?: string) => {
    if (!selectedChallenge || !user) return

    // In a real app, this would call the API
    console.log('Logging progress:', { value, notes, challenge: selectedChallenge.id, user: user.id })
    
    // For demo, we'll just show a success message
    alert(`Progress logged: ${value} ${selectedChallenge.goal_unit}`)
  }

  const handleChallengeSelect = (challengeId: string) => {
    const challenge = mockChallenges.find(c => c.id === challengeId)
    if (challenge) {
      setSelectedChallenge(challenge)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-accent mx-auto mb-4"></div>
          <p className="text-discord-light">Loading your fitness dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Get progress for selected challenge
  const challengeProgress = selectedChallenge 
    ? mockProgressLogs.filter(log => log.challenge_id === selectedChallenge.id)
    : []

  const userProgress = challengeProgress.reduce((sum, log) => sum + log.value, 0)

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Sidebar with challenges */}
        <div className="w-60 bg-discord-darker border-r border-discord-dark p-4">
          <h2 className="text-white font-semibold mb-4">Active Challenges</h2>
          <div className="space-y-2">
            {mockChallenges.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedChallenge?.id === challenge.id
                    ? 'bg-discord-accent text-white'
                    : 'bg-discord-dark hover:bg-discord-medium text-discord-light'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {challenge.category === 'strength' && '💪'}
                    {challenge.category === 'cardio' && '🏃'}
                    {challenge.category === 'nutrition' && '🥗'}
                    {challenge.category === 'custom' && '🎯'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{challenge.name}</div>
                    <div className="text-xs opacity-75">
                      {challenge.participants.length} participants
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <ChallengeChannel
            challenge={selectedChallenge}
            userProgress={challengeProgress}
            userGoal={selectedChallenge?.goal_value}
            onLogProgress={handleLogProgress}
            canEdit={true}
            currentUser={user}
          />
        </div>
      </div>
    </AppLayout>
  )
}