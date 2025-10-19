'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { mifflinStJeorBMR, harrisBenedictBMR, calculateTDEE } from '@/lib/calculations';

export default function Metabolic() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [formula, setFormula] = useState<'mifflin' | 'harris'>('mifflin');
  const [activityLevel, setActivityLevel] = useState<
    'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  >('moderate');
  const [results, setResults] = useState<{
    bmr: number | null;
    tdee: number | null;
  }>({
    bmr: null,
    tdee: null,
  });

  const handleCalculate = () => {
    if (!weight || !height || !age) return;

    let bmr = 0;

    if (formula === 'mifflin') {
      bmr = mifflinStJeorBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender);
    } else {
      bmr = harrisBenedictBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender);
    }

    const tdee = calculateTDEE(bmr, activityLevel);

    setResults({ bmr, tdee });
  };

  const activityLevels = [
    { value: 'sedentary', name: 'Sedentary', description: 'Little or no exercise' },
    { value: 'light', name: 'Light Activity', description: 'Light exercise 1-3 days/week' },
    {
      value: 'moderate',
      name: 'Moderate Activity',
      description: 'Moderate exercise 3-5 days/week',
    },
    { value: 'active', name: 'Active', description: 'Heavy exercise 6-7 days/week' },
    { value: 'very_active', name: 'Very Active', description: 'Very heavy exercise, physical job' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-discord-darker rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-4">Metabolic Calculator</h2>

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
            <label className="block text-sm font-medium text-white mb-2">Age (years)</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g., 25"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="0"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as 'male' | 'female')}
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">BMR Formula</label>
          <select
            value={formula}
            onChange={e => setFormula(e.target.value as 'mifflin' | 'harris')}
            className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
            aria-label="Select BMR calculation formula"
          >
            <option value="mifflin">Mifflin-St Jeor (Recommended)</option>
            <option value="harris">Harris-Benedict (Older)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Activity Level</label>
          <select
            value={activityLevel}
            onChange={e => setActivityLevel(e.target.value as any)}
            className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
            aria-label="Select activity level for TDEE calculation"
          >
            {activityLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.name} - {level.description}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!weight || !height || !age}
          className="w-full py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Calculate BMR & TDEE
        </button>

        {results.bmr && results.tdee && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-discord-accent/20 border border-discord-accent/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {results.bmr.toFixed(0)} kcal
              </div>
              <div className="text-sm text-discord-muted">Basal Metabolic Rate (BMR)</div>
            </div>

            <div className="bg-discord-accent/20 border border-discord-accent/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {results.tdee.toFixed(0)} kcal
              </div>
              <div className="text-sm text-discord-muted">
                Total Daily Energy Expenditure (TDEE)
              </div>
            </div>

            <div className="bg-discord-dark rounded-lg p-4">
              <div className="text-sm text-discord-muted mb-2">Calorie Targets:</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-discord-muted">Cut:</span>
                  <span className="text-white ml-1">{Math.round(results.tdee - 500)} kcal</span>
                </div>
                <div>
                  <span className="text-discord-muted">Maintain:</span>
                  <span className="text-white ml-1">{Math.round(results.tdee)} kcal</span>
                </div>
                <div>
                  <span className="text-discord-muted">Bulk:</span>
                  <span className="text-white ml-1">{Math.round(results.tdee + 500)} kcal</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
