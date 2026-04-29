import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  roles?: string[]; // if provided, user role must match one
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    const userRole = (role || "").toLowerCase();
    const allowed = roles.map((r) => r.toLowerCase()).includes(userRole);
    if (!allowed) return <Navigate to="/" replace />;
  }

  return <Outlet />;
}