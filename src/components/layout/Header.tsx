'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Challenge } from '@/types/fitness'

interface HeaderProps {
  currentChallenge?: Challenge
  userProgress?: number
  userGoal?: number
}

export function Header({ currentChallenge, userProgress = 0, userGoal = 100 }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const progressPercentage = userGoal > 0 ? (userProgress / userGoal) * 100 : 0

  return (
    <div className="h-12 bg-discord-dark border-b border-discord-darker px-4 flex items-center justify-between">
      {/* Left side - Challenge info */}
      <div className="flex items-center space-x-4">
        {currentChallenge ? (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-discord-muted">#</span>
              <span className="text-white font-medium">{currentChallenge.name}</span>
            </div>
            
            {/* Progress bar */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-32 h-2 bg-discord-darker rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-discord-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs text-discord-muted">
                {userProgress}/{userGoal} {currentChallenge.goal_unit}
              </span>
            </div>
          </>
        ) : (
          <span className="text-discord-muted">Select a challenge to get started</span>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        {/* Search */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 text-discord-muted hover:text-discord-light hover:bg-discord-darker rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="p-2 text-discord-muted hover:text-discord-light hover:bg-discord-darker rounded transition-colors relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2z" />
          </svg>
          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-discord-error rounded-full flex items-center justify-center">
            <span className="text-xs text-white">3</span>
          </div>
        </button>

        {/* Settings */}
        <button className="p-2 text-discord-muted hover:text-discord-light hover:bg-discord-darker rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Search overlay */}
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-12 right-4 w-80 bg-discord-darker border border-discord-dark rounded-lg shadow-lg z-50"
        >
          <div className="p-4">
            <input
              type="text"
              placeholder="Search challenges, progress, or users..."
              className="w-full bg-discord-dark border border-discord-medium rounded px-3 py-2 text-discord-light placeholder-discord-muted focus:outline-none focus:border-discord-accent"
              autoFocus
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}
