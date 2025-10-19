import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movementId = searchParams.get('movement_id');

    let query = supabase
      .from('exercises')
      .select(
        `
        *,
        movement:movements(*)
      `
      )
      .order('name', { ascending: true });

    if (movementId) {
      query = query.eq('movement_id', movementId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exercises:', error);
      return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Exercises API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
