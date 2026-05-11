import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  format?: "currency" | "percent" | "number";
  accent?: "primary" | "accent" | "success" | "warning" | "destructive";
}

export function formatValue(value: number, format: "currency" | "percent" | "number" = "number"): string {
  if (format === "currency") {
    return new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(value);
  }
  if (format === "percent") return `${value.toFixed(1)}%`;
  return new Intl.NumberFormat("fr-TN").format(value);
}

const accentMap: Record<string, string> = {
  primary: "from-primary/15 to-transparent",
  accent: "from-accent/15 to-transparent",
  success: "from-[hsl(var(--success))]/15 to-transparent",
  warning: "from-[hsl(var(--warning))]/15 to-transparent",
  destructive: "from-destructive/15 to-transparent",
};

const iconBgMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  warning: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  destructive: "bg-destructive/10 text-destructive",
};

export function KpiCard({ title, value, subtitle, trend, icon, format = "number", accent = "primary" }: KpiCardProps) {
  const displayValue = typeof value === "number" ? formatValue(value, format) : value;
  const trendDirection = trend && trend > 0 ? "up" : trend && trend < 0 ? "down" : "neutral";

  return (
    <Card className="glass-card hover-lift animate-slide-up overflow-hidden relative group">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", accentMap[accent])} />
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity gradient-primary" />
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
          {icon && (
            <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBgMap[accent])}>
              {icon}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight font-mono">{displayValue}</p>
        <div className="flex items-center gap-2 mt-3">
          {trend !== undefined && (
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md",
              trendDirection === "up" && "bg-[hsl(var(--kpi-up))]/10 text-[hsl(var(--kpi-up))]",
              trendDirection === "down" && "bg-[hsl(var(--kpi-down))]/10 text-[hsl(var(--kpi-down))]",
              trendDirection === "neutral" && "bg-muted text-kpi-neutral"
            )}>
              {trendDirection === "up" && <TrendingUp className="w-3 h-3" />}
              {trendDirection === "down" && <TrendingDown className="w-3 h-3" />}
              {trendDirection === "neutral" && <Minus className="w-3 h-3" />}
              {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
            </span>
          )}
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
