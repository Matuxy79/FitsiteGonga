'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/lib/state/workoutStore';
import { useLiftsStore } from '@/lib/state/liftsStore';
import { SessionLogger } from '@/components/workouts/SessionLogger';
import { WorkoutHistory } from '@/components/workouts/WorkoutHistory';

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const { activeSession, startSession, endSession } = useWorkoutStore();
  const { fetchMovements, fetchExercises } = useLiftsStore();
  const router = useRouter();

  useEffect(() => {
    // Load movements and exercises on mount
    fetchMovements();
    fetchExercises();
  }, [fetchMovements, fetchExercises]);

  const handleStartWorkout = async () => {
    await startSession();
    setActiveTab('active');
  };

  const handleEndWorkout = async () => {
    await endSession();
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600 mt-2">Track your training sessions and progress</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Workout
                {activeSession && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    In Progress
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                History
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'active' ? (
          <div className="space-y-6">
            {activeSession ? (
              <SessionLogger session={activeSession} onEndWorkout={handleEndWorkout} />
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg
                    className="h-12 w-12 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active workout</h3>
                <p className="text-gray-600 mb-6">
                  Start a new workout session to begin tracking your training
                </p>
                <button
                  onClick={handleStartWorkout}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start New Workout
                </button>
              </div>
            )}
          </div>
        ) : (
          <WorkoutHistory />
        )}
      </div>
    </div>
  );
}
