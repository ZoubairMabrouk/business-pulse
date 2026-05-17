import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Users,
  LayoutDashboard,
  Percent,
  Sparkles,
  UserCircle,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { TopNavbar } from "./TopNavbar";

const navGroups = [
  {
    label: "Pilotage",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Vue d'ensemble" },
      { to: "/revenue", icon: BarChart3, label: "Chiffre d'affaires" },
      { to: "/trends", icon: TrendingUp, label: "Tendances" },
    ],
  },
  {
    label: "Analyse",
    items: [
      { to: "/tax", icon: Receipt, label: "Fiscalité" },
      { to: "/clients", icon: Users, label: "Clients" },
      { to: "/discounts", icon: Percent, label: "Remises" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/chat", icon: Sparkles, label: "Assistant IA", badge: "AI" },
      { to: "/me", icon: UserCircle, label: "Mon profil" },
    ],
  },
];

export function DashboardLayout() {
  const { role } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = (role || "").toLowerCase() === "admin";

  return (
    <div className="flex h-screen overflow-hidden bg-background bg-mesh">
      {/* Sidebar */}
      <aside
        className={cn(
          "shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-[width] duration-300 ease-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-md">
              <img src="assets/EDI.jpg" alt="Logo" className="w-10 h-10" />
            </div>
            {!collapsed && (
              <div className="leading-tight animate-fade-in">
                <h1 className="text-sm font-bold tracking-tight gradient-text">EDI-Solutions</h1>
                <p className="text-[10px] text-sidebar-foreground">Analytics<span className="gradient-text">.BI</span></p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full gradient-primary" />
                        )}
                        <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive && "text-primary")} />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!collapsed && "badge" in item && item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md gradient-accent text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {isAdmin && (
            <div>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  Admin
                </p>
              )}
              <NavLink
                to="/admin/users"
                title={collapsed ? "Utilisateurs" : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Utilisateurs</span>}
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && (
            <div className="rounded-xl p-3 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-border/50 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold">Pro tips</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Posez vos questions à l'IA pour générer des dashboards à la volée.
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Réduire</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onToggleSidebar={() => setCollapsed(c => !c)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 max-w-[1500px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
