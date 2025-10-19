'use client';

import { useState } from 'react';

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Set {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export function WorkoutLogger() {
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Bench Press',
      sets: [
        { id: '1', weight: 135, reps: 10, completed: false },
        { id: '2', weight: 135, reps: 10, completed: false },
        { id: '3', weight: 135, reps: 10, completed: false },
      ],
    },
    {
      id: '2',
      name: 'Squat',
      sets: [
        { id: '4', weight: 185, reps: 8, completed: false },
        { id: '5', weight: 185, reps: 8, completed: false },
        { id: '6', weight: 185, reps: 8, completed: false },
      ],
    },
  ]);

  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [workoutTitle, setWorkoutTitle] = useState('');

  const toggleSet = (exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set =>
                set.id === setId ? { ...set, completed: !set.completed } : set
              ),
            }
          : exercise
      )
    );
  };

  const updateSetWeight = (exerciseId: string, setId: string, weight: number) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set => (set.id === setId ? { ...set, weight } : set)),
            }
          : exercise
      )
    );
  };

  const updateSetReps = (exerciseId: string, setId: string, reps: number) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set => (set.id === setId ? { ...set, reps } : set)),
            }
          : exercise
      )
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  id: Date.now().toString(),
                  weight: 0,
                  reps: 0,
                  completed: false,
                },
              ],
            }
          : exercise
      )
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter(set => set.id !== setId),
            }
          : exercise
      )
    );
  };

  const getCompletedSets = () => {
    return exercises.reduce(
      (total, exercise) => total + exercise.sets.filter(set => set.completed).length,
      0
    );
  };

  const getTotalSets = () => {
    return exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={workoutTitle}
            onChange={e => setWorkoutTitle(e.target.value)}
            placeholder="Enter workout title..."
            className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
          />
          <div className="text-sm text-gray-500">
            {getCompletedSets()} / {getTotalSets()} sets completed
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${getTotalSets() > 0 ? (getCompletedSets() / getTotalSets()) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map(exercise => (
          <div key={exercise.id} className="bg-white rounded-lg shadow">
            {/* Exercise Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                <button
                  onClick={() =>
                    setActiveExercise(activeExercise === exercise.id ? null : exercise.id)
                  }
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {activeExercise === exercise.id ? 'Hide' : 'Show'} Details
                </button>
              </div>
            </div>

            {/* Sets */}
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-gray-500">
                <div>Set</div>
                <div>Weight (lbs)</div>
                <div>Reps</div>
                <div>Status</div>
              </div>

              <div className="space-y-2">
                {exercise.sets.map((set, index) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-4 gap-4 p-3 rounded-lg ${
                      set.completed ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-700 font-medium">{index + 1}</span>
                    </div>

                    <div>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={e =>
                          updateSetWeight(exercise.id, set.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={e =>
                          updateSetReps(exercise.id, set.id, parseInt(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSet(exercise.id, set.id)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          set.completed
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {set.completed ? '✓ Done' : 'Mark Done'}
                      </button>

                      {exercise.sets.length > 1 && (
                        <button
                          onClick={() => removeSet(exercise.id, set.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSet(exercise.id)}
                className="mt-3 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
              >
                + Add Set
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Workout Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            + Add Exercise
          </button>

          <div className="flex space-x-3">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Pause Workout
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Finish Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
