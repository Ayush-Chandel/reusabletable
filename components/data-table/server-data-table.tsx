
"use client";

import { flexRender, ColumnDef } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { useServerTable } from "@/hooks/use-server-table";
import {
  FetchTableDataFn,
  FilterComponentProps,
  TableParams,
  TableResponse,
} from "@/types/table.types";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface ServerDataTableProps<TData, TFilters = Record<string, unknown>, TResponse = TableResponse<TData>> {
  columns: ColumnDef<TData, unknown>[];
  fetcher: FetchTableDataFn<TResponse, TFilters>;
  queryKey: string;
  defaultFilters?: TFilters;
  defaultParams?: Partial<TableParams<TFilters>>;
  filterComponent?: React.ComponentType<FilterComponentProps<TFilters>>;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  emptyMessage?: string;
  className?: string;
  transformResponse?: (response: TResponse) => TableResponse<TData>;
}

export function ServerDataTable<TData, TFilters = Record<string, unknown>, TResponse = TableResponse<TData>>({
  columns,
  fetcher,
  queryKey,
  defaultFilters,
  filterComponent: FilterComponent,
  enableColumnVisibility = true,
  emptyMessage = "No results found.",
  className,
  transformResponse,
}: ServerDataTableProps<TData, TFilters, TResponse>) {
  const {
    table,
    total,
    totalPages,
    params,
    isLoading,
    isFetching,
    refetch,
    setParam,
    setParams,
    setFilter,
    resetFilters,
  } = useServerTable<TData, TFilters, TResponse>({
    columns,
    fetcher,
    queryKey,
    defaultFilters,
    transformResponse,
  });

  const hasActiveFilters =
    Object.keys(params.filters as Record<string, unknown>).length > 0;

  const filterComponentElement = FilterComponent ? (
    <FilterComponent
      filters={params.filters}
      onFilterChange={setFilter}
      onFiltersReset={resetFilters}
    />
  ) : null;

  const handleSearchChange = useCallback((value: string) => {
    setParam("search", value);
  }, [setParam]);

  return (
    // CHANGE 1: Use flex-col and h-full to fill parent container
    <div className={cn("flex flex-col h-full gap-4", className)}>
      
      {/* Toolbar (shrink-0 prevents it from being squashed) */}
      <div className="shrink-0">
        <DataTableToolbar
          table={table}
          search={params.search}
          onSearchChange={handleSearchChange}
          onRefresh={() => refetch()}
          isFetching={isFetching}
          enableColumnVisibility={enableColumnVisibility}
          filterComponent={filterComponentElement}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters || params.search !== ""}
        />
      </div>

      {/* CHANGE 2: The Table Wrapper
          - flex-1: Take all remaining space
          - min-h-0: Crucial for nested scrollbars in flexbox
          - relative: Context for absolute positioning if needed (optional here but good practice)
      */}
      <div
        className={cn(
          "rounded-md border flex-1 min-h-[390px] overflow-auto relative max-h-fit", // overflow-auto enables the scrollbar HERE
          isFetching && !isLoading && "opacity-70 transition-opacity"
        )}
      >
        <Table>
          {/* CHANGE 3: Sticky Header
              - sticky top-0: Keeps header visible while scrolling
              - bg-background: Prevents transparency issues
              - z-10: Keeps it above rows
          */}
          <TableHeader className="sticky top-0 bg-background z-10 ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: params.limit }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* CHANGE 4: Pagination 
          - shrink-0: Ensures it never disappears or shrinks
          - It naturally sits at the bottom because the table wrapper above took all extra space
      */}
      <div className="shrink-0 border-t p-2 bg-background">
        <DataTablePagination
          page={params.page}
          limit={params.limit}
          total={total}
          totalPages={totalPages}
          onPageChange={(page) => setParam("page", page)}
          onLimitChange={(limit) => {
            setParams({ limit, page: 1 });
          }}
          isLoading={isFetching}
        />
      </div>
    </div>
  );
}
