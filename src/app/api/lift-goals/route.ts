import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('lift_goals')
      .select(
        `
        *,
        movement:movements(*)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lift goals:', error);
      return NextResponse.json({ error: 'Failed to fetch lift goals' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Lift goals API error:', error);
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

    // Create lift goal
    const { data, error } = await supabase
      .from('lift_goals')
      .insert([
        {
          user_id: user.id,
          movement_id: body.movement_id,
          target_1rm_kg: body.target_1rm_kg,
          target_weight_kg: body.target_weight_kg,
          target_reps: body.target_reps,
          due_date: body.due_date,
        },
      ])
      .select(
        `
        *,
        movement:movements(*)
      `
      )
      .single();

    if (error) {
      console.error('Error creating lift goal:', error);
      return NextResponse.json({ error: 'Failed to create lift goal' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Create lift goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
