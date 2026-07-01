'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChallengeRepository } from '@/repositories/ChallengeRepository'
import type { Challenge } from '@/types/fitness'
import { useToast } from '@/hooks/useToast'
import { mapApiErrorToToast } from '@/lib/apiFeedback'

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ChallengeRepository.list()
      setChallenges(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch challenges')
      toast(mapApiErrorToToast(err, { action: 'load challenges' }))
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const createChallenge = useCallback(async (
    challengeData: Omit<Challenge, 'id' | 'created_by' | 'participants' | 'created_at'>
  ) => {
    try {
      const newChallenge = await ChallengeRepository.create(challengeData)
      setChallenges(prev => [newChallenge, ...prev])
      return newChallenge
    } catch (err: any) {
      setError(err?.message || 'Failed to create challenge')
      toast(mapApiErrorToToast(err, { action: 'create this challenge' }))
      throw err
    }
  }, [toast])

  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      const updatedChallenge = await ChallengeRepository.join(challengeId)
      setChallenges(prev => prev.map(challenge => 
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge
      ))
      return updatedChallenge
    } catch (err: any) {
      setError(err?.message || 'Failed to join challenge')
      toast(mapApiErrorToToast(err, { action: 'join this challenge' }))
      throw err
    }
  }, [toast])

  const leaveChallenge = useCallback(async (challengeId: string) => {
    try {
      const updatedChallenge = await ChallengeRepository.leave(challengeId)
      setChallenges(prev => prev.map(challenge => 
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge
      ))
      return updatedChallenge
    } catch (err: any) {
      setError(err?.message || 'Failed to leave challenge')
      toast(mapApiErrorToToast(err, { action: 'leave this challenge' }))
      throw err
    }
  }, [toast])

  return {
    challenges,
    loading,
    error,
    fetchChallenges,
    createChallenge,
    joinChallenge,
    leaveChallenge,
  }
}
