import { useApiQuery } from "@/hooks/useApiQuery";
import { revenueApi, trendsApi } from "@/services/api";
import { KpiCard, formatValue } from "@/components/KpiCard";
import { ChartCard } from "@/components/ChartCard";
import { CHART_COLORS } from "@/lib/chartColors";
import { DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useState } from "react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {formatValue(p.value, "currency")}
        </p>
      ))}
    </div>
  );
};

export default function OverviewPage() {
  const [year, setYear] = useState(2024);
  const { data: revenueByYear = [] } = useApiQuery(["revenue-by-year"], revenueApi.byYear);
  const { data: revenueByMonth = [] } = useApiQuery(["revenue-by-month", year.toString()], () => revenueApi.byMonth(year));
  const { data: concentration = [] } = useApiQuery(["revenue-concentration"], revenueApi.concentration);
  const { data: marginData = [] } = useApiQuery(["trends-margin", year.toString()], () => trendsApi.margin(year));
  
  const totalRevenue = revenueByYear.reduce((sum, d) => sum + d.value, 0);
  const currentYear = revenueByYear.find(d => d.label === `${year}`)?.value ?? 0;
  const priorYear = revenueByYear.find(d => d.label === `${year - 1}`)?.value ?? 0;
  const growth = priorYear > 0 ? ((currentYear - priorYear) / priorYear) * 100 : 0;
  const totalMargin = marginData.reduce((sum, d) => sum + d.margin, 0);
  const avgMarginRate = marginData.length > 0
    ? (totalMargin / marginData.reduce((sum, d) => sum + d.totalValue, 0)) * 100
    : 0;
    console.log("Revenue by Year:", revenueByMonth);


const years = revenueByYear
  .map(d => Number(d.label))
  .filter(y => !Number.isNaN(y));

const minYear = Math.min(...years);
const maxYear = Math.max(...years);

const yearRange = years.length > 0 ? `${minYear}–${maxYear}` : "";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground mt-1">Tableau de bord analytique — Année {year}</p>
      </div>
      <div className="flex items-center justify-between">
  

  <select
    value={year}
    onChange={(e) => setYear(Number(e.target.value))}
    className="bg-background border border-border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
  >
    {years.map((y) => (
      <option key={y} value={y}>
        {y}
      </option>
    ))}
  </select>
</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={`CA ${year}`} value={currentYear} format="currency" trend={growth} icon={<DollarSign className="w-4 h-4" />} />
        <KpiCard title="CA Total" value={totalRevenue} format="currency" subtitle={yearRange} icon={<BarChart3 className="w-4 h-4" />} />
        <KpiCard title="Marge Totale" value={totalMargin} format="currency" icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard title="Taux de Marge" value={`${avgMarginRate.toFixed(1)}%`} subtitle="Moyenne annuelle" icon={<Users className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Chiffre d'affaires par mois" description={`Évolution mensuelle ${year}`}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" name="CA" stroke={CHART_COLORS[0]} fill="url(#gradientRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Concentration du CA" description="Part de chaque client">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={concentration} dataKey="sharePercent" nameKey="client" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3} strokeWidth={0}>
                {concentration.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="CA annuel" description="Évolution sur 5 ans">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="CA" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Marge mensuelle" description="Revenu vs Coût vs Marge">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={marginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="totalValue" name="Revenu" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Coût" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="margin" name="Marge" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
