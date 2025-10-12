'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Challenge } from '@/types/fitness'

interface ProgressInputProps {
  challenge: Challenge
  onLogProgress: (value: number, notes?: string) => void
  disabled?: boolean
}

export function ProgressInput({ challenge, onLogProgress, disabled = false }: ProgressInputProps) {
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onLogProgress(Number(value), notes || undefined)
      setValue('')
      setNotes('')
    } catch (error) {
      console.error('Failed to log progress:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickValues = challenge.type === 'duration' 
    ? [15, 30, 45, 60, 90] 
    : challenge.type === 'distance'
    ? [1, 2, 3, 5, 10]
    : [5, 10, 15, 20, 25]

  return (
    <div className="bg-discord-darker rounded-lg border border-discord-dark p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Progress Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Log Progress ({challenge.goal_unit})
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${challenge.goal_unit}...`}
              disabled={disabled || isSubmitting}
              className="flex-1 bg-discord-dark border border-discord-medium rounded px-3 py-2 text-discord-light placeholder-discord-muted focus:outline-none focus:border-discord-accent disabled:opacity-50 disabled:cursor-not-allowed"
              min="0"
              step="0.1"
            />
            <button
              type="submit"
              disabled={disabled || isSubmitting || !value || Number(value) <= 0}
              className="bg-discord-accent hover:bg-discord-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
            >
              {isSubmitting ? 'Logging...' : 'Log Progress'}
            </button>
          </div>
        </div>

        {/* Quick Values */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Quick Values
          </label>
          <div className="flex space-x-2">
            {quickValues.map((quickValue) => (
              <button
                key={quickValue}
                type="button"
                onClick={() => setValue(quickValue.toString())}
                disabled={disabled || isSubmitting}
                className="bg-discord-medium hover:bg-discord-medium/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
              >
                {quickValue}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any notes about your workout..."
            disabled={disabled || isSubmitting}
            rows={2}
            className="w-full bg-discord-dark border border-discord-medium rounded px-3 py-2 text-discord-light placeholder-discord-muted focus:outline-none focus:border-discord-accent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Progress Stats */}
        <div className="flex items-center justify-between text-sm text-discord-muted">
          <span>Challenge: {challenge.name}</span>
          <span>Target: {challenge.goal_value} {challenge.goal_unit}</span>
        </div>
      </form>
    </div>
  )
}
