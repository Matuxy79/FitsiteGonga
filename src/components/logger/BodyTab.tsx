'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLatestMeasurement, createMeasurement, getFitnessMetrics } from '@/lib/api/panels';
import type { MeasurementHistory, FitnessMetrics } from '@/types/panels';

export default function BodyTab() {
  const [latestMeasurement, setLatestMeasurement] = useState<MeasurementHistory | null>(null);
  const [fitnessMetrics, setFitnessMetrics] = useState<FitnessMetrics | null>(null);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [chest, setChest] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [measurement, metrics] = await Promise.all([
        getLatestMeasurement(),
        getFitnessMetrics(),
      ]);

      setLatestMeasurement(measurement);
      setFitnessMetrics(metrics);
    } catch (error) {
      console.error('Error loading body data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await createMeasurement(
        weight ? parseFloat(weight) : undefined,
        bodyFat ? parseFloat(bodyFat) : undefined,
        waist ? parseFloat(waist) : undefined,
        hips ? parseFloat(hips) : undefined,
        chest ? parseFloat(chest) : undefined,
        notes || undefined
      );

      // Reset form
      setWeight('');
      setBodyFat('');
      setWaist('');
      setHips('');
      setChest('');
      setNotes('');

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error creating measurement:', error);
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
      {/* Add Measurement Form */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Add Measurement</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="e.g., 75.5"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Body Fat % (optional)
              </label>
              <input
                type="number"
                value={bodyFat}
                onChange={e => setBodyFat(e.target.value)}
                placeholder="e.g., 15.2"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Waist (cm)</label>
              <input
                type="number"
                value={waist}
                onChange={e => setWaist(e.target.value)}
                placeholder="e.g., 82"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Hips (cm)</label>
              <input
                type="number"
                value={hips}
                onChange={e => setHips(e.target.value)}
                placeholder="e.g., 95"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Chest (cm)</label>
              <input
                type="number"
                value={chest}
                onChange={e => setChest(e.target.value)}
                placeholder="e.g., 105"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes about your measurements..."
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving Measurement...' : 'Save Measurement'}
          </button>
        </form>
      </div>

      {/* Latest Measurement */}
      {latestMeasurement && (
        <div className="bg-discord-darker rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Latest Measurement</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-discord-dark rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {latestMeasurement.weight_kg ? `${latestMeasurement.weight_kg} kg` : 'N/A'}
              </div>
              <div className="text-sm text-discord-muted">Weight</div>
            </div>

            <div className="bg-discord-dark rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {latestMeasurement.body_fat_percent
                  ? `${latestMeasurement.body_fat_percent}%`
                  : 'N/A'}
              </div>
              <div className="text-sm text-discord-muted">Body Fat</div>
            </div>

            <div className="bg-discord-dark rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {latestMeasurement.waist_cm ? `${latestMeasurement.waist_cm} cm` : 'N/A'}
              </div>
              <div className="text-sm text-discord-muted">Waist</div>
            </div>

            <div className="bg-discord-dark rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {latestMeasurement.hips_cm ? `${latestMeasurement.hips_cm} cm` : 'N/A'}
              </div>
              <div className="text-sm text-discord-muted">Hips</div>
            </div>

            <div className="bg-discord-dark rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {latestMeasurement.chest_cm ? `${latestMeasurement.chest_cm} cm` : 'N/A'}
              </div>
              <div className="text-sm text-discord-muted">Chest</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-discord-muted">
            Measured on {new Date(latestMeasurement.measure_date).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Fitness Metrics */}
      {fitnessMetrics && (
        <div className="bg-discord-darker rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Fitness Metrics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-discord-dark rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {fitnessMetrics.height_cm ? `${fitnessMetrics.height_cm} cm` : 'N/A'}
              </div>
              <div className="text-sm text-discord-muted">Height</div>
            </div>

            <div className="bg-discord-dark rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {fitnessMetrics.resting_hr ? `${fitnessMetrics.resting_hr} bpm` : 'N/A'}
              </div>
              <div className="text-sm text-discord-muted">Resting HR</div>
            </div>

            <div className="bg-discord-dark rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {fitnessMetrics.max_hr ? `${fitnessMetrics.max_hr} bpm` : 'N/A'}
              </div>
              <div className="text-sm text-discord-muted">Max HR</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
