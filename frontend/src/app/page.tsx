'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page redirects to the Master Items page.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/items');
  }, [router]);

  return null;
}
