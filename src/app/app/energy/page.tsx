'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  createEnergyCheckin,
  getRecentEnergyCheckins,
  updateTrainingPrefs,
  getTrainingPrefs,
  getUserPRs,
} from '@/lib/api/panels';
import type { EnergyCheckin, TrainingPrefs, UserPR } from '@/types/panels';

export default function EnergyModePage() {
  const [mode, setMode] = useState<'rest' | 'training'>('training');
  const [energy, setEnergy] = useState<'low' | 'med' | 'high' | null>(null);
  const [note, setNote] = useState('');
  const [recentCheckins, setRecentCheckins] = useState<EnergyCheckin[]>([]);
  const [userPRs, setUserPRs] = useState<UserPR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prefs, checkins, prs] = await Promise.all([
        getTrainingPrefs(),
        getRecentEnergyCheckins(7),
        getUserPRs(),
      ]);

      setMode(prefs.mode || 'training');
      setRecentCheckins(checkins);
      setUserPRs(prs);
    } catch (error) {
      console.error('Error loading energy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = async (newMode: 'rest' | 'training') => {
    setMode(newMode);
    if (newMode === 'rest') {
      setEnergy(null);
    }

    try {
      await updateTrainingPrefs({ mode: newMode });
    } catch (error) {
      console.error('Error updating training mode:', error);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'training' && !energy) return;

    setIsSubmitting(true);
    try {
      const newCheckin = await createEnergyCheckin(mode, energy || undefined, note || undefined);
      if (newCheckin) {
        setRecentCheckins(prev => [newCheckin, ...prev.slice(0, 6)]);
        setNote('');
        setEnergy(null);
      }
    } catch (error) {
      console.error('Error creating energy checkin:', error);
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-2xl font-bold text-white mb-2">Energy Mode</h1>
        <p className="text-discord-muted">Track your energy levels and training readiness</p>
      </div>

      {/* Mode Toggle */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Training Mode</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleModeChange('training')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'training'
                ? 'bg-discord-accent text-white'
                : 'bg-discord-dark text-discord-muted hover:bg-discord-medium hover:text-white'
            }`}
          >
            🏋️ Training
          </button>
          <button
            onClick={() => handleModeChange('rest')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'rest'
                ? 'bg-discord-accent text-white'
                : 'bg-discord-dark text-discord-muted hover:bg-discord-medium hover:text-white'
            }`}
          >
            😴 Rest
          </button>
        </div>
      </div>

      {/* Energy Selection (Training Mode Only) */}
      {mode === 'training' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-discord-darker rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Energy Level</h2>
          <div className="flex space-x-4 mb-4">
            {(['low', 'med', 'high'] as const).map(level => (
              <button
                key={level}
                onClick={() => setEnergy(level)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  energy === level
                    ? 'bg-discord-accent text-white'
                    : 'bg-discord-dark text-discord-muted hover:bg-discord-medium hover:text-white'
                }`}
              >
                {level === 'low' && '😴'} {level === 'med' && '😐'} {level === 'high' && '💪'}
                <br />
                <span className="capitalize">{level}</span>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">Notes (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="How are you feeling? Any specific concerns?"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!energy || isSubmitting}
            className="px-6 py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Check-in'}
          </button>
        </motion.div>
      )}

      {/* Rest Mode Tips */}
      {mode === 'rest' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-discord-darker rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Recovery Tips</h2>
          <div className="space-y-3 text-discord-muted">
            <p>• Focus on light movement and mobility work</p>
            <p>• Prioritize sleep and nutrition</p>
            <p>• Consider active recovery activities</p>
            <p>• Listen to your body and rest when needed</p>
          </div>
        </motion.div>
      )}

      {/* Today's Stats */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Today&apos;s Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-discord-dark rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {userPRs.length > 0 ? userPRs[0]?.best_1rm_kg?.toFixed(1) || 'N/A' : 'N/A'}
            </div>
            <div className="text-sm text-discord-muted">Best 1RM (kg)</div>
          </div>
          <div className="bg-discord-dark rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {userPRs.length > 0 ? userPRs[0]?.movement_name || 'N/A' : 'N/A'}
            </div>
            <div className="text-sm text-discord-muted">Top Movement</div>
          </div>
          <div className="bg-discord-dark rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{recentCheckins.length}</div>
            <div className="text-sm text-discord-muted">Check-ins (7 days)</div>
          </div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Check-ins</h2>
        {recentCheckins.length === 0 ? (
          <p className="text-discord-muted">No check-ins yet. Start tracking your energy!</p>
        ) : (
          <div className="space-y-3">
            {recentCheckins.map(checkin => (
              <div
                key={checkin.id}
                className="bg-discord-dark rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{checkin.mode === 'training' ? '🏋️' : '😴'}</span>
                  <div>
                    <div className="text-white font-medium capitalize">{checkin.mode} Mode</div>
                    <div className="text-sm text-discord-muted">
                      {new Date(checkin.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {checkin.energy && (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {checkin.energy === 'low' && '😴'}
                      {checkin.energy === 'med' && '😐'}
                      {checkin.energy === 'high' && '💪'}
                    </span>
                    <span className="text-white capitalize">{checkin.energy}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
