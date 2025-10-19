import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session exercise belongs to the user
    const { data: sessionExercise, error: sessionError } = await supabase
      .from('session_exercises')
      .select(
        `
        *,
        session:workout_sessions!inner(user_id)
      `
      )
      .eq('id', body.session_exercise_id)
      .eq('session.user_id', user.id)
      .single();

    if (sessionError || !sessionExercise) {
      return NextResponse.json({ error: 'Session exercise not found' }, { status: 404 });
    }

    // Create exercise set
    const { data, error } = await supabase
      .from('exercise_sets')
      .insert([
        {
          session_exercise_id: body.session_exercise_id,
          set_index: body.set_index || 1,
          weight_kg: body.weight_kg,
          reps: body.reps,
          rpe: body.rpe,
          tempo: body.tempo,
          duration_sec: body.duration_sec,
          distance_m: body.distance_m,
          notes: body.notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating set:', error);
      return NextResponse.json({ error: 'Failed to create set' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Create set error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
