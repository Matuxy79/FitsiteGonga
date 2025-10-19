'use client';

import { useState } from 'react';
import { ExerciseSet } from '@/types/training';
import { calculate1RM, formatWeight } from '@/lib/strength';

interface SetRowProps {
  set: ExerciseSet;
  onUpdate: (setData: Partial<ExerciseSet>) => void;
  onRemove: () => void;
}

export function SetRow({ set, onUpdate, onRemove }: SetRowProps) {
  const [weight, setWeight] = useState(set.weight_kg?.toString() || '');
  const [reps, setReps] = useState(set.reps?.toString() || '');
  const [rpe, setRpe] = useState(set.rpe?.toString() || '');
  const [notes, setNotes] = useState(set.notes || '');

  const weightNum = parseFloat(weight) || 0;
  const repsNum = parseInt(reps) || 0;
  const rpeNum = parseFloat(rpe) || 0;

  // Calculate estimated 1RM when weight and reps change
  const estimated1RM =
    weightNum > 0 && repsNum > 0 ? calculate1RM(weightNum, repsNum, 'epley') : null;

  const handleWeightChange = (value: string) => {
    setWeight(value);
    const numValue = parseFloat(value) || 0;
    onUpdate({ weight_kg: numValue || undefined });
  };

  const handleRepsChange = (value: string) => {
    setReps(value);
    const numValue = parseInt(value) || 0;
    onUpdate({ reps: numValue || undefined });
  };

  const handleRpeChange = (value: string) => {
    setRpe(value);
    const numValue = parseFloat(value) || 0;
    onUpdate({ rpe: numValue || undefined });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onUpdate({ notes: value || undefined });
  };

  return (
    <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg bg-white">
      {/* Set Number */}
      <div className="flex-shrink-0 w-8 text-center">
        <span className="text-sm font-medium text-gray-600">{set.set_index}</span>
      </div>

      {/* Weight */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">Weight</label>
        <div className="relative">
          <input
            type="number"
            step="0.5"
            value={weight}
            onChange={e => handleWeightChange(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <span className="absolute right-3 top-2 text-xs text-gray-500">kg</span>
        </div>
      </div>

      {/* Reps */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">Reps</label>
        <input
          type="number"
          value={reps}
          onChange={e => handleRepsChange(e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* RPE */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">RPE</label>
        <input
          type="number"
          step="0.5"
          min="1"
          max="10"
          value={rpe}
          onChange={e => handleRpeChange(e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Estimated 1RM */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">Est. 1RM</label>
        <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
          {estimated1RM ? formatWeight(estimated1RM) : '-'}
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder="Optional"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Remove Button */}
      <div className="flex-shrink-0">
        <button onClick={onRemove} className="text-gray-400 hover:text-red-600 p-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l18 18"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
