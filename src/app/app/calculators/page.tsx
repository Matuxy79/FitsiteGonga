'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import OneRMCalc from '@/components/calculators/OneRMCalc';
import StrengthIndex from '@/components/calculators/StrengthIndex';
import BodyComp from '@/components/calculators/BodyComp';
import BodyFat from '@/components/calculators/BodyFat';
import Metabolic from '@/components/calculators/Metabolic';

type CalculatorType = 'oneRM' | 'strength' | 'bodyComp' | 'bodyFat' | 'metabolic';

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('oneRM');

  const calculators = [
    {
      id: 'oneRM' as CalculatorType,
      name: '1RM Calculator',
      icon: '💪',
      description: 'Estimate your one-rep max',
    },
    {
      id: 'strength' as CalculatorType,
      name: 'Strength Index',
      icon: '🏆',
      description: 'Calculate Wilks points',
    },
    {
      id: 'bodyComp' as CalculatorType,
      name: 'Body Composition',
      icon: '📊',
      description: 'BMI and FFMI',
    },
    {
      id: 'bodyFat' as CalculatorType,
      name: 'Body Fat %',
      icon: '📏',
      description: 'Estimate body fat percentage',
    },
    {
      id: 'metabolic' as CalculatorType,
      name: 'Metabolic',
      icon: '🔥',
      description: 'BMR and TDEE calculator',
    },
  ];

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'oneRM':
        return <OneRMCalc />;
      case 'strength':
        return <StrengthIndex />;
      case 'bodyComp':
        return <BodyComp />;
      case 'bodyFat':
        return <BodyFat />;
      case 'metabolic':
        return <Metabolic />;
      default:
        return <OneRMCalc />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Calculators Hub</h1>
        <p className="text-discord-muted">
          Fitness calculations and formulas to track your progress
        </p>
      </div>

      {/* Calculator Selection */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Choose Calculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calculators.map(calc => (
            <button
              key={calc.id}
              onClick={() => setActiveCalculator(calc.id)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                activeCalculator === calc.id
                  ? 'border-discord-accent bg-discord-accent/20 text-white'
                  : 'border-discord-dark bg-discord-dark text-discord-muted hover:border-discord-medium hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{calc.icon}</span>
                <span className="font-medium">{calc.name}</span>
              </div>
              <p className="text-sm opacity-75">{calc.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Content */}
      <motion.div
        key={activeCalculator}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderCalculator()}
      </motion.div>

      {/* Calculator Info */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Calculator Information</h2>
        <div className="space-y-3 text-sm text-discord-muted">
          <div>
            <strong className="text-white">1RM Calculator:</strong> Estimates your one-rep maximum
            based on submaximal lifts. Choose the formula that works best for your training style.
          </div>
          <div>
            <strong className="text-white">Strength Index:</strong> Uses Wilks coefficients to
            compare strength across different bodyweights and genders.
          </div>
          <div>
            <strong className="text-white">Body Composition:</strong> BMI provides a general health
            indicator, while FFMI estimates muscle mass relative to height.
          </div>
          <div>
            <strong className="text-white">Body Fat %:</strong> Estimates body fat percentage using
            anthropometric measurements. Navy method is quickest, Jackson & Pollock is more
            accurate.
          </div>
          <div>
            <strong className="text-white">Metabolic:</strong> Calculates your Basal Metabolic Rate
            (BMR) and Total Daily Energy Expenditure (TDEE) for nutrition planning.
          </div>
        </div>
      </div>
    </div>
  );
}
