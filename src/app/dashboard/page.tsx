'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { ChallengeChannel } from '@/components/challenges/ChallengeChannel'
import ServerList from '@/components/navigation/ServerList'
import ChannelList from '@/components/navigation/ChannelList'
import { useChallengeController } from '@/controllers/useChallengeController'
import { useProgressController } from '@/controllers/useProgressController'
import { useAuth } from '@/hooks/useAuth'
import type { Challenge } from '@/types/fitness'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  const { loading: loadingChallenges, challenges } = useChallengeController()

  const {
    loading: loadingProgress,
    progressLogs,
    logProgress,
    loadProgress
  } = useProgressController(selectedId || undefined)

  useEffect(() => {
    if (!authLoading && !user) {
      const hasStoredToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken')
      const reason = hasStoredToken ? 'session-expired' : 'login-required'
      router.replace(`/?reason=${reason}`)
    }
  }, [authLoading, user, router])

  const selectedChallenge: Challenge | null = useMemo(() => {
    const id = selectedId || challenges[0]?.id
    if (!id) return null
    return challenges.find(c => c.id === id) || null
  }, [selectedId, challenges])

  const categories = useMemo(() => {
    const grouped: Record<string, Challenge[]> = {
      strength: [],
      cardio: [],
      nutrition: [],
      custom: []
    }
    challenges.forEach((challenge) => {
      grouped[challenge.category]?.push(challenge)
    })
    return [
      { id: 'strength', name: 'Strength', icon: "dY'¦", challenges: grouped.strength },
      { id: 'cardio', name: 'Cardio', icon: 'dY?ź', challenges: grouped.cardio },
      { id: 'nutrition', name: 'Nutrition', icon: 'dYť-', challenges: grouped.nutrition },
      { id: 'custom', name: 'Custom', icon: 'dYZ_', challenges: grouped.custom },
    ]
  }, [challenges])

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

  if (authLoading || loadingChallenges) {
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
