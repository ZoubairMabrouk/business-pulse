import { useApiQuery } from "@/hooks/useApiQuery";
import { revenueApi } from "@/services/api";
import { ChartCard } from "@/components/ChartCard";
import { KpiCard, formatValue } from "@/components/KpiCard";
import { CHART_COLORS } from "@/lib/chartColors";
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
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

export default function RevenuePage() {
  const { data: byYear = [] } = useApiQuery(["revenue-by-year"], revenueApi.byYear);
  const { data: byMonth = [] } = useApiQuery(["revenue-by-month-2024"], () => revenueApi.byMonth(2024));
  const { data: byQuarter = [] } = useApiQuery(["revenue-by-quarter"], revenueApi.byQuarterDoctype);
  const { data: byClient = [] } = useApiQuery(["revenue-by-client"], revenueApi.byClient);
  const { data: topClients = [] } = useApiQuery(["revenue-top-clients"], revenueApi.topClients);
  const { data: bottomClients = [] } = useApiQuery(["revenue-bottom-clients"], revenueApi.bottomClients);
  const { data: concentration = [] } = useApiQuery(["revenue-concentration"], revenueApi.concentration);

  const totalRevenue = byClient.reduce((s, d) => s + d.totalHT, 0);
  const totalTTC = byClient.reduce((s, d) => s + d.totalTTC, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chiffre d'affaires</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyse détaillée du chiffre d'affaires</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Total HT" value={totalRevenue} format="currency" icon={<DollarSign className="w-4 h-4" />} />
        <KpiCard title="Total TTC" value={totalTTC} format="currency" icon={<DollarSign className="w-4 h-4" />} />
        <KpiCard title="Clients actifs" value={byClient.length} subtitle="Avec du CA" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="CA mensuel 2024" description="Évolution mois par mois">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Line type="monotone" dataKey="value" name="CA" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[0] }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CA trimestriel" description="Par trimestre 2024">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byQuarter}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Bar dataKey="value" name="CA" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="CA par client" description="HT vs TTC" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byClient} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="client" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={120} />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="totalHT" name="HT" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
              <Bar dataKey="totalTTC" name="TTC" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Concentration" description="Répartition du CA">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={concentration} dataKey="sharePercent" nameKey="client" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} strokeWidth={0}>
                {concentration.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Top Clients" description="Meilleurs clients par CA">
          <div className="space-y-3">
            {topClients.map((c, i) => (
              <div key={c.client} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: CHART_COLORS[i], color: "hsl(var(--background))" }}>{i + 1}</span>
                  <span className="text-sm font-medium">{c.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-3 h-3 text-kpi-up" />
                  <span className="text-sm font-mono">{formatValue(c.totalHT, "currency")}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Clients les plus faibles" description="Clients avec le CA le plus bas">
          <div className="space-y-3">
            {bottomClients.map((c, i) => (
              <div key={c.client} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-destructive/20 text-destructive">{i + 1}</span>
                  <span className="text-sm font-medium">{c.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-3 h-3 text-kpi-down" />
                  <span className="text-sm font-mono">{formatValue(c.totalHT, "currency")}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
