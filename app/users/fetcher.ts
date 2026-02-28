import { TableParams, TableResponse } from "@/types/table.types";
import { User, UserFilters } from "@/types/user.types";

export async function fetchUsers(
  params: TableParams<UserFilters>
): Promise<TableResponse<User>> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.sort_by) {
    searchParams.set("sort_by", params.sort_by);
    searchParams.set("sort_order", params.sort_order);
  }

  // Add filter params
  if (params.filters.status) {
    searchParams.set("status", params.filters.status);
  }
  if (params.filters.role) {
    searchParams.set("role", params.filters.role);
  }
  if (params.filters.department) {
    searchParams.set("department", params.filters.department);
  }

  const response = await fetch(`/api/users?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}
