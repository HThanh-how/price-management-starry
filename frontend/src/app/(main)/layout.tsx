'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

/**
 * Layout wrapper for the (main) route group.
 * All pages under /items, /suppliers, /prices use this sidebar layout.
 * Includes authentication guard — redirects to /login if not authenticated.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    if (!user) {
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AppLayout>{children}</AppLayout>;
}
