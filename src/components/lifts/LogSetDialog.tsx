'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getTodaySession, createWorkoutSession, getExercisesByMovement } from '@/lib/api/panels';
import type { Exercise } from '@/types/panels';

interface LogSetDialogProps {
  movementId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LogSetDialog({ movementId, onClose, onSuccess }: LogSetDialogProps) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const loadExercises = useCallback(async () => {
    try {
      const exerciseList = await getExercisesByMovement(movementId);
      setExercises(exerciseList);
      if (exerciseList.length > 0) {
        setSelectedExercise(exerciseList[0].id);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }, [movementId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !weight || !reps) return;

    setIsSubmitting(true);
    try {
      // Ensure we have a session today
      let session = await getTodaySession();
      if (!session) {
        session = await createWorkoutSession('Quick Log Session');
        if (!session) throw new Error('Failed to create session');
      }

      // TODO: Implement session_exercises and exercise_sets insertion
      // This would require additional API functions
      console.log('Logging set:', {
        sessionId: session.id,
        exerciseId: selectedExercise,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        rpe: rpe ? parseFloat(rpe) : undefined,
        notes: notes || undefined,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error logging set:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-discord-darker rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Log Set</h2>
          <button
            onClick={onClose}
            className="text-discord-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {exercises.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Exercise</label>
              <select
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
                required
                aria-label="Select exercise variation"
              >
                {exercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="e.g., 100"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                required
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={e => setReps(e.target.value)}
                placeholder="e.g., 8"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">RPE (optional)</label>
            <input
              type="number"
              value={rpe}
              onChange={e => setRpe(e.target.value)}
              placeholder="e.g., 8.5"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="1"
              max="10"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did it feel?"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              rows={2}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-discord-dark text-discord-muted rounded-lg hover:bg-discord-medium hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedExercise || !weight || !reps}
              className="flex-1 py-3 bg-discord-accent text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Logging...' : 'Log Set'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
