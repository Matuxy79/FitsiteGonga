import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching movements:', error);
      return NextResponse.json({ error: 'Failed to fetch movements' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Movements API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
