import { QueryClient } from '@tanstack/react-query';
import { SWR_STALE_TIME_MS, SWR_GC_TIME_MS, API_MAX_RETRIES } from './constants';

/**
 * Singleton QueryClient instance for TanStack React Query.
 * Implements SWR (Stale-While-Revalidate) caching strategy:
 *
 * - staleTime (3s): Data is "fresh" for 3 seconds. During this window,
 *   subsequent reads return cached data WITHOUT any network request.
 *
 * - gcTime (1h): After 1 hour of no observers, cached data is garbage collected.
 *   Matches the Redis backend cache TTL for consistency.
 *
 * - refetchOnWindowFocus: When user returns to the tab, stale data
 *   triggers a background revalidation automatically.
 *
 * Flow:
 *   1. First request → fetch from backend → cache in TanStack Query
 *   2. Within 3s → return cached data instantly (no network call)
 *   3. After 3s → return cached data instantly + trigger background refetch
 *   4. Background refetch completes → UI updates seamlessly
 *   5. User clicks "Refresh" → invalidateQueries → force fresh fetch
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /* SWR: Data is "fresh" for 3 seconds before background revalidation */
      staleTime: SWR_STALE_TIME_MS,
      /* SWR: Cache lives for 1 hour (matches Redis TTL on backend) */
      gcTime: SWR_GC_TIME_MS,
      /* Retry failed queries with exponential backoff */
      retry: API_MAX_RETRIES,
      /* Refetch stale data when window regains focus */
      refetchOnWindowFocus: true,
    },
    mutations: {
      /* Retry failed mutations once (idempotent operations only) */
      retry: 1,
    },
  },
});
