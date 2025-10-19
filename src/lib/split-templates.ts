import type { SplitTemplate } from '@/types/panels';

export const SPLIT_TEMPLATES: Record<string, SplitTemplate[]> = {
  push_pull_legs: [
    {
      name: 'Push A',
      exercises: [
        { movement: 'bench_press', sets: 4, reps: '6-8', notes: 'Main movement' },
        { movement: 'overhead_press', sets: 3, reps: '8-10', notes: 'Secondary press' },
        { movement: 'incline_dumbbell_press', sets: 3, reps: '10-12', notes: 'Accessory' },
        { movement: 'lateral_raises', sets: 3, reps: '12-15', notes: 'Isolation' },
        { movement: 'tricep_dips', sets: 3, reps: '8-12', notes: 'Tricep focus' },
      ],
    },
    {
      name: 'Pull A',
      exercises: [
        { movement: 'deadlift', sets: 4, reps: '5', notes: 'Main movement' },
        { movement: 'pull_up', sets: 4, reps: '6-8', notes: 'Vertical pull' },
        { movement: 'barbell_row', sets: 3, reps: '8-10', notes: 'Horizontal pull' },
        { movement: 'face_pulls', sets: 3, reps: '12-15', notes: 'Rear delts' },
        { movement: 'bicep_curls', sets: 3, reps: '10-12', notes: 'Bicep focus' },
      ],
    },
    {
      name: 'Legs A',
      exercises: [
        { movement: 'back_squat', sets: 4, reps: '6-8', notes: 'Main movement' },
        { movement: 'romanian_deadlift', sets: 3, reps: '8-10', notes: 'Hamstring focus' },
        { movement: 'bulgarian_split_squats', sets: 3, reps: '10-12', notes: 'Unilateral' },
        { movement: 'calf_raises', sets: 4, reps: '15-20', notes: 'Calves' },
        { movement: 'plank', sets: 3, reps: '60s', notes: 'Core' },
      ],
    },
  ],
  upper_lower: [
    {
      name: 'Upper A',
      exercises: [
        { movement: 'bench_press', sets: 4, reps: '6-8', notes: 'Horizontal push' },
        { movement: 'pull_up', sets: 4, reps: '6-8', notes: 'Vertical pull' },
        { movement: 'overhead_press', sets: 3, reps: '8-10', notes: 'Vertical push' },
        { movement: 'barbell_row', sets: 3, reps: '8-10', notes: 'Horizontal pull' },
        { movement: 'dips', sets: 3, reps: '8-12', notes: 'Accessory push' },
        { movement: 'bicep_curls', sets: 3, reps: '10-12', notes: 'Arm isolation' },
      ],
    },
    {
      name: 'Lower A',
      exercises: [
        { movement: 'back_squat', sets: 4, reps: '6-8', notes: 'Main squat pattern' },
        { movement: 'deadlift', sets: 4, reps: '5', notes: 'Hip hinge pattern' },
        { movement: 'bulgarian_split_squats', sets: 3, reps: '10-12', notes: 'Unilateral' },
        { movement: 'romanian_deadlift', sets: 3, reps: '8-10', notes: 'Hamstring focus' },
        { movement: 'calf_raises', sets: 4, reps: '15-20', notes: 'Calves' },
        { movement: 'plank', sets: 3, reps: '60s', notes: 'Core' },
      ],
    },
  ],
  full_body: [
    {
      name: 'Full Body A',
      exercises: [
        { movement: 'back_squat', sets: 3, reps: '8-10', notes: 'Legs' },
        { movement: 'bench_press', sets: 3, reps: '8-10', notes: 'Push' },
        { movement: 'barbell_row', sets: 3, reps: '8-10', notes: 'Pull' },
        { movement: 'overhead_press', sets: 3, reps: '8-12', notes: 'Shoulders' },
        { movement: 'pull_up', sets: 3, reps: '6-10', notes: 'Vertical pull' },
        { movement: 'plank', sets: 3, reps: '45s', notes: 'Core' },
      ],
    },
    {
      name: 'Full Body B',
      exercises: [
        { movement: 'deadlift', sets: 3, reps: '5-8', notes: 'Hip hinge' },
        { movement: 'incline_dumbbell_press', sets: 3, reps: '8-12', notes: 'Push variation' },
        { movement: 'lat_pulldown', sets: 3, reps: '8-12', notes: 'Pull variation' },
        { movement: 'lateral_raises', sets: 3, reps: '12-15', notes: 'Shoulders' },
        { movement: 'goblet_squat', sets: 3, reps: '10-15', notes: 'Squat variation' },
        { movement: 'russian_twists', sets: 3, reps: '20', notes: 'Core rotation' },
      ],
    },
  ],
  bro: [
    {
      name: 'Chest & Triceps',
      exercises: [
        { movement: 'bench_press', sets: 4, reps: '6-8', notes: 'Main chest' },
        { movement: 'incline_dumbbell_press', sets: 3, reps: '8-10', notes: 'Upper chest' },
        { movement: 'dumbbell_flyes', sets: 3, reps: '10-12', notes: 'Chest isolation' },
        { movement: 'dips', sets: 3, reps: '8-12', notes: 'Tricep focus' },
        { movement: 'tricep_pushdowns', sets: 3, reps: '10-12', notes: 'Tricep isolation' },
      ],
    },
    {
      name: 'Back & Biceps',
      exercises: [
        { movement: 'deadlift', sets: 4, reps: '5', notes: 'Main back' },
        { movement: 'pull_up', sets: 4, reps: '6-8', notes: 'Lat focus' },
        { movement: 'barbell_row', sets: 3, reps: '8-10', notes: 'Middle back' },
        { movement: 'bicep_curls', sets: 3, reps: '10-12', notes: 'Bicep main' },
        { movement: 'hammer_curls', sets: 3, reps: '10-12', notes: 'Bicep variation' },
      ],
    },
    {
      name: 'Legs & Shoulders',
      exercises: [
        { movement: 'back_squat', sets: 4, reps: '6-8', notes: 'Main legs' },
        { movement: 'romanian_deadlift', sets: 3, reps: '8-10', notes: 'Hamstrings' },
        { movement: 'overhead_press', sets: 3, reps: '8-10', notes: 'Shoulder press' },
        { movement: 'lateral_raises', sets: 3, reps: '12-15', notes: 'Side delts' },
        { movement: 'calf_raises', sets: 4, reps: '15-20', notes: 'Calves' },
      ],
    },
  ],
};

