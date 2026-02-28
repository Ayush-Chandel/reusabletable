import { ColumnDef } from "@tanstack/react-table";

export type SortOrder = "asc" | "desc";

export interface TableParams<TFilters = Record<string, unknown>> {
  page: number;
  limit: number;
  search: string;
  sort_by: string;
  sort_order: SortOrder;
  filters: TFilters;
}

export interface TableResponse<TData> {
  data: TData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type FetchTableDataFn<TResponse, TFilters = Record<string, unknown>> = (
  params: TableParams<TFilters>
) => Promise<TResponse>;

export interface FilterComponentProps<TFilters = Record<string, unknown>> {
  filters: TFilters;
  onFilterChange: (key: keyof TFilters, value: TFilters[keyof TFilters]) => void;
  onFiltersReset: () => void;
}

export interface ServerDataTableProps<TData, TFilters = Record<string, unknown>, TResponse = TableResponse<TData>> {
  columns: ColumnDef<TData, unknown>[];
  fetcher: FetchTableDataFn<TResponse, TFilters>;
  queryKey: string;
  defaultParams?: Partial<TableParams<TFilters>>;
  filterComponent?: React.ComponentType<FilterComponentProps<TFilters>>;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  emptyMessage?: string;
  /** Optional transformer to convert API response to TableResponse format */
  transformResponse?: (response: TResponse) => TableResponse<TData>;
}

export const DEFAULT_TABLE_PARAMS: Omit<TableParams, "filters"> = {
  page: 1,
  limit: 10,
  search: "",
  sort_by: "",
  sort_order: "asc",
};
