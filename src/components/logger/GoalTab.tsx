'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLiftGoals, createLiftGoal, getMovements } from '@/lib/api/panels';
import type { Movement, LiftGoal } from '@/types/panels';

export default function GoalTab() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [liftGoals, setLiftGoals] = useState<LiftGoal[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<string>('');
  const [target1RM, setTarget1RM] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetReps, setTargetReps] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [movementList, goals] = await Promise.all([getMovements(), getLiftGoals()]);
      setMovements(movementList);
      setLiftGoals(goals);
    } catch (error) {
      console.error('Error loading goal data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovement) return;

    setIsSubmitting(true);
    try {
      await createLiftGoal(
        selectedMovement,
        target1RM ? parseFloat(target1RM) : undefined,
        targetWeight ? parseFloat(targetWeight) : undefined,
        targetReps ? parseInt(targetReps) : undefined,
        dueDate || undefined
      );

      // Reset form
      setSelectedMovement('');
      setTarget1RM('');
      setTargetWeight('');
      setTargetReps('');
      setDueDate('');
      setProgressNote('');

      // Reload goals
      await loadData();
    } catch (error) {
      console.error('Error creating lift goal:', error);
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
      {/* Add Goal Form */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Add Goal</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Movement</label>
            <select
              value={selectedMovement}
              onChange={e => setSelectedMovement(e.target.value)}
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
              required
              aria-label="Select movement for goal"
            >
              <option value="">Select a movement</option>
              {movements.map(movement => (
                <option key={movement.id} value={movement.id}>
                  {movement.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Target 1RM (kg)</label>
              <input
                type="number"
                value={target1RM}
                onChange={e => setTarget1RM(e.target.value)}
                placeholder="e.g., 100"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Target Weight (kg)
              </label>
              <input
                type="number"
                value={targetWeight}
                onChange={e => setTargetWeight(e.target.value)}
                placeholder="e.g., 80"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Target Reps</label>
              <input
                type="number"
                value={targetReps}
                onChange={e => setTargetReps(e.target.value)}
                placeholder="e.g., 8"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Due Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Progress Note (optional)
            </label>
            <textarea
              value={progressNote}
              onChange={e => setProgressNote(e.target.value)}
              placeholder="Any notes about this goal..."
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              rows={3}
              aria-label="Progress notes for the goal"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedMovement}
            className="w-full py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating Goal...' : 'Create Goal'}
          </button>
        </form>
      </div>

      {/* Current Goals */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Current Goals</h2>

        {liftGoals.length === 0 ? (
          <p className="text-discord-muted">No goals set yet. Create your first goal above!</p>
        ) : (
          <div className="space-y-4">
            {liftGoals.map(goal => (
              <div key={goal.id} className="bg-discord-dark rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white capitalize">
                    {goal.movement?.name || 'Unknown Movement'}
                  </h3>
                  <span className="text-sm text-discord-muted">
                    {goal.due_date ? new Date(goal.due_date).toLocaleDateString() : 'No deadline'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-discord-muted">Target 1RM:</span>
                    <span className="text-white ml-1">
                      {goal.target_1rm_kg ? `${goal.target_1rm_kg} kg` : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-discord-muted">Target Weight:</span>
                    <span className="text-white ml-1">
                      {goal.target_weight_kg ? `${goal.target_weight_kg} kg` : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-discord-muted">Target Reps:</span>
                    <span className="text-white ml-1">{goal.target_reps || 'Not set'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
