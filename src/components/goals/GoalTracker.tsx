'use client';

import { useState } from 'react';

interface Goal {
  id: string;
  title: string;
  type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'custom';
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  description: string;
  completed: boolean;
}

export function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Lose 20 pounds',
      type: 'weight_loss',
      target_value: 20,
      current_value: 8,
      unit: 'lbs',
      target_date: '2025-03-15',
      description: 'Gradual weight loss for better health',
      completed: false,
    },
    {
      id: '2',
      title: 'Bench Press 225 lbs',
      type: 'strength',
      target_value: 225,
      current_value: 185,
      unit: 'lbs',
      target_date: '2025-04-01',
      description: 'Increase bench press strength',
      completed: false,
    },
    {
      id: '3',
      title: 'Run 5K in 25 minutes',
      type: 'endurance',
      target_value: 25,
      current_value: 32,
      unit: 'minutes',
      target_date: '2025-05-01',
      description: 'Improve running endurance',
      completed: false,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    type: 'weight_loss',
    target_value: 0,
    current_value: 0,
    unit: 'lbs',
    target_date: '',
    description: '',
  });

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target_value || !newGoal.target_date) {
      alert('Please fill in all required fields');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      type: newGoal.type as Goal['type'],
      target_value: newGoal.target_value,
      current_value: newGoal.current_value || 0,
      unit: newGoal.unit || 'lbs',
      target_date: newGoal.target_date,
      description: newGoal.description || '',
      completed: false,
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      type: 'weight_loss',
      target_value: 0,
      current_value: 0,
      unit: 'lbs',
      target_date: '',
      description: '',
    });
    setShowCreateForm(false);
  };

  const updateProgress = (goalId: string, newValue: number) => {
    setGoals(
      goals.map(goal => {
        if (goal.id === goalId) {
          const updatedGoal = { ...goal, current_value: newValue };
          // Check if goal is completed
          if (goal.type === 'weight_loss') {
            updatedGoal.completed = newValue >= goal.target_value;
          } else {
            updatedGoal.completed = newValue >= goal.target_value;
          }
          return updatedGoal;
        }
        return goal;
      })
    );
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.type === 'weight_loss') {
      return Math.min((goal.current_value / goal.target_value) * 100, 100);
    }
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'weight_loss':
        return '⚖️';
      case 'muscle_gain':
        return '💪';
      case 'strength':
        return '🏋️';
      case 'endurance':
        return '🏃';
      default:
        return '🎯';
    }
  };

  const getGoalColor = (type: string) => {
    switch (type) {
      case 'weight_loss':
        return 'bg-red-100 text-red-800';
      case 'muscle_gain':
        return 'bg-blue-100 text-blue-800';
      case 'strength':
        return 'bg-purple-100 text-purple-800';
      case 'endurance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Goals Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Fitness Goals</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {goals.filter(g => !g.completed).length}
            </div>
            <div className="text-sm text-gray-600">Active Goals</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {goals.filter(g => g.completed).length}
            </div>
            <div className="text-sm text-gray-600">Completed Goals</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                goals.reduce((acc, goal) => acc + getProgressPercentage(goal), 0) / goals.length
              ) || 0}
              %
            </div>
            <div className="text-sm text-gray-600">Average Progress</div>
          </div>
        </div>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Lose 20 pounds"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
              <select
                value={newGoal.type}
                onChange={e => setNewGoal({ ...newGoal, type: e.target.value as Goal['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Goal Type"
              >
                <option value="weight_loss">⚖️ Weight Loss</option>
                <option value="muscle_gain">💪 Muscle Gain</option>
                <option value="strength">🏋️ Strength</option>
                <option value="endurance">🏃 Endurance</option>
                <option value="custom">🎯 Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
              <input
                type="number"
                value={newGoal.target_value}
                onChange={e =>
                  setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={newGoal.unit}
                onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Unit of measurement"
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
                <option value="minutes">minutes</option>
                <option value="miles">miles</option>
                <option value="reps">reps</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
              <input
                type="number"
                value={newGoal.current_value}
                onChange={e =>
                  setNewGoal({ ...newGoal, current_value: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input
                type="date"
                value={newGoal.target_date}
                onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newGoal.description}
              onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe your goal..."
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addGoal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(goal => (
          <div
            key={goal.id}
            className={`bg-white rounded-lg shadow p-6 ${goal.completed ? 'bg-green-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getGoalIcon(goal.type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGoalColor(goal.type)}`}
                    >
                      {goal.type.replace('_', ' ')}
                    </span>
                    {goal.completed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>

            {goal.description && <p className="text-gray-600 mb-4">{goal.description}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Current Progress</div>
                <div className="text-lg font-semibold text-gray-900">
                  {goal.current_value} {goal.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Target</div>
                <div className="text-lg font-semibold text-gray-900">
                  {goal.target_value} {goal.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Target Date</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(goal.target_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(getProgressPercentage(goal))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    goal.completed ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(getProgressPercentage(goal), 100)}%` }}
                />
              </div>
            </div>

            {/* Update Progress */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Update Progress:</label>
              <input
                type="number"
                value={goal.current_value}
                onChange={e => updateProgress(goal.id, parseFloat(e.target.value) || 0)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">{goal.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🎯</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first fitness goal to start tracking your progress.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
}
