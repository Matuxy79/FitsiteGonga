'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { navyBodyFat, jacksonPollock3Site } from '@/lib/calculations';

export default function BodyFat() {
  const [method, setMethod] = useState<'navy' | 'jackson'>('navy');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [height, setHeight] = useState('');
  const [hips, setHips] = useState('');
  const [skinfold1, setSkinfold1] = useState('');
  const [skinfold2, setSkinfold2] = useState('');
  const [skinfold3, setSkinfold3] = useState('');
  const [age, setAge] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    if (!waist || !neck || !height) return;

    let bodyFat = 0;

    if (method === 'navy') {
      bodyFat = navyBodyFat(parseFloat(waist), parseFloat(neck), parseFloat(height), gender);
    } else if (method === 'jackson' && skinfold1 && skinfold2 && skinfold3 && age) {
      bodyFat = jacksonPollock3Site(
        parseFloat(skinfold1),
        parseFloat(skinfold2),
        parseFloat(skinfold3),
        parseInt(age),
        gender
      );
    }

    setResult(bodyFat);
  };

  const getBodyFatCategory = (bodyFat: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
      if (bodyFat < 6) return { category: 'Essential Fat', color: 'text-blue-400' };
      if (bodyFat < 14) return { category: 'Athletes', color: 'text-green-400' };
      if (bodyFat < 18) return { category: 'Fitness', color: 'text-green-500' };
      if (bodyFat < 25) return { category: 'Average', color: 'text-yellow-400' };
      return { category: 'Above Average', color: 'text-red-400' };
    } else {
      if (bodyFat < 10) return { category: 'Essential Fat', color: 'text-blue-400' };
      if (bodyFat < 16) return { category: 'Athletes', color: 'text-green-400' };
      if (bodyFat < 20) return { category: 'Fitness', color: 'text-green-500' };
      if (bodyFat < 32) return { category: 'Average', color: 'text-yellow-400' };
      return { category: 'Above Average', color: 'text-red-400' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-discord-darker rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-4">Body Fat Calculator</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Method</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value as 'navy' | 'jackson')}
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
              aria-label="Select body fat calculation method"
            >
              <option value="navy">US Navy Method</option>
              <option value="jackson">Jackson & Pollock 3-Site</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as 'male' | 'female')}
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
              aria-label="Select gender for body fat calculation"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Neck (cm)</label>
            <input
              type="number"
              value={neck}
              onChange={e => setNeck(e.target.value)}
              placeholder="e.g., 38"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="0"
              step="0.5"
              required
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
              required
            />
          </div>
        </div>

        {gender === 'female' && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Hips (cm) - Required for females
            </label>
            <input
              type="number"
              value={hips}
              onChange={e => setHips(e.target.value)}
              placeholder="e.g., 95"
              className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
              min="0"
              step="0.5"
              required={gender === 'female'}
            />
          </div>
        )}

        {method === 'jackson' && (
          <>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g., 25"
                className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                min="0"
                max="120"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Skinfold 1 (mm)</label>
                <input
                  type="number"
                  value={skinfold1}
                  onChange={e => setSkinfold1(e.target.value)}
                  placeholder="e.g., 12"
                  className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Skinfold 2 (mm)</label>
                <input
                  type="number"
                  value={skinfold2}
                  onChange={e => setSkinfold2(e.target.value)}
                  placeholder="e.g., 15"
                  className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Skinfold 3 (mm)</label>
                <input
                  type="number"
                  value={skinfold3}
                  onChange={e => setSkinfold3(e.target.value)}
                  placeholder="e.g., 18"
                  className="w-full p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
            </div>
          </>
        )}

        <button
          onClick={handleCalculate}
          disabled={
            !waist ||
            !neck ||
            !height ||
            (gender === 'female' && !hips) ||
            (method === 'jackson' && (!skinfold1 || !skinfold2 || !skinfold3 || !age))
          }
          className="w-full py-3 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Calculate Body Fat %
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-discord-accent/20 border border-discord-accent/30 rounded-lg p-4 text-center"
          >
            <div className="text-3xl font-bold text-white mb-1">{result.toFixed(1)}%</div>
            <div className="text-sm text-discord-muted mb-2">Body Fat Percentage</div>
            <div className={`text-sm font-medium ${getBodyFatCategory(result, gender).color}`}>
              {getBodyFatCategory(result, gender).category}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
