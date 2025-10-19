'use client';

import { useState } from 'react';
import { WorkoutSession } from '@/types/training';
import { ExercisePicker } from './ExercisePicker';
import { ExerciseCard } from './ExerciseCard';
import { useWorkoutStore } from '@/lib/state/workoutStore';

interface SessionLoggerProps {
  session: WorkoutSession;
  onEndWorkout: () => void;
}

export function SessionLogger({ session, onEndWorkout }: SessionLoggerProps) {
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const { addExercise, removeExercise } = useWorkoutStore();

  const handleAddExercise = async (exerciseId: string) => {
    await addExercise(exerciseId);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = async (sessionExerciseId: string) => {
    await removeExercise(sessionExerciseId);
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{session.title}</h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>Started: {new Date(session.started_at).toLocaleTimeString()}</span>
              <span>Duration: {formatDuration(session.started_at)}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowExercisePicker(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Exercise
            </button>
            <button
              onClick={onEndWorkout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              End Workout
            </button>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {session.session_exercises?.map(sessionExercise => (
          <ExerciseCard
            key={sessionExercise.id}
            sessionExercise={sessionExercise}
            onRemove={() => handleRemoveExercise(sessionExercise.id)}
          />
        ))}

        {(!session.session_exercises || session.session_exercises.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises added yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first exercise to start logging your workout
            </p>
            <button
              onClick={() => setShowExercisePicker(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Exercise
            </button>
          </div>
        )}
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <ExercisePicker onSelect={handleAddExercise} onClose={() => setShowExercisePicker(false)} />
      )}
    </div>
  );
}
