'use client'

import { useEffect, useState } from 'react'
import { ChallengeRepository } from '@/repositories/ChallengeRepository'
import type { Challenge } from '@/types/fitness'
import { toChallengeVM, type ChallengeViewModel } from '@/viewmodels'
import { useToast } from '@/hooks/useToast'
import { mapApiErrorToToast } from '@/lib/apiFeedback'

export function useChallengeController() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const { toast } = useToast()

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await ChallengeRepository.list()
        setChallenges(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load challenges')
        toast(mapApiErrorToToast(e, { action: 'load challenges' }))
      } finally {
        setLoading(false)
      }
    })()
  }, [toast])

  const viewModels: ChallengeViewModel[] = challenges.map(toChallengeVM)

  return { loading, error, challenges, viewModels }
}


