/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-15 00:52:43
 * @ Modified time: 2025-06-23 02:30:00
 * @ Description:
 *
 * Filter implementation utility, so we don't pollute components with classes.
 * Enhanced with proper state management and URL synchronization.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Filters {
  [filter: string]: string;
}

/**
 * The useFilter hook with enhanced functionality.
 * Now properly synchronizes with URL parameters and triggers re-renders.
 *
 * @hook
 */
export const useFilter = <T extends Filters>(
  initialFilters?: Partial<T>,
  syncWithURL = false
) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters once on mount
  const [filters, set_filters] = useState<T>(() => {
    // Initialize with URL parameters if syncWithURL is enabled
    if (syncWithURL && typeof window !== "undefined") {
      const urlFilters = {} as T;
      searchParams.forEach((value, key) => {
        if (key !== "q" && key !== "jobId") {
          // Exclude search query and job ID
          (urlFilters as any)[key] = value;
        }
      });
      return { ...initialFilters, ...urlFilters } as T;
    }
    return { ...initialFilters } as unknown as T;
  });

  // Sets an individual filter
  const set_filter = useCallback(
    (filter: keyof T, value: string) => {
      set_filters((prev) => {
        const newFilters = { ...prev, [filter]: value };

        // Update URL if syncWithURL is enabled
        if (syncWithURL) {
          const params = new URLSearchParams(searchParams);

          // Clear filters that are set to "All" values
          const isDefaultValue =
            value.toLowerCase().includes("all") ||
            value.toLowerCase().includes("any");

          if (isDefaultValue) {
            params.delete(filter as string);
          } else {
            params.set(filter as string, value);
          }

          // Update URL without causing navigation
          const newURL = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState({}, "", newURL);
        }

        return newFilters;
      });
    },
    [syncWithURL, searchParams]
  );

  // Creates a function that sets the filter
  const filter_setter = useCallback(
    (filter: keyof T) => (value: string) => {
      set_filter(filter, value);
    },
    [set_filter]
  );

  // Clear all filters to default values
  const clear_filters = useCallback(
    (defaultValues: Partial<T>) => {
      set_filters(defaultValues as T);

      if (syncWithURL) {
        // Clear all filter params from URL, keep search query
        const params = new URLSearchParams();
        const query = searchParams.get("q");
        if (query) params.set("q", query);

        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newURL);
      }
    },
    [syncWithURL, searchParams]
  );

  // Get active filter count (non-default values)
  const getActiveFilterCount = useCallback(() => {
    return Object.values(filters).filter(
      (value) =>
        !value.toLowerCase().includes("all") &&
        !value.toLowerCase().includes("any")
    ).length;
  }, [filters]);

  // Apply filters and navigate to results (for homepage use)
  const applyFiltersAndNavigate = useCallback(
    (searchTerm = "") => {
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.set("q", searchTerm);
      }

      Object.entries(filters).forEach(([key, value]) => {
        const isDefaultValue =
          value.toLowerCase().includes("all") ||
          value.toLowerCase().includes("any");
        if (!isDefaultValue) {
          params.set(key, value);
        }
      });

      router.push(`/search?${params.toString()}`);
    },
    [filters, router]
  );

  return {
    filters,
    set_filter,
    filter_setter,
    clear_filters,
    getActiveFilterCount,
    applyFiltersAndNavigate,
  };
};
