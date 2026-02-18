import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user.types";

// Generate mock users data
const generateMockUsers = (count: number): User[] => {
  const firstNames = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  ];

  const departments = [
    "Engineering", "Marketing", "Sales", "Human Resources", "Finance",
    "Operations", "Customer Support", "Product", "Design", "Legal",
  ];

  const roles: User["role"][] = ["admin", "user", "moderator"];
  const statuses: User["status"][] = ["active", "inactive", "pending"];

  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Generate a random date within the last 2 years
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000)
    ).toISOString();

    users.push({
      id: `user-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      role,
      status,
      department,
      createdAt,
    });
  }

  return users;
};

// Generate 500 mock users (cached at module level)
const MOCK_USERS = generateMockUsers(500);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort_by") || "";
  const sortOrder = searchParams.get("sort_order") || "asc";
  const status = searchParams.get("status") || "";
  const role = searchParams.get("role") || "";
  const department = searchParams.get("department") || "";

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredUsers = [...MOCK_USERS];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.department.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (status) {
    filteredUsers = filteredUsers.filter((user) => user.status === status);
  }

  // Apply role filter
  if (role) {
    filteredUsers = filteredUsers.filter((user) => user.role === role);
  }

  // Apply department filter
  if (department) {
    filteredUsers = filteredUsers.filter((user) => user.department === department);
  }

  // Apply sorting
  if (sortBy) {
    filteredUsers.sort((a, b) => {
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === "desc" ? -comparison : comparison;
      }

      return 0;
    });
  }

  // Calculate pagination
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return NextResponse.json({
    data: paginatedUsers,
    total,
    page,
    limit,
    totalPages,
  });
}
