'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getLiftGoals,
  createLiftGoal,
  getUserPRs,
  getLatestSetForMovement,
  getMovements,
} from '@/lib/api/panels';
import type { LiftGoal, UserPR, Movement } from '@/types/panels';
import LogSetDialog from '@/components/lifts/LogSetDialog';

export default function LiftsGoalsPage() {
  const [liftGoals, setLiftGoals] = useState<LiftGoal[]>([]);
  const [userPRs, setUserPRs] = useState<UserPR[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goals, prs, movementList] = await Promise.all([
        getLiftGoals(),
        getUserPRs(),
        getMovements(),
      ]);

      setLiftGoals(goals);
      setUserPRs(prs);
      setMovements(movementList);
    } catch (error) {
      console.error('Error loading lifts data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPRForMovement = (movementId: string) => {
    return userPRs.find(pr => pr.movement_id === movementId);
  };

  const getProgressPercentage = (goal: LiftGoal) => {
    const pr = getPRForMovement(goal.movement_id);
    if (!pr || !goal.target_1rm_kg) return 0;
    return Math.min((pr.best_1rm_kg / goal.target_1rm_kg) * 100, 100);
  };

  const handleLogSet = (movementId: string) => {
    setSelectedMovement(movementId);
    setShowLogDialog(true);
  };

  const handleAddGoal = async (movementId: string, target1RM: number) => {
    try {
      const newGoal = await createLiftGoal(movementId, target1RM);
      if (newGoal) {
        setLiftGoals(prev => [newGoal, ...prev]);
        setShowAddGoal(false);
      }
    } catch (error) {
      console.error('Error creating lift goal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-discord-darker rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Lifts & Goals</h1>
            <p className="text-discord-muted">Track your progress and set new targets</p>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-4 py-2 bg-discord-accent text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Goal
          </button>
        </div>
      </div>

      {/* Lift Goals Grid */}
      {liftGoals.length === 0 ? (
        <div className="bg-discord-darker rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-lg font-semibold text-white mb-2">No Goals Yet</h2>
          <p className="text-discord-muted mb-4">
            Set your first lift goal to start tracking progress!
          </p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-6 py-3 bg-discord-accent text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liftGoals.map(goal => {
            const pr = getPRForMovement(goal.movement_id);
            const progress = getProgressPercentage(goal);

            return (
              <LiftCard
                key={goal.id}
                goal={goal}
                pr={pr}
                progress={progress}
                onLogSet={() => handleLogSet(goal.movement_id)}
              />
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <AddGoalModal
          movements={movements}
          onAdd={handleAddGoal}
          onClose={() => setShowAddGoal(false)}
        />
      )}

      {/* Log Set Dialog */}
      {showLogDialog && selectedMovement && (
        <LogSetDialog
          movementId={selectedMovement}
          onClose={() => {
            setShowLogDialog(false);
            setSelectedMovement(null);
          }}
          onSuccess={() => {
            loadData(); // Refresh data after logging
          }}
        />
      )}
    </div>
  );
}

interface LiftCardProps {
  goal: LiftGoal;
  pr: UserPR | undefined;
  progress: number;
  onLogSet: () => void;
}

function LiftCard({ goal, pr, progress }: LiftCardProps) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-discord-darker rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white capitalize">
          {goal.movement?.name || 'Unknown Movement'}
        </h3>
        <button
          onClick={() => {
            /* Handle history */
          }}
          className="text-discord-muted hover:text-white transition-colors"
        >
          📊
        </button>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-discord-dark"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-discord-accent transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
              <div className="text-xs text-discord-muted">Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-discord-muted">Current PR</span>
          <span className="text-white font-medium">{pr?.best_1rm_kg?.toFixed(1) || 'N/A'} kg</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-discord-muted">Target</span>
          <span className="text-white font-medium">
            {goal.target_1rm_kg?.toFixed(1) || 'N/A'} kg
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-discord-muted">Last Set</span>
          <span className="text-white font-medium">
            {pr?.last_performed_at ? new Date(pr.last_performed_at).toLocaleDateString() : 'Never'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            /* Handle log set */
          }}
          className="flex-1 py-2 bg-discord-accent text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Log Set
        </button>
        <button
          onClick={() => {
            /* Handle view history */
          }}
          className="px-4 py-2 bg-discord-dark text-discord-muted rounded-lg hover:bg-discord-medium hover:text-white transition-colors text-sm"
        >
          History
        </button>
      </div>
    </motion.div>
  );
}

interface AddGoalModalProps {
  movements: Movement[];
  onAdd: (movementId: string, target1RM: number) => void;
  onClose: () => void;
}

function AddGoalModal({ movements, onAdd, onClose }: AddGoalModalProps) {
  const [selectedMovement, setSelectedMovement] = useState('');
  const [target1RM, setTarget1RM] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMovement && target1RM) {
      onAdd(selectedMovement, parseFloat(target1RM));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-discord-darker rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-white mb-4">Add Lift Goal</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Movement</label>
            <select
              value={selectedMovement}
              onChange={e => setSelectedMovement(e.target.value)}
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
              required
            >
              <option value="">Select a movement</option>
              {movements.map(movement => (
                <option key={movement.id} value={movement.id}>
                  {movement.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Target 1RM (kg)</label>
            <input
              type="number"
              value={target1RM}
              onChange={e => setTarget1RM(e.target.value)}
              placeholder="e.g., 100"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              required
              min="0"
              step="0.5"
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
              className="flex-1 py-3 bg-discord-accent text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Goal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
