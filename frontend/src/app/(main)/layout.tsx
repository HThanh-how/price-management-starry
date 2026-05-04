'use client';

import AppLayout from '@/components/AppLayout';

/**
 * Layout wrapper for the (main) route group.
 * All pages under /items, /suppliers, /prices use this sidebar layout.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
