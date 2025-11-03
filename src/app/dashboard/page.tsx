'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { ChallengeChannel } from '@/components/challenges/ChallengeChannel'
import ServerList from '@/components/navigation/ServerList'
import ChannelList from '@/components/navigation/ChannelList'
import { useChallengeController } from '@/controllers/useChallengeController'
import { useProgressController } from '@/controllers/useProgressController'
import type { User, Challenge, ProgressLog } from '@/types/fitness'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const { loading: loadingChallenges, viewModels, challenges } = useChallengeController()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  // Progress controller for the selected challenge
  const {
    loading: loadingProgress,
    progressLogs,
    viewModels: progressViewModels,
    logProgress,
    loadProgress
  } = useProgressController(selectedId || undefined)

  const selectedChallenge: Challenge | null = useMemo(() => {
    const id = selectedId || challenges[0]?.id
    if (!id) return null
    return challenges.find(c => c.id === id) || null
  }, [selectedId, challenges])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/')
        return
      }
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

  const categories = useMemo(() => {
    // Group challenges by category for ChannelList
    const byCat: Record<string, Challenge[]> = { strength: [], cardio: [], nutrition: [], custom: [] }
    challenges.forEach(c => { (byCat[c.category] ||= []).push(c) })
    return [
      { id: 'strength', name: 'Strength', icon: '💪', challenges: byCat.strength },
      { id: 'cardio', name: 'Cardio', icon: '🏃', challenges: byCat.cardio },
      { id: 'nutrition', name: 'Nutrition', icon: '🥗', challenges: byCat.nutrition },
      { id: 'custom', name: 'Custom', icon: '🎯', challenges: byCat.custom },
    ]
  }, [challenges])

  // Load progress when challenge changes
  useEffect(() => {
    if (selectedChallenge?.id) {
      loadProgress(selectedChallenge.id)
    }
  }, [selectedChallenge?.id, loadProgress])

  const handleLogProgress = async (value: number, notes?: string) => {
    if (!selectedChallenge || !user) return
    
    try {
      await logProgress({
        challenge_id: selectedChallenge.id,
        value,
        unit: selectedChallenge.goal_unit,
        notes,
      })
    } catch (error) {
      console.error('Failed to log progress:', error)
    }
  }

  if (loading || loadingChallenges) {
    return (
      <div className="min-h-screen discord-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-accent mx-auto mb-4"></div>
          <p className="text-discord-light">Loading your fitness dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <AppLayout>
      <div className="flex h-full">
        <ServerList />
        <ChannelList
          categories={categories}
          selectedChannelId={selectedChallenge?.id}
          onSelect={(id) => setSelectedId(id)}
        />
        <div className="flex-1">
          <ChallengeChannel
            challenge={selectedChallenge || undefined}
            userProgress={progressLogs}
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