'use client';

import { useState, useEffect } from 'react';
import { PRCard } from '@/components/metrics/PRCard';
import { GoalProgress } from '@/components/metrics/GoalProgress';
import { VolumeChart } from '@/components/metrics/VolumeChart';
import { UserPR, LiftGoal } from '@/types/training';

export default function MetricsPage() {
  const [prs, setPRs] = useState<UserPR[]>([]);
  const [liftGoals, setLiftGoals] = useState<LiftGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch PRs and lift goals in parallel
        const [prsResponse, goalsResponse] = await Promise.all([
          fetch('/api/prs'),
          fetch('/api/lift-goals'),
        ]);

        const prsData = await prsResponse.json();
        const goalsData = await goalsResponse.json();

        if (!prsResponse.ok) {
          throw new Error(prsData.error || 'Failed to fetch PRs');
        }

        if (!goalsResponse.ok) {
          throw new Error(goalsData.error || 'Failed to fetch lift goals');
        }

        setPRs(prsData.data || []);
        setLiftGoals(goalsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading metrics...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading metrics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Training Metrics</h1>
          <p className="text-gray-600 mt-2">Track your progress and performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Records */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Records</h2>

              {prs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No PRs yet</h3>
                  <p className="text-gray-600">
                    Complete some workouts to start tracking your personal records
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prs.map(pr => (
                    <PRCard key={pr.movement_id} pr={pr} />
                  ))}
                </div>
              )}
            </div>

            {/* Lift Goals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Lift Goals</h2>

              {liftGoals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
                  <p className="text-gray-600">Set some lift goals to track your progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liftGoals.map(goal => (
                    <GoalProgress key={goal.id} goal={goal} prs={prs} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Volume Chart */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Training Volume</h2>
              <VolumeChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
