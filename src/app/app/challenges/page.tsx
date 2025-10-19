'use client';

import { useState } from 'react';
import { CreateChallengeModal } from '@/components/challenges/CreateChallengeModal';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';

interface Challenge {
  id: string;
  name: string;
  description?: string;
  category: 'strength' | 'cardio' | 'nutrition' | 'custom';
  type: 'duration' | 'repetition' | 'distance' | 'custom';
  goal_value: number;
  goal_unit: string;
  start_date: string;
  end_date: string;
  participants: string[];
  created_at: string;
}

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<
    'all' | 'strength' | 'cardio' | 'nutrition' | 'custom'
  >('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set());

  // Mock challenges for now
  const mockChallenges: Challenge[] = [
    {
      id: '1',
      name: '30-Day Push-up Challenge',
      description: 'Complete 100 push-ups every day for 30 days',
      category: 'strength',
      type: 'repetition',
      goal_value: 100,
      goal_unit: 'reps',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      participants: ['user1', 'user2'],
      created_at: '2024-12-01',
    },
    {
      id: '2',
      name: '5K Running Challenge',
      description: 'Run 5 kilometers every week',
      category: 'cardio',
      type: 'distance',
      goal_value: 5,
      goal_unit: 'km',
      start_date: '2025-01-15',
      end_date: '2025-02-15',
      participants: ['user3'],
      created_at: '2024-12-15',
    },
    {
      id: '3',
      name: 'Healthy Eating Streak',
      description: 'Eat 5 servings of vegetables daily',
      category: 'nutrition',
      type: 'repetition',
      goal_value: 5,
      goal_unit: 'servings',
      start_date: '2025-01-20',
      end_date: '2025-02-20',
      participants: ['user1', 'user4', 'user5'],
      created_at: '2024-12-20',
    },
  ];

  const filteredChallenges =
    activeTab === 'all'
      ? mockChallenges
      : mockChallenges.filter(challenge => challenge.category === activeTab);

  const handleCreateChallenge = async (challengeData: any) => {
    // Mock implementation - in real app, this would call the API
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      ...challengeData,
      participants: [],
      created_at: new Date().toISOString(),
    };

    setChallenges(prev => [newChallenge, ...prev]);
    console.log('Creating challenge:', challengeData);
  };

  const handleJoinChallenge = (challengeId: string) => {
    setJoinedChallenges(prev => new Set(prev).add(challengeId));
    console.log('Joining challenge:', challengeId);
  };

  const handleLeaveChallenge = (challengeId: string) => {
    setJoinedChallenges(prev => {
      const newSet = new Set(prev);
      newSet.delete(challengeId);
      return newSet;
    });
    console.log('Leaving challenge:', challengeId);
  };

  const handleViewDetails = (challengeId: string) => {
    console.log('Viewing challenge details:', challengeId);
    // In real app, this would navigate to challenge details page
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Challenges</h1>
            <p className="text-gray-600">
              Join fitness challenges and compete with others to stay motivated.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Challenge
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'all', name: 'All Challenges', icon: '🏆' },
              { id: 'strength', name: 'Strength', icon: '💪' },
              { id: 'cardio', name: 'Cardio', icon: '🏃' },
              { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
              { id: 'custom', name: 'Custom', icon: '🎯' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🏆</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'all'
                  ? 'Create your first challenge to get started!'
                  : `No ${activeTab} challenges available. Create one to get started!`}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Challenge
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isJoined={joinedChallenges.has(challenge.id)}
                  onJoin={() => handleJoinChallenge(challenge.id)}
                  onLeave={() => handleLeaveChallenge(challenge.id)}
                  onViewDetails={() => handleViewDetails(challenge.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateChallenge}
      />
    </div>
  );
}
