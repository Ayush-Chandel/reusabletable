"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { useTableParams } from "./use-table-params";
import { FetchTableDataFn, TableParams, TableResponse } from "@/types/table.types";

interface UseServerTableOptions<TData, TFilters, TResponse = TableResponse<TData>> {
  columns: ColumnDef<TData, unknown>[];
  fetcher: FetchTableDataFn<TResponse, TFilters>;
  queryKey: string;
  defaultFilters?: TFilters;
  defaultParams?: Partial<TableParams<TFilters>>;
  /** Optional transformer to convert API response to TableResponse format */
  transformResponse?: (response: TResponse) => TableResponse<TData>;
}

export function useServerTable<TData, TFilters = Record<string, unknown>, TResponse = TableResponse<TData>>({
  columns,
  fetcher,
  queryKey,
  defaultFilters,
  transformResponse,
}: UseServerTableOptions<TData, TFilters, TResponse>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const {
    params,
    setParam,
    setParams,
    setFilter,
    resetParams,
    resetFilters,
    toggleSort,
  } = useTableParams<TFilters>({ defaultFilters });

  // Create a stable query key that includes all params
  const fullQueryKey = useMemo(
    () => [queryKey, params] as const,
    [queryKey, params]
  );

  // Fetch data using TanStack Query
  const {
    data: rawResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => fetcher(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });

  // Transform the response (or use as-is if no transformer provided)
  const response = useMemo(() => {
    if (!rawResponse) return null;
    
    if (transformResponse) {
      return transformResponse(rawResponse);
    }
    
    // Default: assume response already matches TableResponse shape
    return rawResponse as unknown as TableResponse<TData>;
  }, [rawResponse, transformResponse]);

  // Extract data from response or use empty array
  const data = response?.data ?? [];
  const total = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 0;

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    state: {
      columnVisibility,
      pagination: {
        pageIndex: params.page - 1,
        pageSize: params.limit,
      },
      sorting: params.sort_by
        ? [{ id: params.sort_by, desc: params.sort_order === "desc" }]
        : [],
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: params.page - 1,
          pageSize: params.limit,
        });
        setParams({
          page: newState.pageIndex + 1,
          limit: newState.pageSize,
        });
      }
    },
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        const currentSorting = params.sort_by
          ? [{ id: params.sort_by, desc: params.sort_order === "desc" }]
          : [];
        const newSorting = updater(currentSorting);
        if (newSorting.length > 0) {
          setParams({
            sort_by: newSorting[0].id,
            sort_order: newSorting[0].desc ? "desc" : "asc",
          });
        } else {
          setParams({
            sort_by: "",
            sort_order: "asc",
          });
        }
      }
    },
  });

  return {
    table,
    data,
    total,
    totalPages,
    params,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    setParam,
    setParams,
    setFilter,
    resetParams,
    resetFilters,
    toggleSort,
    columnVisibility,
    setColumnVisibility,
  };
}
