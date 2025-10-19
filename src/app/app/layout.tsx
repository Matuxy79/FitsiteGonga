'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useProfileComplete } from '@/hooks/useProfileComplete';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { isComplete, isLoading, error } = useProfileComplete();

  useEffect(() => {
    if (isLoading) return;

    // If profile is not complete, redirect to account-setup
    if (!isComplete && path !== '/app/account-setup') {
      router.push('/app/account-setup');
      return;
    }

    // If profile is complete and we're on account-setup, redirect to app dashboard
    if (isComplete && path === '/app/account-setup') {
      router.push('/app');
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
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="pl-60 flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
