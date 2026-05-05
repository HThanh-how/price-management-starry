'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Main application layout — pixel-perfect replica of the Figma HTML mockup.
 * Uses exact Tailwind classes from the provided design system.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const mainNavItems = [
    { href: '/items', icon: 'inventory_2', label: 'Master Item List' },
    { href: '/suppliers', icon: 'factory', label: 'Master Supplier List' },
    { href: '/prices', icon: 'add_chart', label: 'Add New Price' },
  ];

  const footerNavItems = [
    { href: '#', icon: 'settings', label: 'Settings' },
    { href: '#', icon: 'help_outline', label: 'Support' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      {/* ==========================================
          SideNavBar — Exact copy from Figma HTML
          ========================================== */}
      <nav className="bg-white font-['Inter'] text-sm antialiased left-0 top-0 h-screen w-64 border-r border-slate-200 flex flex-col fixed z-40">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">stars</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Starry VietNam</h1>
            <p className="text-xs text-slate-500">Price Management</p>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    isActive(item.href)
                      ? 'flex items-center gap-3 px-3 py-2 rounded text-blue-600 bg-blue-50 border-r-2 border-blue-600 font-medium cursor-pointer active:opacity-80'
                      : 'flex items-center gap-3 px-3 py-2 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors duration-200 cursor-pointer active:opacity-80'
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Tabs */}
        <div className="p-4 border-t border-slate-200">
          <ul className="space-y-1">
            {footerNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors duration-200 cursor-pointer active:opacity-80"
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ==========================================
          Main Content Wrapper
          ========================================== */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* TopNavBar — Exact copy from Figma HTML */}
        <header className="bg-white font-['Inter'] text-sm border-b border-slate-200 flex items-center justify-between px-6 py-3 sticky top-0 z-30">
          <div className="flex items-center gap-8">
            <span className="text-md font-semibold text-slate-800">Price Manager</span>
            <nav className="hidden md:flex gap-6">
              <a className="text-slate-500 hover:text-blue-500 transition-all cursor-pointer" href="#">Dashboard</a>
              <a className="text-slate-500 hover:text-blue-500 transition-all cursor-pointer" href="#">Reports</a>
              <a className="text-slate-500 hover:text-blue-500 transition-all cursor-pointer" href="#">Analytics</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-colors"
                placeholder="Search..."
                type="text"
              />
            </div>
            <button className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </header>

        {/* Main Workspace — Figma uses p-margin-page bg-surface gap-md */}
        <main className="flex-1 p-margin-page bg-surface flex flex-col gap-md">
          {children}
        </main>
      </div>
    </div>
  );
}
