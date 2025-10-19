'use client';

import { useState } from 'react';
import { SessionExercise, ExerciseSet } from '@/types/training';
import { SetRow } from './SetRow';
import { useWorkoutStore } from '@/lib/state/workoutStore';
import { calculate1RM, formatWeight } from '@/lib/strength';

interface ExerciseCardProps {
  sessionExercise: SessionExercise;
  onRemove: () => void;
}

export function ExerciseCard({ sessionExercise, onRemove }: ExerciseCardProps) {
  const [isAddingSet, setIsAddingSet] = useState(false);
  const { addSet, updateSet, removeSet } = useWorkoutStore();

  const handleAddSet = async () => {
    const nextSetIndex = (sessionExercise.exercise_sets?.length || 0) + 1;
    await addSet(sessionExercise.id, {
      set_index: nextSetIndex,
      weight_kg: 0,
      reps: 0,
    });
    setIsAddingSet(false);
  };

  const handleUpdateSet = async (setId: string, setData: Partial<ExerciseSet>) => {
    await updateSet(setId, setData);
  };

  const handleRemoveSet = async (setId: string) => {
    await removeSet(setId);
  };

  const calculateTotalVolume = () => {
    return (
      sessionExercise.exercise_sets?.reduce((total, set) => {
        if (set.weight_kg && set.reps) {
          return total + set.weight_kg * set.reps;
        }
        return total;
      }, 0) || 0
    );
  };

  const getBestSet = () => {
    return sessionExercise.exercise_sets?.reduce(
      (best, set) => {
        if (set.est_1rm_kg && (!best || (best.est_1rm_kg && set.est_1rm_kg > best.est_1rm_kg))) {
          return set;
        }
        return best;
      },
      null as ExerciseSet | null
    );
  };

  const bestSet = getBestSet();
  const totalVolume = calculateTotalVolume();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {sessionExercise.exercise?.name || 'Unknown Exercise'}
          </h3>
          {sessionExercise.exercise?.movement && (
            <p className="text-sm text-gray-600">
              {sessionExercise.exercise.movement.name}
              {sessionExercise.exercise.variation && (
                <span className="ml-2 text-gray-500">({sessionExercise.exercise.variation})</span>
              )}
            </p>
          )}
        </div>
        <button onClick={onRemove} className="text-gray-400 hover:text-red-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l18 18"
            />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {sessionExercise.exercise_sets?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Sets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {bestSet ? formatWeight(bestSet.est_1rm_kg || 0) : '0 kg'}
          </div>
          <div className="text-sm text-gray-600">Best 1RM</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{formatWeight(totalVolume)}</div>
          <div className="text-sm text-gray-600">Total Volume</div>
        </div>
      </div>

      {/* Sets */}
      <div className="space-y-2 mb-4">
        {sessionExercise.exercise_sets?.map(set => (
          <SetRow
            key={set.id}
            set={set}
            onUpdate={setData => handleUpdateSet(set.id, setData)}
            onRemove={() => handleRemoveSet(set.id)}
          />
        ))}
      </div>

      {/* Add Set Button */}
      <div className="flex justify-center">
        {isAddingSet ? (
          <div className="text-sm text-gray-500">Adding set...</div>
        ) : (
          <button
            onClick={handleAddSet}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Set
          </button>
        )}
      </div>
    </div>
  );
}
