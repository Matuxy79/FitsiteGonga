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

    // Get user PRs from the view
    const { data, error } = await supabase
      .from('v_user_prs')
      .select('*')
      .eq('user_id', user.id)
      .order('best_1rm_kg', { ascending: false });

    if (error) {
      console.error('Error fetching PRs:', error);
      return NextResponse.json({ error: 'Failed to fetch PRs' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PRs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
