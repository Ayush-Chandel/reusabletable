"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useEffect, useRef } from "react";
import { TableParams, SortOrder, DEFAULT_TABLE_PARAMS } from "@/types/table.types";

interface UseTableParamsOptions<TFilters> {
  defaultFilters?: TFilters;
}

export function useTableParams<TFilters = Record<string, unknown>>(
  options: UseTableParamsOptions<TFilters> = {}
) {
  const { defaultFilters = {} as TFilters } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse URL params into typed TableParams object
  const params: TableParams<TFilters> = useMemo(() => {
    const page = parseInt(searchParams.get("page") || String(DEFAULT_TABLE_PARAMS.page), 10);
    const limit = parseInt(searchParams.get("limit") || String(DEFAULT_TABLE_PARAMS.limit), 10);
    const search = searchParams.get("search") || DEFAULT_TABLE_PARAMS.search;
    const sort_by = searchParams.get("sort_by") || DEFAULT_TABLE_PARAMS.sort_by;
    const sort_order = (searchParams.get("sort_order") as SortOrder) || DEFAULT_TABLE_PARAMS.sort_order;

    // Parse custom filters from URL
    const filters = { ...defaultFilters } as TFilters;
    searchParams.forEach((value, key) => {
      if (!["page", "limit", "search", "sort_by", "sort_order"].includes(key)) {
        try {
          // Try to parse as JSON for complex values
          (filters as Record<string, unknown>)[key] = JSON.parse(value);
        } catch {
          // Use as string if not valid JSON
          (filters as Record<string, unknown>)[key] = value;
        }
      }
    });

    return {
      page: isNaN(page) || page < 1 ? 1 : page,
      limit: isNaN(limit) || limit < 1 ? 10 : limit,
      search,
      sort_by,
      sort_order,
      filters,
    };
  }, [searchParams, defaultFilters]);

  // Update URL with new params
  const updateUrl = useCallback(
    (newParams: URLSearchParams) => {
      const queryString = newParams.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  // Track if we've synced defaults to prevent re-running
  const hasSyncedDefaults = useRef(false);

  // Sync all defaults to URL on mount (if not already present)
  useEffect(() => {
    if (hasSyncedDefaults.current) return;
    hasSyncedDefaults.current = true;

    const newParams = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    // 1. First, add DEFAULT_TABLE_PARAMS (lower priority)
    Object.entries(DEFAULT_TABLE_PARAMS).forEach(([key, value]) => {
      if (!searchParams.has(key) && value !== undefined && value !== null && value !== "") {
        newParams.set(key, String(value));
        hasChanges = true;
      }
    });

    // 2. Then, add defaultFilters (higher priority - overwrites if conflict)
    if (defaultFilters) {
      Object.entries(defaultFilters).forEach(([key, value]) => {
        if (!searchParams.has(key) && value !== undefined && value !== null && value !== "") {
          newParams.set(key, String(value));
          hasChanges = true;
        }
      });
    }

    if (hasChanges) {
      updateUrl(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set a single parameter
  const setParam = useCallback(
    <K extends keyof TableParams<TFilters>>(
      key: K,
      value: TableParams<TFilters>[K]
    ) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (key === "filters") {
        // Remove all existing filter params first

        searchParams.forEach((_, paramKey) => {
          if (!["page", "limit", "search", "sort_by", "sort_order"].includes(paramKey)) {
            newParams.delete(paramKey);
          }
        });
        // Add new filter params
        Object.entries(value as Record<string, unknown>).forEach(([filterKey, filterValue]) => {
          if (filterValue !== undefined && filterValue !== null && filterValue !== "") {
            const stringValue = typeof filterValue === "object" 
              ? JSON.stringify(filterValue) 
              : String(filterValue);
            newParams.set(filterKey, stringValue);
          }
        });
      } else {
        if (value === undefined || value === null || value === "" || value === DEFAULT_TABLE_PARAMS[key as keyof typeof DEFAULT_TABLE_PARAMS]) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      }

      // Reset to page 1 when search or filters change
      if (key === "search" || key === "filters") {
        newParams.set("page", "1");
      }

      updateUrl(newParams);
    },
    [searchParams, updateUrl]
  );

  // Set multiple parameters at once
  const setParams = useCallback(
    (updates: Partial<TableParams<TFilters>>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (key === "filters") {
          // Handle filters object
          searchParams.forEach((_, paramKey) => {
            if (!["page", "limit", "search", "sort_by", "sort_order"].includes(paramKey)) {
              newParams.delete(paramKey);
            }
          });
          Object.entries(value as Record<string, unknown>).forEach(([filterKey, filterValue]) => {
            if (filterValue !== undefined && filterValue !== null && filterValue !== "") {
              const stringValue = typeof filterValue === "object"
                ? JSON.stringify(filterValue)
                : String(filterValue);
              newParams.set(filterKey, stringValue);
            }
          });
        } else {
          if (value === undefined || value === null || value === "") {
            newParams.delete(key);
          } else {
            newParams.set(key, String(value));
          }
        }
      });

      updateUrl(newParams);
    },
    [searchParams, updateUrl]
  );

  // Set a single filter value
  const setFilter = useCallback(
    <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
      const newFilters = { ...params.filters, [key]: value };
      
      // Remove empty values
      Object.keys(newFilters as Record<string, unknown>).forEach((filterKey) => {
        const filterValue = (newFilters as Record<string, unknown>)[filterKey];
        if (filterValue === undefined || filterValue === null || filterValue === "") {
          delete (newFilters as Record<string, unknown>)[filterKey];
        }
      });

      setParam("filters", newFilters);
    },
    [params.filters, setParam]
  );

  // Reset all params to defaults
  const resetParams = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Reset only filters
  const resetFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    
    // Keep only core params
    if (params.page !== 1) newParams.set("page", String(params.page));
    if (params.limit !== 10) newParams.set("limit", String(params.limit));
    if (params.search) newParams.set("search", params.search);
    if (params.sort_by) newParams.set("sort_by", params.sort_by);
    if (params.sort_order !== "asc") newParams.set("sort_order", params.sort_order);

    updateUrl(newParams);
  }, [params, updateUrl]);

  // Toggle sort for a column
  const toggleSort = useCallback(
    (columnId: string) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (params.sort_by === columnId) {
        if (params.sort_order === "asc") {
          newParams.set("sort_order", "desc");
        } else {
          // Clear sorting
          newParams.delete("sort_by");
          newParams.delete("sort_order");
        }
      } else {
        newParams.set("sort_by", columnId);
        newParams.set("sort_order", "asc");
      }

      updateUrl(newParams);
    },
    [searchParams, params.sort_by, params.sort_order, updateUrl]
  );

  return {
    params,
    setParam,
    setParams,
    setFilter,
    resetParams,
    resetFilters,
    toggleSort,
  };
}
