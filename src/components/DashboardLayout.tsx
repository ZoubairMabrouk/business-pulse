import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, TrendingUp, Receipt, Users, LayoutDashboard, Percent, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Vue d'ensemble" },
  { to: "/revenue", icon: BarChart3, label: "Chiffre d'affaires" },
  { to: "/trends", icon: TrendingUp, label: "Tendances" },
  { to: "/tax", icon: Receipt, label: "Fiscalité" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/discounts", icon: Percent, label: "Remises" },
  { to: "/chat", icon: Brain, label: "Génération de contenu" },
];

export function DashboardLayout() {
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
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground">Données • 2024</p>
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
