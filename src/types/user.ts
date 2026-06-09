export type UserRole = "Admin" | "User";
export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username: string;
  email: string;
  role: UserRole | string;
  status: UserStatus | string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UsersListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole | string;
  status: UserStatus | string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: UserRole | string;
  status?: UserStatus | string;
}

export interface ResetPasswordPayload {
  temporaryPassword?: string;
  forceChange?: boolean;
  sendEmail?: boolean;
}