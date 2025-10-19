'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useProfileComplete } from '@/hooks/useProfileComplete';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { isComplete, isLoading, error } = useProfileComplete();

  useEffect(() => {
    if (isLoading) return;

    // Only apply guard logic for protected routes
    // The (app) route group contains protected routes, so we need to guard them

    // If profile is not complete and we're not on account-setup, redirect to account-setup
    if (!isComplete && path !== '/account-setup') {
      router.push('/account-setup');
      return;
    }

    // If profile is complete and we're on account-setup, redirect to dashboard (root of app group)
    if (isComplete && path === '/account-setup') {
      router.push('/');
      return;
    }
  }, [isComplete, isLoading, path, router]);

  // Show loading state while checking profile completion
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (error && error === 'User not authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen flex bg-gray-50">{children}</div>;
}
