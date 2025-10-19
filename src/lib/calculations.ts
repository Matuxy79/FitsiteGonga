// 1RM Calculation Functions
export function epleyFormula(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

export function brzyckiFormula(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (36 / (37 - reps));
}

export function lombardiFormula(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * Math.pow(reps, 0.1);
}

export function oConnorFormula(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 40);
}

export function calculateOneRM(
  weight: number,
  reps: number,
  formula: 'epley' | 'brzycki' | 'lombardi' | 'oconnor' = 'epley'
): number {
  switch (formula) {
    case 'epley':
      return epleyFormula(weight, reps);
    case 'brzycki':
      return brzyckiFormula(weight, reps);
    case 'lombardi':
      return lombardiFormula(weight, reps);
    case 'oconnor':
      return oConnorFormula(weight, reps);
    default:
      return epleyFormula(weight, reps);
  }
}

// Strength Index (Wilks/IPF Points)
export function wilksCoefficient(bodyweight: number, gender: 'male' | 'female'): number {
  const a = gender === 'male' ? -216.0475144 : 594.31747775582;
  const b = gender === 'male' ? 16.2606339 : -27.23842536447;
  const c = gender === 'male' ? -0.002388645 : 0.82112226871;
  const d = gender === 'male' ? -0.00113732 : -0.00930733913;
  const e = gender === 'male' ? 7.01863e-6 : 4.731582e-5;
  const f = gender === 'male' ? -1.291e-8 : -9.054e-8;

  return (
    500 /
    (a +
      b * bodyweight +
      c * Math.pow(bodyweight, 2) +
      d * Math.pow(bodyweight, 3) +
      e * Math.pow(bodyweight, 4) +
      f * Math.pow(bodyweight, 5))
  );
}

export function calculateWilksPoints(
  total: number,
  bodyweight: number,
  gender: 'male' | 'female'
): number {
  return total * wilksCoefficient(bodyweight, gender);
}

// Body Composition
export function calculateBMI(weight: number, height: number): number {
  return weight / Math.pow(height / 100, 2);
}

export function calculateFFMI(weight: number, height: number, bodyFat: number): number {
  const leanMass = weight * (1 - bodyFat / 100);
  return leanMass / Math.pow(height / 100, 2);
}

// Body Fat Percentage
export function navyBodyFat(
  waist: number,
  neck: number,
  height: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    // For females, we need hip measurement too
    return 0; // Placeholder - would need hip measurement
  }
}

export function jacksonPollock3Site(
  skinfold1: number,
  skinfold2: number,
  skinfold3: number,
  age: number,
  gender: 'male' | 'female'
): number {
  const sum = skinfold1 + skinfold2 + skinfold3;

  if (gender === 'male') {
    return 495 / (1.10938 - 0.0008267 * sum + 0.0000016 * Math.pow(sum, 2) - 0.0002574 * age) - 450;
  } else {
    return (
      495 / (1.0994921 - 0.0009929 * sum + 0.0000023 * Math.pow(sum, 2) - 0.0001392 * age) - 450
    );
  }
}

// Metabolic Calculations
export function mifflinStJeorBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function harrisBenedictBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
}

export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return bmr * multipliers[activityLevel];
}

// Utility Functions
export function convertKgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function convertLbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

export function convertCmToInches(cm: number): number {
  return cm / 2.54;
}

export function convertInchesToCm(inches: number): number {
  return inches * 2.54;
}

// BMI Categories
export function getBMICategory(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25) return { category: 'Normal', color: 'text-green-400' };
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-400' };
  return { category: 'Obese', color: 'text-red-400' };
}

// FFMI Categories
export function getFFMICategory(
  ffmi: number,
  gender: 'male' | 'female'
): { category: string; color: string } {
  const thresholds =
    gender === 'male'
      ? {
          below_average: 16,
          average: 18,
          above_average: 20,
          excellent: 22,
        }
      : {
          below_average: 14,
          average: 16,
          above_average: 18,
          excellent: 20,
        };

  if (ffmi < thresholds.below_average) return { category: 'Below Average', color: 'text-red-400' };
  if (ffmi < thresholds.average) return { category: 'Average', color: 'text-yellow-400' };
  if (ffmi < thresholds.above_average) return { category: 'Above Average', color: 'text-blue-400' };
  if (ffmi < thresholds.excellent) return { category: 'Good', color: 'text-green-400' };
  return { category: 'Excellent', color: 'text-green-500' };
}
