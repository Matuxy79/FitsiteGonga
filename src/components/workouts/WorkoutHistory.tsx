'use client';

import { useState, useEffect } from 'react';
import { WorkoutSession } from '@/types/training';

export function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/workouts?limit=20');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch workouts');
        }

        setWorkouts(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workouts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'In Progress';

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTotalVolume = (session: WorkoutSession) => {
    return (
      session.session_exercises?.reduce((total, exercise) => {
        return (
          total +
          (exercise.exercise_sets?.reduce((exerciseTotal, set) => {
            if (set.weight_kg && set.reps) {
              return exerciseTotal + set.weight_kg * set.reps;
            }
            return exerciseTotal;
          }, 0) || 0)
        );
      }, 0) || 0
    );
  };

  const getTotalSets = (session: WorkoutSession) => {
    return (
      session.session_exercises?.reduce((total, exercise) => {
        return total + (exercise.exercise_sets?.length || 0);
      }, 0) || 0
    );
  };

  if (isLoading) {
    return (
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading workouts...</h3>
      </div>
    );
  }

  if (error) {
    return (
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading workouts</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
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
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
        <p className="text-gray-600 mb-6">
          Start your first workout to begin tracking your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map(workout => (
        <div key={workout.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {workout.title || 'Workout Session'}
              </h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span>{new Date(workout.started_at).toLocaleDateString()}</span>
                <span>{new Date(workout.started_at).toLocaleTimeString()}</span>
                <span>Duration: {formatDuration(workout.started_at, workout.ended_at)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">{getTotalSets(workout)} sets</div>
              <div className="text-sm text-gray-600">
                {getTotalVolume(workout).toFixed(0)} kg total volume
              </div>
            </div>
          </div>

          {workout.session_exercises && workout.session_exercises.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Exercises</h4>
              <div className="grid gap-3">
                {workout.session_exercises.map(sessionExercise => (
                  <div key={sessionExercise.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">
                        {sessionExercise.exercise?.name || 'Unknown Exercise'}
                      </h5>
                      <span className="text-sm text-gray-600">
                        {sessionExercise.exercise_sets?.length || 0} sets
                      </span>
                    </div>

                    {sessionExercise.exercise_sets && sessionExercise.exercise_sets.length > 0 && (
                      <div className="space-y-1">
                        {sessionExercise.exercise_sets.map((set, index) => (
                          <div
                            key={set.id}
                            className="flex items-center space-x-4 text-sm text-gray-600"
                          >
                            <span className="w-8">Set {index + 1}:</span>
                            <span>{set.weight_kg} kg</span>
                            <span>× {set.reps} reps</span>
                            {set.rpe && <span>@ RPE {set.rpe}</span>}
                            {set.est_1rm_kg && (
                              <span className="text-blue-600 font-medium">
                                (est. 1RM: {set.est_1rm_kg.toFixed(1)} kg)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {workout.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{workout.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
