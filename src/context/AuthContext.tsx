import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  AuthService,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/services/authService";
import { TokenService, decodeJwt, extractRole } from "@/services/tokenService";

interface AuthContextValue {
  user: AuthUser | null;
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (p: LoginPayload) => Promise<void>;
  register: (p: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = TokenService.getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await AuthService.me();
      setUser(me);
    } catch {
      TokenService.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [hydrate]);

  const login = useCallback(async (p: LoginPayload) => {
    const data = await AuthService.login(p);
    if (data.user) setUser(data.user);
    else {
      const me = await AuthService.me();
      setUser(me);
    }
  }, []);

  const register = useCallback(async (p: RegisterPayload) => {
    const data = await AuthService.register(p);
    if (data.accessToken) {
      if (data.user) setUser(data.user);
      else {
        const me = await AuthService.me();
        setUser(me);
      }
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await AuthService.me();
    setUser(me);
  }, []);

  const role = useMemo(() => {
    if (user?.role) return user.role;
    const t = TokenService.getAccessToken();
    return t ? extractRole(decodeJwt(t)) : null;
  }, [user]);

  const value: AuthContextValue = {
    user,
    role,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}