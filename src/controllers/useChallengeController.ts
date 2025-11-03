'use client'

import { useEffect, useState } from 'react'
import { ChallengeRepository } from '@/repositories/ChallengeRepository'
import type { Challenge } from '@/types/fitness'
import { toChallengeVM, type ChallengeViewModel } from '@/viewmodels'

export function useChallengeController() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await ChallengeRepository.list()
        setChallenges(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load challenges')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const viewModels: ChallengeViewModel[] = challenges.map(toChallengeVM)

  return { loading, error, challenges, viewModels }
}


