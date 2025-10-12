'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Challenge } from '@/types/fitness'

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/challenges')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch challenges')
      }

      setChallenges(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching challenges:', err)
    } finally {
      setLoading(false)
    }
  }

  const createChallenge = async (challengeData: Omit<Challenge, 'id' | 'created_by' | 'participants' | 'created_at'>) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challengeData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create challenge')
      }

      // Add the new challenge to our list
      setChallenges(prev => [result.data, ...prev])
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge')
      throw err
    }
  }

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join challenge')
      }

      // Update the challenge in our list
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === challengeId
            ? { ...challenge, participants: [...challenge.participants, result.userId] }
            : challenge
        )
      )

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge')
      throw err
    }
  }

  const leaveChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/leave`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to leave challenge')
      }

      // Update the challenge in our list
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === challengeId
            ? { ...challenge, participants: challenge.participants.filter(id => id !== result.userId) }
            : challenge
        )
      )

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave challenge')
      throw err
    }
  }

  return {
    challenges,
    loading,
    error,
    fetchChallenges,
    createChallenge,
    joinChallenge,
    leaveChallenge
  }
}
