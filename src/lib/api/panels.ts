import { supabase } from '@/lib/supabase';
import type {
  EnergyCheckin,
  Channel,
  Message,
  Plan,
  UserPR,
  LiftGoal,
  ExerciseSet,
  MeasurementHistory,
  FitnessMetrics,
  WorkoutSession,
  Movement,
  Exercise,
  SessionExercise,
  TrainingPrefs,
} from '@/types/panels';

// Energy Check-ins API
export async function createEnergyCheckin(
  mode: 'rest' | 'training',
  energy?: 'low' | 'med' | 'high',
  note?: string
): Promise<EnergyCheckin | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('energy_checkins')
    .insert({
      user_id: user.id,
      mode,
      energy,
      note,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentEnergyCheckins(limit = 7): Promise<EnergyCheckin[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('energy_checkins')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Training Preferences API
export async function updateTrainingPrefs(prefs: Partial<TrainingPrefs>): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({ training_prefs: prefs })
    .eq('id', user.id);

  if (error) throw error;
}

export async function getTrainingPrefs(): Promise<TrainingPrefs> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('training_prefs')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data?.training_prefs || {};
}

// User PRs API
export async function getUserPRs(): Promise<UserPR[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.from('v_user_prs').select('*').eq('user_id', user.id);

  if (error) throw error;
  return data || [];
}

// Lift Goals API
export async function getLiftGoals(): Promise<LiftGoal[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('lift_goals')
    .select(
      `
      *,
      movement:movements(id, name, key)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createLiftGoal(
  movementId: string,
  target1RM?: number,
  targetWeight?: number,
  targetReps?: number,
  dueDate?: string
): Promise<LiftGoal | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('lift_goals')
    .insert({
      user_id: user.id,
      movement_id: movementId,
      target_1rm_kg: target1RM,
      target_weight_kg: targetWeight,
      target_reps: targetReps,
      due_date: dueDate,
    })
    .select(
      `
      *,
      movement:movements(id, name, key)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// Exercise Sets API
export async function getLatestSetForMovement(movementId: string): Promise<ExerciseSet | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('exercise_sets')
    .select(
      `
      *,
      session_exercise:session_exercises!inner(
        session:workout_sessions!inner(
          user_id
        ),
        exercise:exercises!inner(
          movement_id
        )
      )
    `
    )
    .eq('session_exercise.session.user_id', user.id)
    .eq('session_exercise.exercise.movement_id', movementId)
    .order('performed_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data || null;
}

// Chat API
export async function getChannels(): Promise<Channel[]> {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getMessages(channelId: string, limit = 50): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(
      `
      *,
      user:profiles(id, display_name, avatar_url)
    `
    )
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).reverse();
}

export async function sendMessage(channelId: string, content: string): Promise<Message | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      channel_id: channelId,
      user_id: user.id,
      content,
    })
    .select(
      `
      *,
      user:profiles(id, display_name, avatar_url)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.from('messages').delete().eq('id', messageId);

  if (error) throw error;
}

// User Role/Tier API
export async function getUserRole(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (error) throw error;
  return data?.role || 'client';
}

export async function getUserTier(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('plans')
    .select('tier')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data?.tier || 'free';
}

export async function isTrainer(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'trainer' || role === 'admin';
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

// Workout Sessions API
export async function getTodaySession(): Promise<WorkoutSession | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('started_at', `${today}T00:00:00.000Z`)
    .lt('started_at', `${today}T23:59:59.999Z`)
    .is('ended_at', null)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data || null;
}

export async function createWorkoutSession(title?: string): Promise<WorkoutSession | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      title,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Movements API
export async function getMovements(): Promise<Movement[]> {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getExercisesByMovement(movementId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(
      `
      *,
      movement:movements(*)
    `
    )
    .eq('movement_id', movementId);

  if (error) throw error;
  return data || [];
}

// Measurements API
export async function getLatestMeasurement(): Promise<MeasurementHistory | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('measurement_history')
    .select('*')
    .eq('user_id', user.id)
    .order('measure_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data || null;
}

export async function createMeasurement(
  weight?: number,
  bodyFat?: number,
  waist?: number,
  hips?: number,
  chest?: number,
  notes?: string
): Promise<MeasurementHistory | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('measurement_history')
    .insert({
      user_id: user.id,
      weight_kg: weight,
      body_fat_percent: bodyFat,
      waist_cm: waist,
      hips_cm: hips,
      chest_cm: chest,
      notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFitnessMetrics(): Promise<FitnessMetrics | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('fitness_metrics')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data || null;
}
