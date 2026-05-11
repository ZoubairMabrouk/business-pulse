import { Bell, Search, Sun, Moon, Menu, ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Props { onToggleSidebar: () => void; }

export function TopNavbar({ onToggleSidebar }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const initials = (user?.fullName || user?.email || "U")
    .split(/[\s@.]/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("");

  return (
    <header className="h-16 shrink-0 sticky top-0 z-30 glass-panel border-b border-border/60 flex items-center gap-3 px-4">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 max-w-xl relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher tableaux, KPI, clients…"
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/60 border border-transparent focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg hover:bg-muted transition-colors relative"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent ring-2 ring-background animate-pulse" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications <Badge variant="secondary">3</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Rapport mensuel prêt</span>
              <span className="text-xs text-muted-foreground">CA Octobre 2025 disponible</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Anomalie détectée</span>
              <span className="text-xs text-muted-foreground">Pic de remises sur client #42</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Nouveau cube OLAP</span>
              <span className="text-xs text-muted-foreground">SalesCube v2 déployé</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-1 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors">
              <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">{user?.fullName || user?.email || "Invité"}</span>
                <span className="text-[10px] text-muted-foreground">{role || "User"}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/me")}>Profil</DropdownMenuItem>
            {(role || "").toLowerCase() === "admin" && (
              <DropdownMenuItem onClick={() => navigate("/admin/users")}>Administration</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => { logout(); navigate("/login", { replace: true }); }}
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
