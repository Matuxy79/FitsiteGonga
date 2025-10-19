import { supabase } from '@/lib/supabase';

/**
 * Check if user's profile is complete and return appropriate redirect path
 */
export async function getPostAuthRedirect(): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return '/login';
    }

    // Check if profile has required fields
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, birthdate, unit_system')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || !profile.display_name || !profile.birthdate || !profile.unit_system) {
      return '/app/account-setup';
    }

    return '/app';
  } catch (error) {
    console.error('Profile redirect check error:', error);
    // On error, redirect to account-setup to be safe
    return '/app/account-setup';
  }
}
