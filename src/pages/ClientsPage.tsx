import { useApiQuery } from "@/hooks/useApiQuery";
import { clientsApi } from "@/services/api";
import { ChartCard } from "@/components/ChartCard";
import { KpiCard, formatValue } from "@/components/KpiCard";
import { CHART_COLORS } from "@/lib/chartColors";
import { Users, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function ClientsPage() {
  const { data: aboveAvg = [] } = useApiQuery(["clients-above-avg"], clientsApi.aboveAverage);
  const { data: outstanding = [] } = useApiQuery(["clients-outstanding"], clientsApi.outstandingBalance);
  const { data: risky = [] } = useApiQuery(["clients-risky"], clientsApi.highDiscountLowMargin);
  const { data: byMargin = [] } = useApiQuery(["clients-margin"], clientsApi.byMargin);
  const { data: avgOrder = [] } = useApiQuery(["clients-avg-order"], clientsApi.avgOrderValue);

  const totalOutstanding = outstanding.reduce((s, d) => s + d.remaining, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analyse Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">Segments, marges et risques clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Clients au-dessus moy." value={aboveAvg.length} icon={<Users className="w-4 h-4" />} />
        <KpiCard title="Solde impayé total" value={totalOutstanding} format="currency" icon={<AlertTriangle className="w-4 h-4" />} />
        <KpiCard title="Clients à risque" value={risky.length} subtitle="Remise élevée, marge faible" icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Marge par client" description="CA, coût et marge">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byMargin} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="client" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={120} />
              <Tooltip formatter={(v: number) => formatValue(v, "currency")} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="totalHT" name="CA HT" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
              <Bar dataKey="margin" name="Marge" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Solde impayé" description="Payé vs Restant par client">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={outstanding} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="client" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={120} />
              <Tooltip formatter={(v: number) => formatValue(v, "currency")} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="paid" name="Payé" stackId="a" fill={CHART_COLORS[0]} />
              <Bar dataKey="remaining" name="Restant" stackId="a" fill={CHART_COLORS[4]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Panier moyen" description="Valeur moyenne par commande">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={avgOrder}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="client" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v: number) => formatValue(v, "currency")} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avgOrderValue" name="Panier Moy." fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Clients à risque" description="Remise élevée et marge faible">
          <div className="space-y-3">
            {risky.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucun client à risque identifié</p>
            ) : (
              risky.map((c) => (
                <div key={c.client} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div>
                    <p className="text-sm font-medium">{c.client}</p>
                    <p className="text-xs text-muted-foreground">Remise: {c.discountRate}%</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono font-bold ${c.margin < 0 ? "text-destructive" : "text-kpi-up"}`}>
                      {formatValue(c.margin, "currency")}
                    </p>
                    <p className="text-xs text-muted-foreground">Marge</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
