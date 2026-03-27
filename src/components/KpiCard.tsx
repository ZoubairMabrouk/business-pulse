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
}

export function formatValue(value: number, format: "currency" | "percent" | "number" = "number"): string {
  if (format === "currency") {
    return new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(value);
  }
  if (format === "percent") return `${value.toFixed(1)}%`;
  return new Intl.NumberFormat("fr-TN").format(value);
}

export function KpiCard({ title, value, subtitle, trend, icon, format = "number" }: KpiCardProps) {
  const displayValue = typeof value === "number" ? formatValue(value, format) : value;
  const trendDirection = trend && trend > 0 ? "up" : trend && trend < 0 ? "down" : "neutral";

  return (
    <Card className="glass-card animate-fade-in overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <p className="text-2xl font-bold tracking-tight font-mono animate-count-up">{displayValue}</p>
        <div className="flex items-center gap-2 mt-2">
          {trend !== undefined && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendDirection === "up" && "text-kpi-up",
              trendDirection === "down" && "text-kpi-down",
              trendDirection === "neutral" && "text-kpi-neutral"
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
