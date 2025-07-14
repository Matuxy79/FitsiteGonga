import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Fetch the user from the database
    const { data, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (error || !data) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify the password
    const isPasswordValid = verifyPassword(password, data.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Password is valid, return success
    return NextResponse.json(
      {
        message: 'Authentication successful',
        user: {
          id: data.id,
          email: data.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
