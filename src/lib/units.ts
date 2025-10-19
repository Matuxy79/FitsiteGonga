// Unit conversion utilities for FitsiteGonga

// Weight conversions
export const kgToLb = (kg: number): number => {
  return Number((kg * 2.2046226218).toFixed(1));
};

export const lbToKg = (lb: number): number => {
  return Number((lb / 2.2046226218).toFixed(1));
};

// Length conversions
export const cmToIn = (cm: number): number => {
  return Number((cm / 2.54).toFixed(1));
};

export const inToCm = (inches: number): number => {
  return Number((inches * 2.54).toFixed(1));
};

// Format numbers for display
export const formatWeight = (weight: number, unitSystem: 'metric' | 'imperial'): string => {
  if (unitSystem === 'imperial') {
    return `${weight} lbs`;
  }
  return `${weight} kg`;
};

export const formatHeight = (height: number, unitSystem: 'metric' | 'imperial'): string => {
  if (unitSystem === 'imperial') {
    return `${height} in`;
  }
  return `${height} cm`;
};

// Convert and format for display
export const convertAndFormatWeight = (
  weight: number,
  fromUnit: 'metric' | 'imperial',
  toUnit: 'metric' | 'imperial'
): string => {
  let convertedWeight: number;

  if (fromUnit === 'metric' && toUnit === 'imperial') {
    convertedWeight = kgToLb(weight);
  } else if (fromUnit === 'imperial' && toUnit === 'metric') {
    convertedWeight = lbToKg(weight);
  } else {
    convertedWeight = weight;
  }

  return formatWeight(convertedWeight, toUnit);
};

export const convertAndFormatHeight = (
  height: number,
  fromUnit: 'metric' | 'imperial',
  toUnit: 'metric' | 'imperial'
): string => {
  let convertedHeight: number;

  if (fromUnit === 'metric' && toUnit === 'imperial') {
    convertedHeight = cmToIn(height);
  } else if (fromUnit === 'imperial' && toUnit === 'metric') {
    convertedHeight = inToCm(height);
  } else {
    convertedHeight = height;
  }

  return formatHeight(convertedHeight, toUnit);
};
