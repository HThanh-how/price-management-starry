/**
 * Application-wide constants for the Price Management Tool.
 * Centralizes all magic numbers, limits, and configuration values.
 * Any change here affects the entire application consistently.
 */

// ========================================
// Pagination defaults
// ========================================

/** Default page number for API requests */
export const DEFAULT_PAGE_NUMBER = 1;

/** Default page size for list endpoints */
export const DEFAULT_PAGE_SIZE = 100;

/** AG Grid default page size */
export const GRID_DEFAULT_PAGE_SIZE = 20;

/** AG Grid page size options displayed in the selector */
export const GRID_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ========================================
// Stale-While-Revalidate (SWR) timing
// ========================================

/** 
 * Data is considered "fresh" for this duration (ms).
 * After staleTime, TanStack Query will revalidate in the background.
 */
export const SWR_STALE_TIME_MS = 3_000; // 3 seconds

/**
 * Cached data remains usable (even if stale) for this duration (ms).
 * After gcTime, data is garbage collected and must be fetched fresh.
 */
export const SWR_GC_TIME_MS = 3_600_000; // 1 hour (matches Redis TTL)

// ========================================
// Backend Redis cache TTLs
// ========================================

/** Redis absolute TTL for list endpoints (seconds) */
export const REDIS_LIST_TTL_SECONDS = 3600; // 1 hour

/** Redis absolute TTL for single-entity endpoints (seconds) */
export const REDIS_ENTITY_TTL_SECONDS = 3600; // 1 hour

/** Redis SWR stale marker TTL (seconds) — after this, data is "stale" */
export const REDIS_STALE_AFTER_SECONDS = 3; // 3 seconds

// ========================================
// API configuration
// ========================================

/** Axios request timeout (ms) */
export const API_TIMEOUT_MS = 30_000; // 30 seconds

/** Maximum number of retry attempts for failed requests */
export const API_MAX_RETRIES = 3;

// ========================================
// UI configuration
// ========================================

/** Currency options for price records */
export const CURRENCY_OPTIONS = ['VND', 'USD', 'EUR', 'JPY'] as const;

/** Entity status options */
export const STATUS_OPTIONS = ['Active', 'Inactive'] as const;

/** Default currency for new price records */
export const DEFAULT_CURRENCY = 'VND';

// ========================================
// Validation limits
// ========================================

/** Maximum length for item/supplier codes */
export const MAX_CODE_LENGTH = 20;

/** Maximum length for name fields */
export const MAX_NAME_LENGTH = 200;

/** Maximum length for description fields */
export const MAX_DESCRIPTION_LENGTH = 1000;

/** Maximum length for email fields */
export const MAX_EMAIL_LENGTH = 255;

/** Maximum length for phone fields */
export const MAX_PHONE_LENGTH = 50;

/** Maximum length for address fields */
export const MAX_ADDRESS_LENGTH = 500;

/** Maximum length for remark fields */
export const MAX_REMARK_LENGTH = 500;

/** Maximum price value */
export const MAX_PRICE_VALUE = 999_999_999_999;

/** Minimum price value */
export const MIN_PRICE_VALUE = 0;
