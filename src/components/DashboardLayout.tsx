import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Users,
  LayoutDashboard,
  Percent,
  Brain,
  UserCircle,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Vue d'ensemble" },
  { to: "/revenue", icon: BarChart3, label: "Chiffre d'affaires" },
  { to: "/trends", icon: TrendingUp, label: "Tendances" },
  { to: "/tax", icon: Receipt, label: "Fiscalité" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/discounts", icon: Percent, label: "Remises" },
  { to: "/chat", icon: Brain, label: "Génération de contenu" },
  { to: "/me", icon: UserCircle, label: "Mon profil" },
];

export function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = (role || "").toLowerCase() === "admin";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-accent-foreground">Analytics BI</h1>
              <p className="text-[10px] text-sidebar-foreground">Business Intelligence</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium glow-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium glow-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <ShieldCheck className="w-4 h-4" />
              Utilisateurs (Admin)
            </NavLink>
          )}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {user && (
            <div className="px-2 py-1">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                {user.fullName || user.email}
              </p>
              <p className="text-[10px] text-sidebar-foreground truncate">
                {role || "User"}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
