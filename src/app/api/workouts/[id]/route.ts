import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(
        `
        *,
        session_exercises (
          *,
          exercise:exercises (
            *,
            movement:movements (*)
          ),
          exercise_sets (*)
        )
      `
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching workout:', error);
      return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Workout API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        title: body.title,
        notes: body.notes,
        ended_at: body.ended_at,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workout:', error);
      return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Update workout error:', error);
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

    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting workout:', error);
      return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
