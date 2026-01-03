/**
 * Cache configuration constants for React Query
 */

// Default stale time: 1 day in milliseconds
const DEFAULT_STALE_TIME_MS = parseInt(
  process.env.NEXT_PUBLIC_CACHE_STALE_TIME || "86400000",
  10,
);

// Default garbage collection time: 1 day in milliseconds
const DEFAULT_GC_TIME_MS = parseInt(
  process.env.NEXT_PUBLIC_CACHE_GC_TIME || "86400000",
  10,
);

// Form templates cache configuration
export const FORM_TEMPLATES_STALE_TIME = DEFAULT_STALE_TIME_MS;
export const FORM_TEMPLATES_GC_TIME = DEFAULT_GC_TIME_MS;

// Form renderer cache configuration (individual form data)
export const FORM_RENDERER_STALE_TIME = DEFAULT_STALE_TIME_MS;
export const FORM_RENDERER_GC_TIME = DEFAULT_GC_TIME_MS;
