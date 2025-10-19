import { create } from 'zustand';
import { WorkoutSession, SessionExercise, ExerciseSet } from '@/types/training';

interface WorkoutState {
  // Active session state
  activeSession: WorkoutSession | null;
  currentExercise: SessionExercise | null;

  // Session management
  startSession: (title?: string) => Promise<void>;
  endSession: () => Promise<void>;
  addExercise: (exerciseId: string) => Promise<void>;
  removeExercise: (sessionExerciseId: string) => Promise<void>;

  // Set management
  addSet: (sessionExerciseId: string, setData: Partial<ExerciseSet>) => Promise<void>;
  updateSet: (setId: string, setData: Partial<ExerciseSet>) => Promise<void>;
  removeSet: (setId: string) => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeSession: null,
  currentExercise: null,
  isLoading: false,
  error: null,

  startSession: async (title?: string) => {
    set({ isLoading: true, error: null });

    try {
      // This would call the API to create a new session
      // For now, we'll create a local session object
      const newSession: WorkoutSession = {
        id: `temp-${Date.now()}`,
        user_id: '', // Will be set by API
        started_at: new Date().toISOString(),
        title: title || 'Workout Session',
        session_exercises: [],
      };

      set({ activeSession: newSession, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start session',
        isLoading: false,
      });
    }
  },

  endSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({ isLoading: true, error: null });

    try {
      // This would call the API to end the session
      set({ activeSession: null, currentExercise: null, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to end session',
        isLoading: false,
      });
    }
  },

  addExercise: async (exerciseId: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({ isLoading: true, error: null });

    try {
      const newExercise: SessionExercise = {
        id: `temp-${Date.now()}`,
        session_id: activeSession.id,
        exercise_id: exerciseId,
        order_index: activeSession.session_exercises?.length || 0,
        exercise_sets: [],
      };

      const updatedSession = {
        ...activeSession,
        session_exercises: [...(activeSession.session_exercises || []), newExercise],
      };

      set({ activeSession: updatedSession, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add exercise',
        isLoading: false,
      });
    }
  },

  removeExercise: async (sessionExerciseId: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({ isLoading: true, error: null });

    try {
      const updatedSession = {
        ...activeSession,
        session_exercises:
          activeSession.session_exercises?.filter(ex => ex.id !== sessionExerciseId) || [],
      };

      set({ activeSession: updatedSession, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove exercise',
        isLoading: false,
      });
    }
  },

  addSet: async (sessionExerciseId: string, setData: Partial<ExerciseSet>) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({ isLoading: true, error: null });

    try {
      const newSet: ExerciseSet = {
        id: `temp-${Date.now()}`,
        session_exercise_id: sessionExerciseId,
        set_index: 1,
        performed_at: new Date().toISOString(),
        ...setData,
      };

      // Update the session with the new set
      const updatedSession = {
        ...activeSession,
        session_exercises:
          activeSession.session_exercises?.map(ex => {
            if (ex.id === sessionExerciseId) {
              return {
                ...ex,
                exercise_sets: [...(ex.exercise_sets || []), newSet],
              };
            }
            return ex;
          }) || [],
      };

      set({ activeSession: updatedSession, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add set',
        isLoading: false,
      });
    }
  },

  updateSet: async (setId: string, setData: Partial<ExerciseSet>) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({ isLoading: true, error: null });

    try {
      const updatedSession = {
        ...activeSession,
        session_exercises:
          activeSession.session_exercises?.map(ex => ({
            ...ex,
            exercise_sets:
              ex.exercise_sets?.map(set => (set.id === setId ? { ...set, ...setData } : set)) || [],
          })) || [],
      };

      set({ activeSession: updatedSession, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update set',
        isLoading: false,
      });
    }
  },

  removeSet: async (setId: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({ isLoading: true, error: null });

    try {
      const updatedSession = {
        ...activeSession,
        session_exercises:
          activeSession.session_exercises?.map(ex => ({
            ...ex,
            exercise_sets: ex.exercise_sets?.filter(set => set.id !== setId) || [],
          })) || [],
      };

      set({ activeSession: updatedSession, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove set',
        isLoading: false,
      });
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
