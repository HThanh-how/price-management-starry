'use client';

import { ItemsFeature } from '@/features/items';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

// Register AG Grid modules once at the page level
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Items Page - Thin Wrapper
 * Business logic is encapsulated in src/features/items.
 */
export default function ItemsPage() {
  return <ItemsFeature />;
}
