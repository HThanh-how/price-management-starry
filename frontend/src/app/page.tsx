'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page redirects to login. Auth guard in (main)/layout.tsx
 * will redirect authenticated users to /items.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    router.replace(user ? '/items' : '/login');
  }, [router]);

  return null;
}
