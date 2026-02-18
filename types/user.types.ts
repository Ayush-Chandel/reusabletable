export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "pending";
  department: string;
  createdAt: string;
}

export interface UserFilters {
  status?: string;
  role?: string;
  department?: string;
}
