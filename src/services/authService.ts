import { AUTH_API_BASE } from "./env.dev";
import { TokenService, isExpired } from "./tokenService";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

async function parseError(res: Response): Promise<ApiError> {
  let message = res.statusText || "Request failed";
  let errors: Record<string, string[]> | undefined;
  try {
    const body = await res.json();
    message = body?.message || body?.title || body?.error || message;
    errors = body?.errors;
  } catch {
    /* ignore */
  }
  return { status: res.status, message, errors };
}

/** Low-level fetch without auth (for login/register/refresh). */
async function rawFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${AUTH_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

let refreshPromise: Promise<string | null> | null = null;

/** Attempt refresh once, deduped across concurrent callers. */
async function performRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = TokenService.getRefreshToken();
  if (!refreshToken) return null;
  refreshPromise = (async () => {
    try {
      const data = await rawFetch<AuthTokens>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
      if (data?.accessToken) {
        TokenService.setTokens(data.accessToken, data.refreshToken ?? refreshToken);
        return data.accessToken;
      }
      return null;
    } catch {
      TokenService.clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/** Authenticated fetch with auto-refresh on 401. */
export async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token = TokenService.getAccessToken();
  if (token && isExpired(token)) {
    token = await performRefresh();
  }

  const doFetch = async (bearer: string | null) =>
    fetch(`${AUTH_API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...(init.headers || {}),
      },
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    const newToken = await performRefresh();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      TokenService.clear();
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const AuthService = {
  async login(payload: LoginPayload): Promise<AuthTokens & { user?: AuthUser }> {
    const data = await rawFetch<AuthTokens & { user?: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (data?.accessToken) TokenService.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async register(
    payload: RegisterPayload
  ): Promise<AuthTokens & { user?: AuthUser }> {
    const data = await rawFetch<AuthTokens & { user?: AuthUser }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(payload) }
    );
    if (data?.accessToken) TokenService.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async me(): Promise<AuthUser> {
    return authFetch<AuthUser>("/users/me", { method: "GET" });
  },

  async listUsers(): Promise<AuthUser[]> {
    return authFetch<AuthUser[]>("/users", { method: "GET" });
  },

  logout() {
    TokenService.clear();
    window.dispatchEvent(new CustomEvent("auth:logout"));
  },
};