import { authFetch } from "./authService";
import type {
  CreateUserPayload,
  PagedResult,
  ResetPasswordPayload,
  UpdateUserPayload,
  User,
  UsersListParams,
} from "@/types/user";

function buildQuery(params: UsersListParams): string {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set("page", String(params.page));
  if (params.pageSize != null) sp.set("pageSize", String(params.pageSize));
  if (params.search) sp.set("search", params.search);
  if (params.role && params.role !== "all") sp.set("role", params.role);
  if (params.status && params.status !== "all") sp.set("status", params.status);
  if (params.sortBy) sp.set("sortBy", params.sortBy);
  if (params.sortDir) sp.set("sortDir", params.sortDir);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Normalize backends that return plain arrays or {items,total,...}. */
function normalize(raw: unknown, page: number, pageSize: number): PagedResult<User> {
  if (Array.isArray(raw)) {
    return { items: raw as User[], total: raw.length, page, pageSize };
  }
  const r = raw as Partial<PagedResult<User>> & { data?: User[]; count?: number };
  return {
    items: r.items ?? r.data ?? [],
    total: r.total ?? r.count ?? (r.items?.length ?? r.data?.length ?? 0),
    page: r.page ?? page,
    pageSize: r.pageSize ?? pageSize,
  };
}

export const UsersService = {
  async list(params: UsersListParams = {}): Promise<PagedResult<User>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const raw = await authFetch<unknown>(`/users${buildQuery({ ...params, page, pageSize })}`);
    return normalize(raw, page, pageSize);
  },

  get(id: string): Promise<User> {
    return authFetch<User>(`/users/${id}`);
  },

  create(payload: CreateUserPayload): Promise<User> {
    return authFetch<User>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateUserPayload): Promise<User> {
    return authFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(id: string): Promise<void> {
    return authFetch<void>(`/users/${id}`, { method: "DELETE" });
  },

  setStatus(id: string, status: "Active" | "Inactive"): Promise<User> {
    return authFetch<User>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  resetPassword(id: string, payload: ResetPasswordPayload): Promise<{ temporaryPassword?: string }> {
    return authFetch(`/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  assignRole(id: string, role: string): Promise<User> {
    return authFetch<User>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
};