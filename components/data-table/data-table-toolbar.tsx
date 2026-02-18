"use client";

import { Table } from "@tanstack/react-table";
import { RefreshCw, Search, X, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { useDebounce } from "@/hooks/use-debounce";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isFetching: boolean;
  enableColumnVisibility?: boolean;
  filterComponent?: React.ReactNode;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  search,
  onSearchChange,
  onRefresh,
  isFetching,
  enableColumnVisibility = true,
  filterComponent,
  onResetFilters,
  hasActiveFilters = false,
}: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounce(searchValue, 300);
  const lastSentSearch = useRef(search);

   useEffect(() => {
    // Sync local input if URL changes externally (e.g. Back button)
    if (search !== lastSentSearch.current) {
      setSearchValue(search);
    }
    lastSentSearch.current = search;
  }, [search]);

  // Update URL when debounced search changes
 useEffect(() => {
    // 1. Check if the value is actually new
    const isNewValue = debouncedSearch !== lastSentSearch.current;
    
    // 2. CRITICAL FIX: Check if debounce has caught up to current input
    // If debouncedSearch != searchValue, it means the user is currently typing 
    // or just cleared it, and the timer hasn't finished. DON'T SEND YET.
    const isSettled = debouncedSearch === searchValue;

    if (isNewValue && isSettled) {
      lastSentSearch.current = debouncedSearch;
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, searchValue])

  const handleClearSearch = () => {
    setSearchValue("");
    lastSentSearch.current = "";
    onSearchChange("");
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center sm:justify-between">
        <div className="flex flex-1 items-start sm:items-center gap-2">
          <div className="relative w-full flex-1 max-w-sm min-w-[130px] order-2 sm:order-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9  w-full pl-8 pr-8"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 p-0"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <div className="flex md:flex-row items-center gap-2 order-1 sm:order-2">
            {filterComponent}
          </div>
        </div>
        <div className="flex items-center gap-2 order-3">
          {hasActiveFilters && onResetFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8"
            >
              Reset filters
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-8"
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          {enableColumnVisibility && <DataTableViewOptions table={table} />}
        </div>
      </div>
    </div>
  );
}
