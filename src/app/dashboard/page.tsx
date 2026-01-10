'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { HudHeader } from '@/components/hud/HudHeader'
import { HudSidebar } from '@/components/hud/HudSidebar'
import { ChallengeChannel } from '@/components/challenges/ChallengeChannel'
import { useChallengeController } from '@/controllers/useChallengeController'
import { useProgressController } from '@/controllers/useProgressController'
import { useAuth } from '@/hooks/useAuth'
import type { Challenge } from '@/types/fitness'

const CATEGORY_ORDER: Challenge['category'][] = ['strength', 'cardio', 'nutrition', 'custom']

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<Challenge['category']>('strength')
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

  // Keep selection stable as challenge data loads/changes.
  useEffect(() => {
    if (loadingChallenges) return
    if (challenges.length === 0) return

    const categoriesWithChallenges = CATEGORY_ORDER.filter(category =>
      challenges.some(challenge => challenge.category === category)
    )

    // If selected category has no challenges, fall back to first populated sector.
    const fallbackCategory = categoriesWithChallenges[0] || 'strength'
    if (!challenges.some(challenge => challenge.category === selectedCategory)) {
      setSelectedCategory(fallbackCategory)
      setSelectedId(null)
    }
  }, [loadingChallenges, challenges, selectedCategory])

  useEffect(() => {
    if (loadingChallenges) return

    const challengesInSector = challenges.filter(challenge => challenge.category === selectedCategory)
    if (challengesInSector.length === 0) {
      setSelectedId(null)
      return
    }

    if (selectedId && challengesInSector.some(challenge => challenge.id === selectedId)) return
    setSelectedId(challengesInSector[0].id)
  }, [loadingChallenges, challenges, selectedCategory, selectedId])

  const selectedChallenge: Challenge | null = useMemo(() => {
    if (!selectedId) return null
    return challenges.find(challenge => challenge.id === selectedId) || null
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

  const handleSelectCategory = (category: Challenge['category']) => {
    setSelectedCategory(category)
    const next = challenges.find(challenge => challenge.category === category)?.id || null
    setSelectedId(next)
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/?reason=signed-out')
  }

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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-300 font-mono text-sm tracking-[0.2em] uppercase">
            Booting command center...
          </p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <AppLayout
      west={
        <HudSidebar
          operator={user}
          challenges={challenges}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          selectedChallengeId={selectedChallenge?.id || null}
          onSelectChallenge={id => setSelectedId(id)}
          onLogout={handleLogout}
        />
      }
      header={<HudHeader operator={user} activeChallenge={selectedChallenge || undefined} />}
    >
      <div className="h-full">
        <ChallengeChannel
          challenge={selectedChallenge || undefined}
          userProgress={progressLogs}
          userGoal={selectedChallenge?.goal_value}
          onLogProgress={handleLogProgress}
          canEdit={true}
          currentUser={user}
        />
      </div>
    </AppLayout>
  )
}
