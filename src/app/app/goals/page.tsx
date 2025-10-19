'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GoalsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new Lifts & Goals page
    router.replace('/app/lifts');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-accent mx-auto mb-4"></div>
        <p className="text-discord-muted">Redirecting to Lifts & Goals...</p>
      </div>
    </div>
  );
}
