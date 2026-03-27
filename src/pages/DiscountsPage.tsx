import { useApiQuery } from "@/hooks/useApiQuery";
import { discountsApi } from "@/services/api";
import { ChartCard } from "@/components/ChartCard";
import { KpiCard, formatValue } from "@/components/KpiCard";
import { CHART_COLORS } from "@/lib/chartColors";
import { Percent } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function DiscountsPage() {
  const { data: ratioByYear = [] } = useApiQuery(["discounts-ratio"], discountsApi.ratioByYear);
  const { data: topClients = [] } = useApiQuery(["discounts-top"], discountsApi.topClients);
  const { data: byDocType = [] } = useApiQuery(["discounts-doctype"], discountsApi.byDocumentType);

  const currentRatio = ratioByYear.length > 0 ? ratioByYear[ratioByYear.length - 1].value : 0;
  const totalDiscounts = topClients.reduce((s, d) => s + d.totalDiscount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Remises</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyse des remises et réductions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Taux de Remise 2024" value={`${currentRatio}%`} icon={<Percent className="w-4 h-4" />} />
        <KpiCard title="Total Remises (Top)" value={totalDiscounts} format="currency" />
        <KpiCard title="Types de Document" value={byDocType.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Taux de remise par année" description="Évolution du ratio de remise">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ratioByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" name="Ratio" stroke={CHART_COLORS[3]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[3] }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Remises par type de document" description="Distribution des remises">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={byDocType} dataKey="totalValue" nameKey="documentType" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} strokeWidth={0}>
                {byDocType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatValue(v, "currency")} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Top clients par remise" description="Montant et taux de remise">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topClients}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="client" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
            <Tooltip formatter={(v: number, name: string) => name === "Taux" ? `${v}%` : formatValue(v, "currency")} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="totalDiscount" name="Montant" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
