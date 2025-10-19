import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || 'week'; // 'week' or 'month'

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    if (timeRange === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      startDate.setDate(endDate.getDate() - 30);
    }

    // Aggregate tonnage by date
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(
        `
        tonnage_kg,
        performed_at,
        session_exercise:session_exercises!inner(
          session:workout_sessions!inner(
            user_id
          )
        )
      `
      )
      .eq('session_exercise.session.user_id', user.id)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (error) {
      console.error('Error fetching volume data:', error);
      return NextResponse.json({ error: 'Failed to fetch volume data' }, { status: 500 });
    }

    // Group by date and sum tonnage
    const volumeByDate: { [key: string]: number } = {};

    data?.forEach(set => {
      if (set.tonnage_kg && set.performed_at) {
        const date = new Date(set.performed_at).toISOString().split('T')[0];
        volumeByDate[date] = (volumeByDate[date] || 0) + parseFloat(set.tonnage_kg.toString());
      }
    });

    // Convert to array format expected by VolumeChart
    const volumeData = Object.entries(volumeByDate)
      .map(([date, volume]) => ({
        date,
        volume: Math.round(volume * 100) / 100, // Round to 2 decimal places
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ data: volumeData });
  } catch (error) {
    console.error('Volume API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
