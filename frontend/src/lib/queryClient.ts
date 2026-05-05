import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient instance for TanStack React Query.
 * Configures global defaults: retry strategy, stale time, error handling.
 * Used throughout the application for consistent cache management.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /* Data is considered fresh for 2 minutes before background refetch */
      staleTime: 2 * 60 * 1000,
      /* Cache entries live 10 minutes after last observer unmounts */
      gcTime: 10 * 60 * 1000,
      /* Retry failed queries up to 2 times with exponential backoff */
      retry: 2,
      /* Refetch when window regains focus (useful for stale data recovery) */
      refetchOnWindowFocus: true,
    },
    mutations: {
      /* Retry failed mutations once (idempotent operations only) */
      retry: 1,
    },
  },
});
