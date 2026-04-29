const ACCESS_KEY = "auth.accessToken";
const REFRESH_KEY = "auth.refreshToken";

export const TokenService = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens(access: string, refresh?: string | null) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export interface JwtPayload {
  sub?: string;
  userId?: string;
  email?: string;
  role?: string | string[];
  exp?: number;
  [k: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isExpired(token: string, skewSec = 10): boolean {
  const p = decodeJwt(token);
  if (!p?.exp) return false;
  return Date.now() / 1000 >= p.exp - skewSec;
}

export function extractRole(payload: JwtPayload | null): string | null {
  if (!payload) return null;
  const r =
    payload.role ??
    (payload as Record<string, unknown>)[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ];
  if (Array.isArray(r)) return (r[0] as string) ?? null;
  return (r as string) ?? null;
}