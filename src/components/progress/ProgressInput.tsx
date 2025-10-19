'use client';

import { useState } from 'react';

interface ProgressInputProps {
  challengeId: string;
  onSubmit: (data: ProgressData) => void;
}

interface ProgressData {
  challenge_id: string;
  value: number;
  unit: string;
  notes?: string;
  photo_url?: string;
}

export function ProgressInput({ challengeId, onSubmit }: ProgressInputProps) {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('reps');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value || parseFloat(value) <= 0) {
      alert('Please enter a valid value');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        challenge_id: challengeId,
        value: parseFloat(value),
        unit,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setValue('');
      setNotes('');
    } catch (error) {
      console.error('Error submitting progress:', error);
      alert('Failed to submit progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Progress</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="number"
              step="0.1"
              required
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="reps">reps</option>
              <option value="minutes">minutes</option>
              <option value="seconds">seconds</option>
              <option value="miles">miles</option>
              <option value="km">km</option>
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
              <option value="sets">sets</option>
              <option value="servings">servings</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="How did it go? Any notes about your progress..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging...' : 'Log Progress'}
          </button>
        </div>
      </form>
    </div>
  );
}
