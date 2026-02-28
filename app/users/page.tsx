
"use client";

import { Suspense } from "react";
import { ServerDataTable } from "@/components/data-table";
import { userColumns } from "./columns";
import { UserFiltersComponent } from "./filters";
import { fetchUsers } from "./fetcher";
import { UserFilters } from "@/types/user.types";

function UsersTableContent() {
  return (
    <ServerDataTable<
      {
        id: string;
        name: string;
        email: string;
        role: "admin" | "user" | "moderator";
        status: "active" | "inactive" | "pending";
        department: string;
        createdAt: string;
      },
      UserFilters
    >
      columns={userColumns}
      fetcher={fetchUsers}
      queryKey="users"
      filterComponent={UserFiltersComponent}
      enableColumnVisibility={true}
      emptyMessage="No users found. Try adjusting your filters."
    />
  );
}

export default function UsersPage() {
  return (
    // FIX: Add h-[calc(100vh-4rem)] or similar to constrain the page height
    // 'flex flex-col' ensures the header and content stack properly
    <div className="container px-3 sm:mx-auto h-[calc(100vh)]  pt-2 flex flex-col gap-8">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage and view all users in the system. Use the filters and search to
          find specific users.
        </p>
      </div>

      {/* flex-1 allows this section to grow and fill the remaining height */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<div>Loading...</div>}>
          <UsersTableContent />
        </Suspense>
      </div>
    </div>
  );
}
