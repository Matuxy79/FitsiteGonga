'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressFeed } from '../progress/ProgressFeed';
import { ProgressInput } from '../progress/ProgressInput';
import { ChallengeCard } from './ChallengeCard';
import type { Challenge, ProgressLog } from '@/types/fitness';
import type { Profile } from '@/types/training';

interface ChallengeChannelProps {
  challenge?: Challenge;
  userProgress?: ProgressLog[];
  userGoal?: number;
  onLogProgress?: (data: {
    challenge_id: string;
    value: number;
    unit: string;
    notes?: string;
  }) => void;
  canEdit?: boolean;
  currentUser?: { id: string; display_name: string; avatar_url?: string };
}

export function ChallengeChannel({
  challenge,
  userProgress = [],
  userGoal = 100,
  onLogProgress = () => {},
  canEdit = false,
  currentUser,
}: ChallengeChannelProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'details'>('progress');

  if (!challenge) {
    return (
      <div className="flex-1 flex items-center justify-center bg-discord-dark">
        <div className="text-center">
          <div className="text-6xl mb-4">💪</div>
          <h2 className="text-xl font-semibold text-white mb-2">Welcome to FitsiteGonga</h2>
          <p className="text-discord-muted">
            Select a challenge from the sidebar to get started with your fitness journey!
          </p>
        </div>
      </div>
    );
  }

  const currentProgress = userProgress.reduce((sum, log) => sum + log.value, 0);
  const progressPercentage = userGoal > 0 ? (currentProgress / userGoal) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col bg-discord-dark">
      {/* Challenge Header */}
      <div className="p-6 border-b border-discord-darker">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">
                {challenge.category === 'strength' && '💪'}
                {challenge.category === 'cardio' && '🏃'}
                {challenge.category === 'nutrition' && '🥗'}
                {challenge.category === 'custom' && '🎯'}
              </div>
              <h1 className="text-2xl font-bold text-white">{challenge.name}</h1>
              <span className="bg-discord-accent text-white text-xs px-2 py-1 rounded-full">
                {challenge.participants.length} participants
              </span>
            </div>

            {challenge.description && (
              <p className="text-discord-light mb-4">{challenge.description}</p>
            )}

            {/* Progress Bar */}
            <div className="bg-discord-darker rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-discord-muted">Your Progress</span>
                <span className="text-sm text-white font-medium">
                  {currentProgress}/{userGoal} {challenge.goal_unit}
                </span>
              </div>
              <div className="w-full h-3 bg-discord-dark rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-discord-accent to-discord-success rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="text-right mt-1">
                <span className="text-xs text-discord-muted">
                  {Math.round(progressPercentage)}% complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-discord-darker">
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'progress'
              ? 'text-white border-b-2 border-discord-accent'
              : 'text-discord-muted hover:text-discord-light'
          }`}
        >
          Progress Feed
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'text-white border-b-2 border-discord-accent'
              : 'text-discord-muted hover:text-discord-light'
          }`}
        >
          Challenge Details
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'progress' ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {/* Progress Input */}
              <div className="p-4 border-b border-discord-darker">
                <ProgressInput challengeId={challenge.id} onSubmit={onLogProgress} />
              </div>

              {/* Progress Feed */}
              <div className="flex-1 overflow-y-auto">
                <ProgressFeed
                  challengeId={challenge?.id}
                  entries={userProgress || []}
                  onReact={(entryId, reaction) => {
                    console.log('React to entry:', entryId, reaction);
                  }}
                  onComment={(entryId, comment) => {
                    console.log('Comment on entry:', entryId, comment);
                  }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-6 overflow-y-auto"
            >
              <ChallengeCard
                challenge={challenge}
                isJoined={false}
                onJoin={() => {
                  console.log('Join challenge');
                }}
                onLeave={() => {
                  console.log('Leave challenge');
                }}
                onViewDetails={() => {
                  console.log('View challenge details');
                }}
              />

              {/* Additional Challenge Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-discord-darker rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Challenge Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-discord-muted">Start Date:</span>
                      <span className="text-white">
                        {new Date(challenge.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-discord-muted">End Date:</span>
                      <span className="text-white">
                        {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-discord-muted">Duration:</span>
                      <span className="text-white">
                        {Math.ceil(
                          (new Date(challenge.end_date).getTime() -
                            new Date(challenge.start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-discord-darker rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Goal Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-discord-muted">Target:</span>
                      <span className="text-white">
                        {challenge.goal_value} {challenge.goal_unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-discord-muted">Type:</span>
                      <span className="text-white capitalize">{challenge.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-discord-muted">Category:</span>
                      <span className="text-white capitalize">{challenge.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
