'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPR, LiftGoal, WorkoutSession } from '@/types/training';
import { formatWeight } from '@/lib/strength';

export default function Dashboard() {
  const [prs, setPRs] = useState<UserPR[]>([]);
  const [liftGoals, setLiftGoals] = useState<LiftGoal[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch PRs, lift goals, and recent workouts in parallel
        const [prsResponse, goalsResponse, workoutsResponse] = await Promise.all([
          fetch('/api/prs'),
          fetch('/api/lift-goals'),
          fetch('/api/workouts?limit=5'),
        ]);

        const prsData = await prsResponse.json();
        const goalsData = await goalsResponse.json();
        const workoutsData = await workoutsResponse.json();

        if (!prsResponse.ok) {
          throw new Error(prsData.error || 'Failed to fetch PRs');
        }

        if (!goalsResponse.ok) {
          throw new Error(goalsData.error || 'Failed to fetch lift goals');
        }

        if (!workoutsResponse.ok) {
          throw new Error(workoutsData.error || 'Failed to fetch workouts');
        }

        setPRs(prsData.data || []);
        setLiftGoals(goalsData.data || []);
        setRecentWorkouts(workoutsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const topPRs = prs.slice(0, 3);
  const activeGoals = liftGoals.filter(goal => {
    const currentPR = prs.find(pr => pr.movement_id === goal.movement_id);
    const currentValue = currentPR?.best_1rm_kg || 0;
    const targetValue = goal.target_1rm_kg || goal.target_weight_kg || 0;
    return targetValue > 0 && currentValue < targetValue;
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading dashboard...</h3>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Training Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your progress and stay motivated</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/workouts')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 text-left transition-colors"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold">Start Workout</h3>
                  <p className="text-sm text-blue-100">Begin a new training session</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/metrics')}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 text-left transition-colors"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold">View Metrics</h3>
                  <p className="text-sm text-green-100">Check your progress</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/metrics')}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 text-left transition-colors"
            >
              <div className="flex items-center">
                <svg className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold">Set Goals</h3>
                  <p className="text-sm text-purple-100">Track your targets</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Personal Records */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Top Personal Records</h2>
                <button
                  onClick={() => router.push('/metrics')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {topPRs.length === 0 ? (
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
                  <p className="text-gray-600 mb-4">
                    Complete some workouts to start tracking your personal records
                  </p>
                  <button
                    onClick={() => router.push('/workouts')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Start Your First Workout
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topPRs.map((pr, index) => (
                    <div
                      key={pr.movement_id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{pr.movement_name}</h3>
                          <p className="text-sm text-gray-600">
                            Last: {new Date(pr.last_performed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatWeight(pr.best_1rm_kg)}
                        </div>
                        <div className="text-xs text-gray-500">1RM</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Goals & Recent Workouts */}
          <div className="space-y-6">
            {/* Active Goals */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Active Goals</h2>
                <button
                  onClick={() => router.push('/metrics')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Manage
                </button>
              </div>

              {activeGoals.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">No active goals</p>
                  <button
                    onClick={() => router.push('/metrics')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Set some goals
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeGoals.slice(0, 3).map(goal => {
                    const currentPR = prs.find(pr => pr.movement_id === goal.movement_id);
                    const currentValue = currentPR?.best_1rm_kg || 0;
                    const targetValue = goal.target_1rm_kg || goal.target_weight_kg || 0;
                    const progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-900">
                            {goal.movement?.name || 'Unknown'}
                          </span>
                          <span className="text-gray-600">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatWeight(currentValue)}</span>
                          <span>{formatWeight(targetValue)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Workouts */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Workouts</h2>
                <button
                  onClick={() => router.push('/workouts')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {recentWorkouts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">No workouts yet</p>
                  <button
                    onClick={() => router.push('/workouts')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Start your first workout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentWorkouts.slice(0, 3).map(workout => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {workout.title || 'Workout Session'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(workout.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {workout.session_exercises?.length || 0} exercises
                        </div>
                        <div className="text-xs text-gray-500">
                          {workout.session_exercises?.reduce(
                            (total, ex) => total + (ex.exercise_sets?.length || 0),
                            0
                          ) || 0}{' '}
                          sets
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
