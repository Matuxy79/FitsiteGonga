'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  getTrainingPrefs,
  updateTrainingPrefs,
  getTodaySession,
  createWorkoutSession,
  getLatestSetForMovement,
} from '@/lib/api/panels';
import { SPLIT_TEMPLATES, getTodayTemplate, getWeekMapForSplit } from '@/lib/split-templates';
import type { TrainingPrefs, SplitTemplate } from '@/types/panels';

export default function SplitPlannerPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<TrainingPrefs>({});
  const [todayTemplate, setTodayTemplate] = useState<SplitTemplate | null>(null);
  const [lightDay, setLightDay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userPrefs = await getTrainingPrefs();
      setPrefs(userPrefs);

      // Get today's template
      if (userPrefs.split && userPrefs.weekMap) {
        const template = getTodayTemplate(userPrefs.split, userPrefs.weekMap);
        setTodayTemplate(template);
      }

      setLightDay(userPrefs.lightDay || false);
    } catch (error) {
      console.error('Error loading split planner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitChange = async (split: string) => {
    const weekMap = getWeekMapForSplit(split);
    const newPrefs = { ...prefs, split: split as any, weekMap };

    setPrefs(newPrefs);
    await updateTrainingPrefs(newPrefs);

    // Update today's template
    const template = getTodayTemplate(split, weekMap);
    setTodayTemplate(template);
  };

  const handleLightDayToggle = async () => {
    const newLightDay = !lightDay;
    setLightDay(newLightDay);
    await updateTrainingPrefs({ ...prefs, lightDay: newLightDay });
  };

  const handleStartSession = async () => {
    if (!todayTemplate) return;

    setIsCreatingSession(true);
    try {
      // Check if there's already a session today
      const existingSession = await getTodaySession();

      if (existingSession) {
        // Route to existing session
        router.push(`/app/workouts?session=${existingSession.id}`);
        return;
      }

      // Create new session with template
      const session = await createWorkoutSession(
        `${todayTemplate.name} - ${new Date().toLocaleDateString()}`
      );

      if (session) {
        // Route to workout logger with session ID
        router.push(`/app/workouts?session=${session.id}&template=${todayTemplate.name}`);
      }
    } catch (error) {
      console.error('Error creating workout session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const getVolumeMultiplier = () => {
    if (lightDay) return 0.7;
    return 1.0;
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
        <h1 className="text-2xl font-bold text-white mb-2">Split Planner</h1>
        <p className="text-discord-muted">Plan your training and start workout sessions</p>
      </div>

      {/* Split Selection */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Training Split</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(SPLIT_TEMPLATES).map(split => (
            <button
              key={split}
              onClick={() => handleSplitChange(split)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                prefs.split === split
                  ? 'border-discord-accent bg-discord-accent/20 text-white'
                  : 'border-discord-dark bg-discord-dark text-discord-muted hover:border-discord-medium hover:text-white'
              }`}
            >
              <div className="font-medium capitalize mb-1">{split.replace('_', ' ')}</div>
              <div className="text-sm opacity-75">{SPLIT_TEMPLATES[split].length} templates</div>
            </button>
          ))}
        </div>
      </div>

      {/* Light Day Toggle */}
      <div className="bg-discord-darker rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Light Day</h2>
            <p className="text-sm text-discord-muted">Reduce volume by 30% for recovery</p>
          </div>
          <button
            onClick={handleLightDayToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              lightDay ? 'bg-discord-accent' : 'bg-discord-dark'
            }`}
            aria-label={`Toggle light day ${lightDay ? 'off' : 'on'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                lightDay ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Today's Workout */}
      {todayTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-discord-darker rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Today&apos;s Workout: {todayTemplate.name}
            </h2>
            {lightDay && (
              <span className="px-3 py-1 bg-discord-warning/20 text-discord-warning rounded-full text-sm">
                Light Day (-30%)
              </span>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {todayTemplate.exercises.map((exercise, index) => (
              <ExerciseCard
                key={index}
                exercise={exercise}
                volumeMultiplier={getVolumeMultiplier()}
              />
            ))}
          </div>

          <button
            onClick={handleStartSession}
            disabled={isCreatingSession}
            title="Start a new workout session with today's planned exercises"
            className="w-full py-4 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreatingSession ? 'Creating Session...' : 'Start Workout Session'}
          </button>
        </motion.div>
      )}

      {/* No Template Selected */}
      {!todayTemplate && prefs.split && (
        <div className="bg-discord-darker rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-lg font-semibold text-white mb-2">No Workout Today</h2>
          <p className="text-discord-muted">
            It looks like today is a rest day for your {prefs.split.replace('_', ' ')} split.
          </p>
        </div>
      )}

      {/* No Split Selected */}
      {!prefs.split && (
        <div className="bg-discord-darker rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🏋️</div>
          <h2 className="text-lg font-semibold text-white mb-2">Choose a Split</h2>
          <p className="text-discord-muted">
            Select a training split above to see today&apos;s workout plan.
          </p>
        </div>
      )}
    </div>
  );
}

interface ExerciseCardProps {
  exercise: {
    movement: string;
    sets: number;
    reps: string;
    notes?: string;
  };
  volumeMultiplier: number;
}

function ExerciseCard({ exercise, volumeMultiplier }: ExerciseCardProps) {
  const adjustedSets = Math.max(1, Math.round(exercise.sets * volumeMultiplier));

  return (
    <div className="bg-discord-dark rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-white capitalize">{exercise.movement.replace('_', ' ')}</h3>
        <div className="text-sm text-discord-muted">
          {adjustedSets} sets × {exercise.reps}
        </div>
      </div>
      {exercise.notes && <p className="text-sm text-discord-muted">{exercise.notes}</p>}
      {volumeMultiplier < 1 && (
        <div className="mt-2 text-xs text-discord-warning">
          Light day: Reduced from {exercise.sets} sets
        </div>
      )}
    </div>
  );
}
