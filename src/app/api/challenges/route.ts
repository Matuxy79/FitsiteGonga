import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createChallengeSchema } from '@/schema/challenge'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching challenges:', error)
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Challenges API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createChallengeSchema.parse(body)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a trainer
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !['trainer', 'admin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Create challenge
    const { data, error } = await supabase
      .from('challenges')
      .insert([{
        ...validatedData,
        created_by: user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating challenge:', error)
      return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Create challenge error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
