import { useApiQuery } from "@/hooks/useApiQuery";
import { taxApi, documentsApi } from "@/services/api";
import { ChartCard } from "@/components/ChartCard";
import { KpiCard, formatValue } from "@/components/KpiCard";
import { CHART_COLORS } from "@/lib/chartColors";
import { Receipt, FileText } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function TaxPage() {
  const { data: tva = [] } = useApiQuery(["tva-2024"], () => taxApi.tvaByMonth(2024));
  const { data: fodec = [] } = useApiQuery(["fodec"], taxApi.fodecByDoctype);
  const { data: burden = [] } = useApiQuery(["tax-burden"], taxApi.burdenByQuarter);
  const { data: docVolume = [] } = useApiQuery(["doc-volume"], documentsApi.volumeByTypeQuarter);

  const totalTva = tva.reduce((s, d) => s + d.totalValue, 0);
  const avgBurden = burden.length > 0 ? burden.reduce((s, d) => s + d.value, 0) / burden.length : 0;
  const totalDocs = docVolume.reduce((s, d) => s + d.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fiscalité & Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">TVA, FODEC et volumes documentaires</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="TVA Totale 2024" value={totalTva} format="currency" icon={<Receipt className="w-4 h-4" />} />
        <KpiCard title="Pression Fiscale Moy." value={`${avgBurden.toFixed(1)}%`} icon={<Receipt className="w-4 h-4" />} />
        <KpiCard title="Documents Émis" value={totalDocs} icon={<FileText className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="TVA mensuelle" description="Montant TVA par mois 2024">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tva}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v: number) => formatValue(v, "currency")} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="totalValue" name="TVA" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pression fiscale" description="Évolution trimestrielle">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={burden}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[16, 21]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" name="Pression" stroke={CHART_COLORS[4]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[4] }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="FODEC par type de document" description="Répartition FODEC">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={fodec.filter(d => d.totalValue > 0)} dataKey="totalValue" nameKey="documentType" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} strokeWidth={0}>
                {fodec.filter(d => d.totalValue > 0).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatValue(v, "currency")} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volume documentaire" description="Par type et trimestre">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={docVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="quantity" name="Quantité" fill={CHART_COLORS[5]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
