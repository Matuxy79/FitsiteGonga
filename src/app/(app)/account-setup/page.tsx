'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { accountSetupSchema, type AccountSetupFormValues } from '@/schema/account-setup';
import { kgToLb, lbToKg, cmToIn, inToCm } from '@/lib/units';
import { calcBMI, calcBMR, ageFromBirthdate } from '@/lib/fitness-calculations';
import { getMovementOptions, getFormulaOptions } from '@/lib/strength';
import type { Gender, UnitSystem } from '@/types/profile';

type Step = 1 | 2 | 3;

export default function AccountSetupPage() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<AccountSetupFormValues>({
    resolver: zodResolver(accountSetupSchema),
    defaultValues: {
      unit_system: 'metric',
      gender: 'prefer_not',
    },
  });

  const unitSystem = watch('unit_system');
  const height = watch('height');
  const weight = watch('weight');
  const birthdate = watch('birthdate');

  // Calculate and display BMI preview
  const bmiPreview = (() => {
    if (!height || !weight) return null;

    let heightCm = height;
    let weightKg = weight;

    if (unitSystem === 'imperial') {
      heightCm = inToCm(height);
      weightKg = lbToKg(weight);
    }

    return calcBMI(weightKg, heightCm);
  })();

  const handleNext = async () => {
    // Validate only fields for the current step
    const step1Fields: (keyof AccountSetupFormValues)[] = [
      'display_name',
      'bio',
      'birthdate',
      'gender',
      'unit_system',
    ];
    const step2Fields: (keyof AccountSetupFormValues)[] = [
      'height',
      'weight',
      'resting_hr',
      'activity_level',
    ];
    const step3Fields: (keyof AccountSetupFormValues)[] = [
      'favorite_movements',
      'training_frequency',
      'one_rm_formula',
    ];

    const fieldsToValidate = step === 1 ? step1Fields : step === 2 ? step2Fields : step3Fields;
    const isValid = await trigger(fieldsToValidate, { shouldFocus: true });

    if (isValid && step < 3) {
      setStep(prev => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => (prev - 1) as Step);
    }
  };

  const onSubmit = async (values: AccountSetupFormValues) => {
    try {
      setIsSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to continue.',
          variant: 'destructive',
        });
        return;
      }

      // Convert units to metric for storage
      const heightCm = unitSystem === 'imperial' ? inToCm(values.height) : values.height;
      const weightKg = unitSystem === 'imperial' ? lbToKg(values.weight) : values.weight;

      // Prepare training preferences
      const trainingPrefs = {
        favorite_movements: values.favorite_movements || [],
        training_frequency: values.training_frequency || undefined,
        one_rm_formula: values.one_rm_formula || 'epley',
      };

      // Upsert profile
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          display_name: values.display_name,
          bio: values.bio || null,
          birthdate: values.birthdate,
          gender: values.gender,
          unit_system: values.unit_system,
          role: 'client', // Default role
          training_prefs: trainingPrefs,
        },
        { onConflict: 'id' }
      );

      if (profileError) throw profileError;

      // Upsert fitness metrics
      const { error: metricsError } = await supabase.from('fitness_metrics').upsert(
        {
          user_id: user.id,
          height_cm: heightCm,
          weight_kg: weightKg,
          resting_hr: values.resting_hr || null,
        },
        { onConflict: 'user_id' }
      );

      if (metricsError) throw metricsError;

      // Insert initial measurement history entry
      const { error: historyError } = await supabase.from('measurement_history').insert({
        user_id: user.id,
        weight_kg: weightKg,
        measure_date: new Date().toISOString().slice(0, 10),
      });

      if (historyError) throw historyError;

      toast({
        title: 'Profile created successfully!',
        description: 'Welcome to FitsiteGonga!',
        variant: 'success',
      });

      // The guard in (app)/layout.tsx will automatically redirect to dashboard
      // once it detects the profile is complete
    } catch (error) {
      console.error('Account setup error:', error);
      toast({
        title: 'Setup failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = ['Profile', 'Metrics', 'Training'];
  const stepDescriptions = [
    'Tell us about yourself',
    'Your fitness measurements',
    'Training preferences',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Let&apos;s set up your account</h1>
            <p className="text-gray-600 mt-2">This takes about a minute.</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1;
                const isActive = step === stepNumber;
                const isCompleted = step > stepNumber;

                return (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    <div className="ml-2 hidden sm:block">
                      <p
                        className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        {title}
                      </p>
                      <p className="text-xs text-gray-400">{stepDescriptions[index]}</p>
                    </div>
                    {stepNumber < stepTitles.length && (
                      <div
                        className={`ml-4 h-0.5 w-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name *
                    </label>
                    <input
                      {...register('display_name')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your display name"
                    />
                    {errors.display_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.display_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio (optional)
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Tell us a bit about yourself..."
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birthdate *
                      </label>
                      <input
                        type="date"
                        {...register('birthdate')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {errors.birthdate && (
                        <p className="mt-1 text-sm text-red-600">{errors.birthdate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        {...register('gender')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="prefer_not">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="nonbinary">Non-binary</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-3">
                      Unit System
                    </span>
                    <fieldset className="mt-2">
                      <legend className="sr-only">Unit System</legend>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <input
                            id="unit-metric"
                            type="radio"
                            value="metric"
                            {...register('unit_system')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="unit-metric"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Metric (kg / cm)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="unit-imperial"
                            type="radio"
                            value="imperial"
                            {...register('unit_system')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="unit-imperial"
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            Imperial (lb / in)
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Fitness Metrics</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height ({unitSystem === 'imperial' ? 'inches' : 'cm'}) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('height', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={unitSystem === 'imperial' ? '70' : '175'}
                      />
                      {errors.height && (
                        <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'}) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('weight', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={unitSystem === 'imperial' ? '150' : '68'}
                      />
                      {errors.weight && (
                        <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                      )}
                    </div>
                  </div>

                  {/* BMI Preview */}
                  {bmiPreview && (
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">BMI:</span> {bmiPreview}
                        <span className="ml-2 text-blue-600">
                          (
                          {bmiPreview < 18.5
                            ? 'Underweight'
                            : bmiPreview < 25
                              ? 'Normal weight'
                              : bmiPreview < 30
                                ? 'Overweight'
                                : 'Obese'}
                          )
                        </span>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resting Heart Rate (optional)
                    </label>
                    <input
                      type="number"
                      {...register('resting_hr', { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="60"
                    />
                    {errors.resting_hr && (
                      <p className="mt-1 text-sm text-red-600">{errors.resting_hr.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Level (optional)
                    </label>
                    <select
                      {...register('activity_level')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select activity level</option>
                      <option value="sedentary">Sedentary (little/no exercise)</option>
                      <option value="light">Light (light exercise 1-3 days/week)</option>
                      <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                      <option value="active">Active (heavy exercise 6-7 days/week)</option>
                      <option value="athlete">Athlete (very heavy exercise, physical job)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Training Preferences</h2>
                  <p className="text-gray-600">
                    Tell us about your training preferences. You can change these later.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Favorite Movements (optional)
                    </label>
                    <div className="space-y-2">
                      {getMovementOptions().map(movement => (
                        <div key={movement.value} className="flex items-center">
                          <input
                            id={`movement-${movement.value}`}
                            type="checkbox"
                            value={movement.value}
                            {...register('favorite_movements')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`movement-${movement.value}`}
                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                          >
                            {movement.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Training Frequency (days per week)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      {...register('training_frequency', { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="3"
                    />
                    {errors.training_frequency && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.training_frequency.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      1RM Formula Preference
                    </label>
                    <select
                      {...register('one_rm_formula')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {getFormulaOptions().map(formula => (
                        <option key={formula.value} value={formula.value}>
                          {formula.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Used to calculate estimated one-rep max from your sets
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              <div className="flex space-x-3">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
