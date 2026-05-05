'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page — redirect straight to /items (bypass login).
 * Login page still accessible at /login for manual authentication.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/items');
  }, [router]);

  return null;
}
