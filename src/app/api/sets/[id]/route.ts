import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the set belongs to the user
    const { data: exerciseSet, error: setError } = await supabase
      .from('exercise_sets')
      .select(
        `
        *,
        session_exercise:session_exercises!inner(
          session:workout_sessions!inner(user_id)
        )
      `
      )
      .eq('id', id)
      .eq('session_exercise.session.user_id', user.id)
      .single();

    if (setError || !exerciseSet) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    // Update exercise set
    const { data, error } = await supabase
      .from('exercise_sets')
      .update({
        weight_kg: body.weight_kg,
        reps: body.reps,
        rpe: body.rpe,
        tempo: body.tempo,
        duration_sec: body.duration_sec,
        distance_m: body.distance_m,
        notes: body.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating set:', error);
      return NextResponse.json({ error: 'Failed to update set' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Update set error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the set belongs to the user
    const { data: exerciseSet, error: setError } = await supabase
      .from('exercise_sets')
      .select(
        `
        *,
        session_exercise:session_exercises!inner(
          session:workout_sessions!inner(user_id)
        )
      `
      )
      .eq('id', id)
      .eq('session_exercise.session.user_id', user.id)
      .single();

    if (setError || !exerciseSet) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    const { error } = await supabase.from('exercise_sets').delete().eq('id', id);

    if (error) {
      console.error('Error deleting set:', error);
      return NextResponse.json({ error: 'Failed to delete set' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Set deleted successfully' });
  } catch (error) {
    console.error('Delete set error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
