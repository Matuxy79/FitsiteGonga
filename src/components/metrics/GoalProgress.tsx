'use client';

import { useState } from 'react';
import { LiftGoal, UserPR } from '@/types/training';
import { formatWeight } from '@/lib/strength';

interface GoalProgressProps {
  goal: LiftGoal;
  prs: UserPR[];
}

export function GoalProgress({ goal, prs }: GoalProgressProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Find the current PR for this movement
  const currentPR = prs.find(pr => pr.movement_id === goal.movement_id);
  const currentValue = currentPR?.best_1rm_kg || 0;

  // Calculate progress percentage
  const targetValue = goal.target_1rm_kg || goal.target_weight_kg || 0;
  const progressPercentage =
    targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGoalType = () => {
    if (goal.target_1rm_kg) return '1RM';
    if (goal.target_weight_kg && goal.target_reps) return `${goal.target_reps} reps`;
    if (goal.target_weight_kg) return 'Weight';
    return 'Goal';
  };

  const getTargetDisplay = () => {
    if (goal.target_1rm_kg) return formatWeight(goal.target_1rm_kg);
    if (goal.target_weight_kg && goal.target_reps) {
      return `${formatWeight(goal.target_weight_kg)} × ${goal.target_reps} reps`;
    }
    if (goal.target_weight_kg) return formatWeight(goal.target_weight_kg);
    return 'No target set';
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{goal.movement?.name || 'Unknown Movement'}</h3>
          <p className="text-sm text-gray-600">
            {getGoalType()} Goal: {getTargetDisplay()}
          </p>
          {goal.due_date && (
            <p className="text-xs text-gray-500">Due: {formatDate(goal.due_date)}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {currentValue > 0 ? formatWeight(currentValue) : 'No PR'}
          </div>
          <div className="text-xs text-gray-500">Current</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        {progressPercentage >= 100 ? (
          <span className="text-green-600 font-medium flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Goal Achieved!
          </span>
        ) : targetValue > currentValue ? (
          <span className="text-gray-600">{formatWeight(targetValue - currentValue)} to go</span>
        ) : (
          <span className="text-gray-600">No target set</span>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Edit Form (placeholder) */}
      {isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">Edit form coming soon...</p>
        </div>
      )}
    </div>
  );
}
