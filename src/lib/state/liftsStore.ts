import { create } from 'zustand';
import { Movement, Exercise, UserPR, LiftGoal } from '@/types/training';

interface LiftsState {
  // Data
  movements: Movement[];
  exercises: Exercise[];
  userPRs: UserPR[];
  liftGoals: LiftGoal[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMovements: () => Promise<void>;
  fetchExercises: (movementId?: string) => Promise<void>;
  fetchUserPRs: () => Promise<void>;
  fetchLiftGoals: () => Promise<void>;

  // Goal management
  createLiftGoal: (goalData: Partial<LiftGoal>) => Promise<void>;
  updateLiftGoal: (goalId: string, goalData: Partial<LiftGoal>) => Promise<void>;
  deleteLiftGoal: (goalId: string) => Promise<void>;

  // Utility
  getMovementById: (id: string) => Movement | undefined;
  getExerciseById: (id: string) => Exercise | undefined;
  getPRByMovement: (movementId: string) => UserPR | undefined;
  getGoalByMovement: (movementId: string) => LiftGoal | undefined;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useLiftsStore = create<LiftsState>((set, get) => ({
  movements: [],
  exercises: [],
  userPRs: [],
  liftGoals: [],
  isLoading: false,
  error: null,

  fetchMovements: async () => {
    set({ isLoading: true, error: null });

    try {
      // This would call the API to fetch movements
      // For now, we'll use mock data
      const mockMovements: Movement[] = [
        {
          id: '1',
          key: 'bench_press',
          name: 'Bench Press',
          category: 'compound',
          primary_muscles: ['chest', 'triceps'],
          secondary_muscles: ['shoulders'],
          default_equipment: 'barbell',
          is_bodyweight: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          key: 'back_squat',
          name: 'Back Squat',
          category: 'compound',
          primary_muscles: ['quads', 'glutes'],
          secondary_muscles: ['hamstrings'],
          default_equipment: 'barbell',
          is_bodyweight: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          key: 'deadlift',
          name: 'Deadlift',
          category: 'compound',
          primary_muscles: ['back', 'glutes', 'hamstrings'],
          secondary_muscles: ['traps'],
          default_equipment: 'barbell',
          is_bodyweight: false,
          created_at: new Date().toISOString(),
        },
      ];

      set({ movements: mockMovements, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch movements',
        isLoading: false,
      });
    }
  },

  fetchExercises: async (movementId?: string) => {
    set({ isLoading: true, error: null });

    try {
      // This would call the API to fetch exercises
      // For now, we'll use mock data
      const mockExercises: Exercise[] = [
        {
          id: '1',
          movement_id: '1',
          variation: '',
          name: 'Bench Press',
          media_url: undefined,
        },
        {
          id: '2',
          movement_id: '2',
          variation: '',
          name: 'Back Squat',
          media_url: undefined,
        },
        {
          id: '3',
          movement_id: '3',
          variation: '',
          name: 'Deadlift',
          media_url: undefined,
        },
      ];

      set({ exercises: mockExercises, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch exercises',
        isLoading: false,
      });
    }
  },

  fetchUserPRs: async () => {
    set({ isLoading: true, error: null });

    try {
      // This would call the API to fetch user PRs
      // For now, we'll use empty array
      set({ userPRs: [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch PRs',
        isLoading: false,
      });
    }
  },

  fetchLiftGoals: async () => {
    set({ isLoading: true, error: null });

    try {
      // This would call the API to fetch lift goals
      // For now, we'll use empty array
      set({ liftGoals: [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch lift goals',
        isLoading: false,
      });
    }
  },

  createLiftGoal: async (goalData: Partial<LiftGoal>) => {
    set({ isLoading: true, error: null });

    try {
      // This would call the API to create a lift goal
      const newGoal: LiftGoal = {
        id: `temp-${Date.now()}`,
        user_id: '', // Will be set by API
        movement_id: goalData.movement_id || '',
        target_1rm_kg: goalData.target_1rm_kg,
        target_weight_kg: goalData.target_weight_kg,
        target_reps: goalData.target_reps,
        due_date: goalData.due_date,
        created_at: new Date().toISOString(),
      };

      const { liftGoals } = get();
      set({ liftGoals: [...liftGoals, newGoal], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create lift goal',
        isLoading: false,
      });
    }
  },

  updateLiftGoal: async (goalId: string, goalData: Partial<LiftGoal>) => {
    set({ isLoading: true, error: null });

    try {
      // This would call the API to update a lift goal
      const { liftGoals } = get();
      const updatedGoals = liftGoals.map(goal =>
        goal.id === goalId ? { ...goal, ...goalData } : goal
      );

      set({ liftGoals: updatedGoals, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update lift goal',
        isLoading: false,
      });
    }
  },

  deleteLiftGoal: async (goalId: string) => {
    set({ isLoading: true, error: null });

    try {
      // This would call the API to delete a lift goal
      const { liftGoals } = get();
      const updatedGoals = liftGoals.filter(goal => goal.id !== goalId);

      set({ liftGoals: updatedGoals, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete lift goal',
        isLoading: false,
      });
    }
  },

  getMovementById: (id: string) => {
    const { movements } = get();
    return movements.find(m => m.id === id);
  },

  getExerciseById: (id: string) => {
    const { exercises } = get();
    return exercises.find(e => e.id === id);
  },

  getPRByMovement: (movementId: string) => {
    const { userPRs } = get();
    return userPRs.find(pr => pr.movement_id === movementId);
  },

  getGoalByMovement: (movementId: string) => {
    const { liftGoals } = get();
    return liftGoals.find(goal => goal.movement_id === movementId);
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
