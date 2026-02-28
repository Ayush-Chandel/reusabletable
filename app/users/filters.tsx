"use client";

import { FilterComponentProps } from "@/types/table.types";
import { UserFilters } from "@/types/user.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
];

const DEPARTMENT_OPTIONS = [
  { value: "Engineering", label: "Engineering" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Finance", label: "Finance" },
  { value: "Operations", label: "Operations" },
  { value: "Customer Support", label: "Customer Support" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Legal", label: "Legal" },
];

export function UserFiltersComponent({
  filters,
  onFilterChange,
}: FilterComponentProps<UserFilters>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.status || ""}
        onValueChange={(value) =>
          onFilterChange("status", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.role || ""}
        onValueChange={(value) =>
          onFilterChange("role", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {ROLE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.department || ""}
        onValueChange={(value) =>
          onFilterChange("department", value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {DEPARTMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
