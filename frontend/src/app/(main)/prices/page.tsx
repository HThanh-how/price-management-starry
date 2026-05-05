'use client';

import React from 'react';
import { PriceForm } from '@/features/prices/components/PriceForm';
import { PriceGrid } from '@/features/prices/components/PriceGrid';

/**
 * Assign New Price Page
 * Refactored to Enterprise Feature-Sliced Design.
 * - Logic is extracted to usePriceQueries.ts
 * - UI is split into PriceForm and PriceGrid
 */
export default function PricesPage() {
  return (
    <>
      {/* Page Header — Figma breadcrumb */}
      <div className="mb-xs">
        <h2 className="font-h3 text-h3 text-on-surface">Assign New Price</h2>
        <div className="flex items-center text-sm text-on-surface-variant mt-2">
          <span className="hover:text-primary cursor-pointer">Starry VietNam</span>
          <span className="material-symbols-outlined mx-2 text-[16px]">chevron_right</span>
          <span className="hover:text-primary cursor-pointer">Price Management</span>
          <span className="material-symbols-outlined mx-2 text-[16px]">chevron_right</span>
          <span className="text-on-surface">Add New Price</span>
        </div>
      </div>

      {/* Figma 2-column: Form (1/3) + Grid (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter flex-1" style={{ minHeight: 'calc(100vh - 220px)' }}>
        <div className="lg:col-span-1 h-full">
          <PriceForm />
        </div>
        <div className="lg:col-span-2 h-full flex flex-col">
          <PriceGrid />
        </div>
      </div>
    </>
  );
}
