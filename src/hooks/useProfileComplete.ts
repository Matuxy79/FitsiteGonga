import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, ProfileCompletionStatus } from '@/types/profile';

export function useProfileComplete(): ProfileCompletionStatus {
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    isComplete: false,
    missingFields: [],
    profile: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const checkProfileCompletion = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }));

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setStatus({
              isComplete: false,
              missingFields: ['authentication'],
              profile: null,
              isLoading: false,
              error: 'User not authenticated',
            });
          }
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!profile) {
          if (mounted) {
            setStatus({
              isComplete: false,
              missingFields: ['profile'],
              profile: null,
              isLoading: false,
              error: null,
            });
          }
          return;
        }

        // Check required fields for profile completion
        const requiredFields = ['display_name', 'birthdate', 'unit_system'] as const;
        const missingFields: string[] = [];

        requiredFields.forEach(field => {
          if (!profile[field]) {
            missingFields.push(field);
          }
        });

        const isComplete = missingFields.length === 0;

        if (mounted) {
          setStatus({
            isComplete,
            missingFields,
            profile,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Profile completion check error:', error);
        if (mounted) {
          setStatus({
            isComplete: false,
            missingFields: ['error'],
            profile: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    };

    checkProfileCompletion();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkProfileCompletion();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return status;
}
