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

    const { data, error } = await supabase
      .from('lift_goals')
      .update({
        target_1rm_kg: body.target_1rm_kg,
        target_weight_kg: body.target_weight_kg,
        target_reps: body.target_reps,
        due_date: body.due_date,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(
        `
        *,
        movement:movements(*)
      `
      )
      .single();

    if (error) {
      console.error('Error updating lift goal:', error);
      return NextResponse.json({ error: 'Failed to update lift goal' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Update lift goal error:', error);
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
      .from('lift_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting lift goal:', error);
      return NextResponse.json({ error: 'Failed to delete lift goal' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Lift goal deleted successfully' });
  } catch (error) {
    console.error('Delete lift goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
