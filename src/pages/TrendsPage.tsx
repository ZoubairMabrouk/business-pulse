import { useApiQuery } from "@/hooks/useApiQuery";
import { trendsApi } from "@/services/api";
import { ChartCard } from "@/components/ChartCard";
import { KpiCard, formatValue } from "@/components/KpiCard";
import { CHART_COLORS } from "@/lib/chartColors";
import { TrendingUp, Activity } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const CurrencyTooltip = ({ active, payload, label }: any) => {
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

export default function TrendsPage() {
  const { data: yoyRevenue = [] } = useApiQuery(["yoy-revenue"], () => trendsApi.yoyRevenue(2024, 2023));
  const { data: yoyVolume = [] } = useApiQuery(["yoy-volume"], () => trendsApi.yoyVolume(2024, 2023));
  const { data: ytd = [] } = useApiQuery(["ytd-2024"], () => trendsApi.ytd(2024));
  const { data: qtd = [] } = useApiQuery(["qtd-2024"], () => trendsApi.qtd(2024));
  const { data: margin = [] } = useApiQuery(["margin-2024"], () => trendsApi.margin(2024));

  const avgGrowth = yoyRevenue.length > 0
    ? yoyRevenue.reduce((s, d) => s + d.growth, 0) / yoyRevenue.length
    : 0;
  const ytdTotal = ytd.length > 0 ? ytd[ytd.length - 1].value : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tendances</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyse des tendances et prévisions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Croissance Moy." value={`${avgGrowth.toFixed(1)}%`} trend={avgGrowth} icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard title="YTD 2024" value={ytdTotal} format="currency" icon={<Activity className="w-4 h-4" />} />
        <KpiCard title="QTD Q4" value={qtd.length > 0 ? qtd[qtd.length - 1].value : 0} format="currency" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Croissance CA par client" description="Année sur année (2023 vs 2024)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yoyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="client" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="previousYear" name="2023" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="currentYear" name="2024" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volume YoY" description="Comparaison trimestrielle">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yoyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="previousValue" name="2023" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="currentValue" name="2024" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Year-to-Date (cumulé)" description="CA cumulé 2024">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={ytd}>
              <defs>
                <linearGradient id="gradYtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[1]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Area type="monotone" dataKey="value" name="Cumulé" stroke={CHART_COLORS[1]} fill="url(#gradYtd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Marge mensuelle" description="Revenu, coût et marge 2024">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="totalValue" name="Revenu" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cost" name="Coût" stroke={CHART_COLORS[4]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="margin" name="Marge" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 3, fill: CHART_COLORS[0] }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
