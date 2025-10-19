import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const limit = searchParams.get('limit');

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
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
      .eq('user_id', userId || user.id)
      .order('started_at', { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workouts:', error);
      return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Workouts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Create workout session
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([
        {
          user_id: user.id,
          title: body.title || null,
          notes: body.notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating workout:', error);
      return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Create workout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
