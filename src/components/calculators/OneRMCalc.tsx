'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateOneRM } from '@/lib/calculations';

export default function OneRMCalc() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [formula, setFormula] = useState<'epley' | 'brzycki' | 'lombardi' | 'oconnor'>('epley');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    if (!weight || !reps) return;

    const oneRM = calculateOneRM(parseFloat(weight), parseInt(reps), formula);
    setResult(oneRM);
  };

  const formulas = [
    { value: 'epley', name: 'Epley', description: 'Most common, good for 1-10 reps' },
    { value: 'brzycki', name: 'Brzycki', description: 'Conservative estimate' },
    { value: 'lombardi', name: 'Lombardi', description: 'Powerlifting focused' },
    { value: 'oconnor', name: "O'Connor", description: 'Higher estimates' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-discord-darker rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-4">1RM Calculator</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g., 100"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
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
              min="1"
              max="20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Formula</label>
          <select
            value={formula}
            onChange={e => setFormula(e.target.value as any)}
            className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
            aria-label="Select 1RM calculation formula"
          >
            {formulas.map(f => (
              <option key={f.value} value={f.value}>
                {f.name} - {f.description}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!weight || !reps}
          className="w-full py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Calculate 1RM
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-discord-accent/20 border border-discord-accent/30 rounded-lg p-4 text-center"
          >
            <div className="text-3xl font-bold text-white mb-1">{result.toFixed(1)} kg</div>
            <div className="text-sm text-discord-muted">
              Estimated 1RM using {formulas.find(f => f.value === formula)?.name} formula
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
