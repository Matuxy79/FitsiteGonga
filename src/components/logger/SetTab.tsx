'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  getTodaySession,
  createWorkoutSession,
  getMovements,
  getExercisesByMovement,
} from '@/lib/api/panels';
import type { Movement, Exercise } from '@/types/panels';

export default function SetTab() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<string>('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMovements();
  }, []);

  useEffect(() => {
    if (selectedMovement) {
      loadExercises();
    } else {
      setExercises([]);
      setSelectedExercise('');
    }
  }, [selectedMovement, loadExercises]);

  const loadMovements = async () => {
    try {
      const movementList = await getMovements();
      setMovements(movementList);
    } catch (error) {
      console.error('Error loading movements:', error);
    }
  };

  const loadExercises = useCallback(async () => {
    try {
      const exerciseList = await getExercisesByMovement(selectedMovement);
      setExercises(exerciseList);
      if (exerciseList.length > 0) {
        setSelectedExercise(exerciseList[0].id);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }, [selectedMovement]);

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
      console.log('Logging set:', {
        sessionId: session.id,
        exerciseId: selectedExercise,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        rpe: rpe ? parseFloat(rpe) : undefined,
        notes: notes || undefined,
      });

      // Reset form
      setWeight('');
      setReps('');
      setRpe('');
      setNotes('');
    } catch (error) {
      console.error('Error logging set:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Log Set</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Movement</label>
            <select
              value={selectedMovement}
              onChange={e => setSelectedMovement(e.target.value)}
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
              required
              aria-label="Select movement"
            >
              <option value="">Select a movement</option>
              {movements.map(movement => (
                <option key={movement.id} value={movement.id}>
                  {movement.name}
                </option>
              ))}
            </select>
          </div>

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
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedExercise || !weight || !reps}
            className="w-full py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Logging Set...' : 'Log Set'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
