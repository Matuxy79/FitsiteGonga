'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateBMI, calculateFFMI, getBMICategory, getFFMICategory } from '@/lib/calculations';

export default function BodyComp() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [results, setResults] = useState<{
    bmi: number | null;
    ffmi: number | null;
    bmiCategory: { category: string; color: string } | null;
    ffmiCategory: { category: string; color: string } | null;
  }>({
    bmi: null,
    ffmi: null,
    bmiCategory: null,
    ffmiCategory: null,
  });

  const handleCalculate = () => {
    if (!weight || !height) return;

    const bmi = calculateBMI(parseFloat(weight), parseFloat(height));
    const bmiCategory = getBMICategory(bmi);

    let ffmi = null;
    let ffmiCategory = null;

    if (bodyFat) {
      ffmi = calculateFFMI(parseFloat(weight), parseFloat(height), parseFloat(bodyFat));
      ffmiCategory = getFFMICategory(ffmi, gender);
    }

    setResults({
      bmi,
      ffmi,
      bmiCategory,
      ffmiCategory,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-discord-darker rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-4">Body Composition</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g., 75"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="e.g., 175"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Body Fat % (optional)
            </label>
            <input
              type="number"
              value={bodyFat}
              onChange={e => setBodyFat(e.target.value)}
              placeholder="e.g., 15"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as 'male' | 'female')}
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
              aria-label="Select gender for body composition calculation"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!weight || !height}
          className="w-full py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Calculate
        </button>

        {results.bmi && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-discord-accent/20 border border-discord-accent/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{results.bmi.toFixed(1)}</div>
              <div className="text-sm text-discord-muted mb-2">BMI</div>
              <div className={`text-sm font-medium ${results.bmiCategory?.color}`}>
                {results.bmiCategory?.category}
              </div>
            </div>

            {results.ffmi && (
              <div className="bg-discord-accent/20 border border-discord-accent/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{results.ffmi.toFixed(1)}</div>
                <div className="text-sm text-discord-muted mb-2">FFMI</div>
                <div className={`text-sm font-medium ${results.ffmiCategory?.color}`}>
                  {results.ffmiCategory?.category}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
