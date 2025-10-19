'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateWilksPoints, wilksCoefficient } from '@/lib/calculations';

export default function StrengthIndex() {
  const [total, setTotal] = useState('');
  const [bodyweight, setBodyweight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [result, setResult] = useState<number | null>(null);
  const [coefficient, setCoefficient] = useState<number | null>(null);

  const handleCalculate = () => {
    if (!total || !bodyweight) return;

    const points = calculateWilksPoints(parseFloat(total), parseFloat(bodyweight), gender);
    const coeff = wilksCoefficient(parseFloat(bodyweight), gender);

    setResult(points);
    setCoefficient(coeff);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-discord-darker rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-4">Strength Index (Wilks)</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Total (kg)</label>
            <input
              type="number"
              value={total}
              onChange={e => setTotal(e.target.value)}
              placeholder="e.g., 500"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="0"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Bodyweight (kg)</label>
            <input
              type="number"
              value={bodyweight}
              onChange={e => setBodyweight(e.target.value)}
              placeholder="e.g., 75"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Gender</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value as 'male' | 'female')}
            className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
            aria-label="Select gender for Wilks calculation"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!total || !bodyweight}
          className="w-full py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Calculate Wilks Points
        </button>

        {result && coefficient && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-discord-accent/20 border border-discord-accent/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{result.toFixed(1)} pts</div>
              <div className="text-sm text-discord-muted">Wilks Points</div>
            </div>

            <div className="bg-discord-dark rounded-lg p-4">
              <div className="text-sm text-discord-muted mb-2">Additional Info:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-discord-muted">Coefficient:</span>
                  <span className="text-white ml-1">{coefficient.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-discord-muted">Gender:</span>
                  <span className="text-white ml-1 capitalize">{gender}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
