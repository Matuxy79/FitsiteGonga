'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CHALLENGE_CATEGORIES } from '@/types/fitness'
import type { Challenge, User } from '@/types/fitness'

interface SidebarProps {
  selectedCategory?: string
  onCategorySelect?: (category: string) => void
  challenges?: Challenge[]
  userRole?: User['role']
}

const challengeCategories = [
  { id: 'strength', name: 'Strength Training', icon: '💪', color: CHALLENGE_CATEGORIES.strength.color },
  { id: 'cardio', name: 'Cardio & Endurance', icon: '🏃', color: CHALLENGE_CATEGORIES.cardio.color },
  { id: 'nutrition', name: 'Nutrition Goals', icon: '🥗', color: CHALLENGE_CATEGORIES.nutrition.color },
  { id: 'custom', name: 'Custom Challenges', icon: '🎯', color: CHALLENGE_CATEGORIES.custom.color },
]

export function Sidebar({ 
  selectedCategory = 'strength', 
  onCategorySelect = () => {},
  challenges = [],
  userRole = 'client'
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['strength'])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const getChallengesForCategory = (categoryId: string) => {
    return challenges.filter(challenge => challenge.category === categoryId)
  }

  return (
    <div className="w-60 bg-discord-darker flex flex-col">
      {/* Server/Group Header */}
      <div className="h-12 px-4 flex items-center border-b border-discord-dark">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="font-semibold text-white">FitsiteGonga</span>
        </div>
      </div>

      {/* Challenge Categories */}
      <div className="flex-1 overflow-y-auto py-2">
        {challengeCategories.map((category) => {
          const categoryChallenges = getChallengesForCategory(category.id)
          const isExpanded = expandedCategories.includes(category.id)
          const isSelected = selectedCategory === category.id

          return (
            <div key={category.id} className="px-2 mb-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between px-2 py-1 rounded text-sm font-medium hover:bg-discord-dark transition-colors ${
                  isSelected ? 'text-white' : 'text-discord-muted hover:text-discord-light'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  {categoryChallenges.length > 0 && (
                    <span className="bg-discord-medium text-discord-muted text-xs px-1.5 py-0.5 rounded">
                      {categoryChallenges.length}
                    </span>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </button>

              {/* Challenge List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 space-y-1 mt-1">
                      {categoryChallenges.map((challenge) => (
                        <button
                          key={challenge.id}
                          onClick={() => onCategorySelect(challenge.id)}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 rounded text-sm text-discord-muted hover:text-discord-light hover:bg-discord-dark transition-colors group"
                        >
                          <span className="text-xs">#</span>
                          <span className="truncate">{challenge.name}</span>
                          {challenge.participants.length > 0 && (
                            <span className="text-xs bg-discord-medium px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {challenge.participants.length}
                            </span>
                          )}
                        </button>
                      ))}
                      
                      {/* Add Challenge Button (for trainers) */}
                      {userRole === 'trainer' && (
                        <button className="w-full flex items-center space-x-2 px-2 py-1.5 rounded text-sm text-discord-muted hover:text-discord-light hover:bg-discord-dark transition-colors">
                          <span className="text-xs">+</span>
                          <span>Create Challenge</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* User Status */}
      <div className="p-4 border-t border-discord-dark">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-discord-accent rounded-full flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-discord-success rounded-full border-2 border-discord-darker"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">User</div>
            <div className="text-xs text-discord-muted">Online</div>
          </div>
        </div>
      </div>
    </div>
  )
}