export function getTodayTemplate(
  split: string,
  weekMap: Record<string, string>
): SplitTemplate | null {
  const templates = SPLIT_TEMPLATES[split];
  if (!templates) return null;

  const today = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as keyof typeof weekMap;
  const templateName = weekMap[today];

  if (!templateName) return null;

  return templates.find(t => t.name === templateName) || null;
}

export function getWeekMapForSplit(split: string): Record<string, string> {
  const templates = SPLIT_TEMPLATES[split];
  if (!templates) return {};

  switch (split) {
    case 'push_pull_legs':
      return {
        monday: 'Push A',
        tuesday: 'Pull A',
        wednesday: 'Legs A',
        thursday: 'Push A',
        friday: 'Pull A',
        saturday: 'Legs A',
        sunday: 'Rest',
      };
    case 'upper_lower':
      return {
        monday: 'Upper A',
        tuesday: 'Lower A',
        wednesday: 'Upper A',
        thursday: 'Lower A',
        friday: 'Upper A',
        saturday: 'Lower A',
        sunday: 'Rest',
      };
    case 'full_body':
      return {
        monday: 'Full Body A',
        tuesday: 'Rest',
        wednesday: 'Full Body B',
        thursday: 'Rest',
        friday: 'Full Body A',
        saturday: 'Rest',
        sunday: 'Full Body B',
      };
    case 'bro':
      return {
        monday: 'Chest & Triceps',
        tuesday: 'Back & Biceps',
        wednesday: 'Legs & Shoulders',
        thursday: 'Chest & Triceps',
        friday: 'Back & Biceps',
        saturday: 'Legs & Shoulders',
        sunday: 'Rest',
      };
    default:
      return {};
  }
}
