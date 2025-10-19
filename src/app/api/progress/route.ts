import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logProgressSchema } from '@/schema/challenge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const challengeId = searchParams.get('challenge_id');

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('progress_logs')
      .select(
        `
        *,
        user:profiles(display_name, avatar_url),
        challenge:challenges(name, goal_unit)
      `
      )
      .order('logged_at', { ascending: false });

    // Filter by user if specified (only own logs or trainer/admin can view others)
    if (userId) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Users can only view their own logs unless they're a trainer/admin
      if (userId !== user.id && !['trainer', 'admin'].includes(userData.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      query = query.eq('user_id', userId);
    } else {
      // If no user specified, return current user's logs
      query = query.eq('user_id', user.id);
    }

    // Filter by challenge if specified
    if (challengeId) {
      query = query.eq('challenge_id', challengeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching progress logs:', error);
      return NextResponse.json({ error: 'Failed to fetch progress logs' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = logProgressSchema.parse(body);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is participating in the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('participants')
      .eq('id', validatedData.challenge_id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (!challenge.participants.includes(user.id)) {
      return NextResponse.json(
        { error: 'You are not participating in this challenge' },
        { status: 403 }
      );
    }

    // Create progress log
    const { data, error } = await supabase
      .from('progress_logs')
      .insert([
        {
          ...validatedData,
          user_id: user.id,
        },
      ])
      .select(
        `
        *,
        user:profiles(display_name, avatar_url),
        challenge:challenges(name, goal_unit)
      `
      )
      .single();

    if (error) {
      console.error('Error creating progress log:', error);
      return NextResponse.json({ error: 'Failed to log progress' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Log progress error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
