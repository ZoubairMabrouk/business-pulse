import React, { useState, useRef, useEffect, KeyboardEvent, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles, Send, Loader2, User, Bot, Plus, MessageSquare,
  TrendingUp, Users, Receipt, Trash2, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
type Message = {
  id: string;
  from: "user" | "bot";
  text?: string;
  tableData?: any[];
  ts: number;
};
type Conversation = { id: string; title: string; messages: Message[]; createdAt: number };

// ─── Config ──────────────────────────────────────────────
const API_BASE = "http://localhost:5078/api";
const FASTAPI_BASE = "http://localhost:8000";
const TOP_K = 15;

const SUGGESTIONS = [
  { icon: TrendingUp, label: "Évolution du CA par mois en 2024" },
  { icon: Users, label: "Top 10 clients par chiffre d'affaires" },
  { icon: Receipt, label: "Répartition de la TVA par trimestre" },
  { icon: Sparkles, label: "Analyse des remises et leur impact" },
];

const cleanMDX = (raw: string) => (raw || "").replace(/```mdx/g, "").replace(/```/g, "").trim();
const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Chart helpers (preserved logic) ─────────────────────
function getBestDimension(data: any[], columns: string[]) {
  const stats = columns.map((col) => ({
    col,
    uniqueCount: new Set(data.map(r => r[col])).size,
    total: data.length,
    isNumeric: typeof data[0][col] === "number",
  }));
  let dims = stats.filter(c => !c.isNumeric && c.uniqueCount > 1 && c.uniqueCount < c.total);
  const seen = new Set<number>();
  dims = dims.filter(d => (seen.has(d.uniqueCount) ? false : (seen.add(d.uniqueCount), true)));
  dims.sort((a, b) => a.uniqueCount - b.uniqueCount);
  return dims[0]?.col || null;
}
function groupData(data: any[], groupBy: string, measures: string[]) {
  const map = new Map<string, any>();
  data.forEach(row => {
    const key = row[groupBy];
    if (!map.has(key)) {
      const r: any = { [groupBy]: key };
      measures.forEach(m => { r[m] = typeof row[m] === "number" ? row[m] : 0; });
      map.set(key, r);
    } else {
      const ex = map.get(key);
      measures.forEach(m => { if (typeof row[m] === "number") ex[m] += row[m]; });
    }
  });
  return Array.from(map.values());
}

// ─── Dynamic chart ───────────────────────────────────────
const DynamicChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data?.length) return null;
  const keys = Object.keys(data[0]);
  const measures = keys.filter(k => typeof data[0][k] === "number");
  const dims = keys.filter(k => typeof data[0][k] !== "number");
  const bestDim = getBestDimension(data, dims);
  if (!bestDim || !measures.length) return null;
  const grouped = groupData(data, bestDim, measures);
  const chartType = measures.length === 1 ? "bar" : "line";
  const ChartEl: any = chartType === "bar" ? BarChart : LineChart;

  return (
    <div className="w-full h-[280px] rounded-xl p-3 glass-card">
      <ResponsiveContainer width="100%" height="100%">
        <ChartEl data={grouped}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={bestDim} stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          {chartType === "bar" ? (
            <Bar dataKey={measures[0]} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          ) : (
            measures.map((m, i) => (
              <Line key={m} type="monotone" dataKey={m} stroke={`hsl(var(--chart-${(i % 6) + 1}))`} strokeWidth={2} dot={false} />
            ))
          )}
        </ChartEl>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Dynamic table ───────────────────────────────────────
const DynamicTable: React.FC<{ data: any[] }> = ({ data }) => {
  const columns = data?.length ? Object.keys(data[0]) : [];
  const filteredData = useMemo(
    () => data.filter(row => columns.every(c => row[c] !== null && row[c] !== undefined)),
    [data]
  );
  const groupable = useMemo(() => {
    const stats = columns.map(col => ({ col, u: new Set(filteredData.map(r => r[col])).size, t: filteredData.length }));
    let cands = stats.filter(c => c.u > 1 && c.u < c.t);
    const seen = new Set<number>();
    cands = cands.filter(c => (seen.has(c.u) ? false : (seen.add(c.u), true)));
    cands.sort((a, b) => a.u - b.u);
    return cands.map(c => c.col);
  }, [filteredData]);
  const [groupBy, setGroupBy] = useState("");
  useEffect(() => { if (groupable.length) setGroupBy(groupable[0]); }, [groupable]);

  const groupedData = useMemo(() => {
    if (!groupBy) return filteredData;
    const map = new Map<string, any>();
    filteredData.forEach(row => {
      const key = row[groupBy];
      if (!map.has(key)) map.set(key, { ...row });
      else {
        const ex = map.get(key);
        Object.keys(row).forEach(c => { if (c !== groupBy && typeof row[c] === "number") ex[c] += row[c]; });
      }
    });
    return Array.from(map.values());
  }, [filteredData, groupBy]);

  if (!data?.length) return null;
  return (
    <div className="glass-card rounded-xl p-3 space-y-3">
      {groupable.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Grouper par:</span>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
            className="h-7 px-2 rounded-md bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Aucun</option>
            {groupable.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="ml-auto text-muted-foreground">{groupedData.length} ligne(s)</span>
        </div>
      )}
      <div className="overflow-auto max-h-[320px] scrollbar-thin">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card/95 backdrop-blur">
            <tr className="border-b border-border">
              {columns.map(col => (
                <th key={col} className="text-left font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider text-[10px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedData.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-3 py-2 font-mono">
                    {typeof row[col] === "number"
                      ? new Intl.NumberFormat("fr-TN").format(row[col])
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Typing indicator ────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1 px-2">
    {[0, 1, 2].map(i => (
      <span key={i}
        className="w-2 h-2 rounded-full bg-primary animate-typing-dot"
        style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

// ─── Message bubble ──────────────────────────────────────
const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isUser = msg.from === "user";
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (msg.text) {
      navigator.clipboard.writeText(msg.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className={cn("flex gap-3 group animate-slide-up", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
        isUser ? "bg-muted" : "gradient-primary"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary-foreground" />}
      </div>

      <div className={cn("flex-1 min-w-0 max-w-[85%]", isUser && "flex flex-col items-end")}>
        {msg.tableData ? (
          <div className="space-y-3 w-full">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent" />
              Résultat analytique généré
            </div>
            <DynamicChart data={msg.tableData} />
            <DynamicTable data={msg.tableData} />
          </div>
        ) : (
          <div className={cn(
            "relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md"
              : "glass-card rounded-tl-sm"
          )}>
            <div className={cn("prose prose-sm max-w-none", isUser ? "prose-invert" : "dark:prose-invert")}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text || ""}</ReactMarkdown>
            </div>
            {!isUser && msg.text && (
              <button
                onClick={copy}
                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-md bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-muted"
                aria-label="Copier"
              >
                {copied ? <Check className="w-3 h-3 text-[hsl(var(--success))]" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main page ───────────────────────────────────────────
export const GenerativePage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: uid(), title: "Nouvelle conversation", messages: [], createdAt: Date.now() },
  ]);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const active = conversations.find(c => c.id === activeId)!;
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active.messages, loading]);

  const updateActive = (updater: (c: Conversation) => Conversation) => {
    setConversations(cs => cs.map(c => c.id === activeId ? updater(c) : c));
  };

  const newConversation = () => {
    const conv = { id: uid(), title: "Nouvelle conversation", messages: [], createdAt: Date.now() };
    setConversations(cs => [conv, ...cs]);
    setActiveId(conv.id);
  };

  const deleteConversation = (id: string) => {
    setConversations(cs => {
      const next = cs.filter(c => c.id !== id);
      if (id === activeId) {
        if (next.length) setActiveId(next[0].id);
        else {
          const nc = { id: uid(), title: "Nouvelle conversation", messages: [], createdAt: Date.now() };
          setActiveId(nc.id);
          return [nc];
        }
      }
      return next;
    });
  };

  async function callBackend(prompt: string) {
    const res = await fetch(`${FASTAPI_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, top_k: TOP_K }),
    });
    const data = await res.json();
    const mdx = cleanMDX(data.mdx);
    const mdxRes = await fetch(`${API_BASE}/llm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generatedQuery: mdx }),
    });
    const result = await mdxRes.json();
    return result.data;
  }

  const send = async (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt || loading) return;
    const userMsg: Message = { id: uid(), from: "user", text: prompt, ts: Date.now() };
    updateActive(c => ({
      ...c,
      title: c.messages.length === 0 ? prompt.slice(0, 40) : c.title,
      messages: [...c.messages, userMsg],
    }));
    setInput("");
    setLoading(true);
    try {
      const data = await callBackend(prompt);
      const botMsg: Message = Array.isArray(data)
        ? { id: uid(), from: "bot", tableData: data, ts: Date.now() }
        : { id: uid(), from: "bot", text: "Aucun résultat trouvé pour cette requête.", ts: Date.now() };
      updateActive(c => ({ ...c, messages: [...c.messages, botMsg] }));
    } catch {
      updateActive(c => ({
        ...c,
        messages: [...c.messages, {
          id: uid(), from: "bot", ts: Date.now(),
          text: "⚠️ **Erreur de connexion** au service d'IA. Vérifiez que les services FastAPI et l'API MDX sont disponibles.",
        }],
      }));
    } finally { setLoading(false); }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const isEmpty = active.messages.length === 0;

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] flex bg-background">
      {/* History panel */}
      <aside className="w-64 border-r border-border bg-card/30 backdrop-blur flex flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b border-border">
          <button
            onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-sm hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Nouvelle discussion
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Historique</p>
          {conversations.map(c => (
            <div key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "group flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                c.id === activeId ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
              )}>
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 truncate text-xs">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center gap-3 px-5 shrink-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))] ring-2 ring-background" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold leading-tight">Assistant Analytique IA</h2>
            <p className="text-[10px] text-muted-foreground">Connecté · Powered by OLAP + LLM</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
            {isEmpty ? (
              <div className="flex flex-col items-center text-center pt-12 animate-fade-in">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <span className="absolute inset-0 rounded-2xl gradient-primary opacity-50 animate-pulse-ring" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Comment puis-je vous aider ?</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Posez une question analytique en langage naturel — je génère la requête MDX, exécute le cube et visualise.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
                  {SUGGESTIONS.map(s => (
                    <button key={s.label}
                      onClick={() => send(s.label)}
                      className="group flex items-start gap-3 p-4 rounded-xl glass-card text-left hover-lift">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Cliquez pour exécuter</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {active.messages.map(m => <MessageBubble key={m.id} msg={m} />)}
                {loading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 flex items-center">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-card/30 backdrop-blur p-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 p-2 rounded-2xl glass-card focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder="Posez votre question analytique… (Shift+Entrée pour une nouvelle ligne)"
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground max-h-40 scrollbar-thin"
                style={{ minHeight: 40 }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="h-10 w-10 shrink-0 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-opacity"
                aria-label="Envoyer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              L'IA peut commettre des erreurs. Vérifiez les données critiques avant décision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
