import React, { useState, useRef, useEffect, KeyboardEvent, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Message = {
  from: "user" | "bot";
  text?: string;
  tableData?: any[];
};

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const API_BASE = "http://localhost:5078/api";
const FASTAPI_BASE = "http://localhost:8000";
const TOP_K = 15;

// ─────────────────────────────────────────────
// UTIL: CLEAN MDX
// ─────────────────────────────────────────────

function cleanMDX(raw: string): string {
  if (!raw) return "";
  return raw.replace(/```mdx/g, "").replace(/```/g, "").trim();
}

// ─────────────────────────────────────────────
// ANALYTICS ENGINE (AUTO DETECTION)
// ─────────────────────────────────────────────

function analyzeData(data: any[]) {
  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);
  const dimensions: string[] = [];
  const measures: string[] = [];

  keys.forEach((key) => {
    if (typeof data[0][key] === "number") {
      measures.push(key);
    } else {
      dimensions.push(key);
    }
  });

  return { dimensions, measures };
}

function chooseChartType(dimensions: string[], measures: string[]) {
  if (dimensions.length === 1 && measures.length === 1) return "bar";
  if (dimensions.length === 1 && measures.length > 1) return "line";
  return "bar";
}

  function getBestDimension(data: any[], columns: string[]) {
  const stats = columns.map((col) => {
    const values = data.map((r) => r[col]);
    const uniqueCount = new Set(values).size;

    return {
      col,
      uniqueCount,
      total: values.length,
      isNumeric: typeof data[0][col] === "number",
    };
  });

  // 🔥 garder dimensions valides
  let dims = stats.filter(
    (c) =>
      !c.isNumeric && // pas measure
      c.uniqueCount > 1 &&
      c.uniqueCount < c.total
  );

  // 🔥 supprimer doublons (même cardinalité)
  const seen = new Set<number>();
  dims = dims.filter((d) => {
    if (seen.has(d.uniqueCount)) return false;
    seen.add(d.uniqueCount);
    return true;
  });

  // 🔥 trier (meilleure granularité)
  dims.sort((a, b) => a.uniqueCount - b.uniqueCount);

  return dims.length > 0 ? dims[0].col : null;
}
function groupData(data: any[], groupBy: string, measures: string[]) {
  const map = new Map<string, any>();

  data.forEach((row) => {
    const key = row[groupBy];

    if (!map.has(key)) {
      const newRow: any = { [groupBy]: key };

      measures.forEach((m) => {
        newRow[m] = typeof row[m] === "number" ? row[m] : 0;
      });

      map.set(key, newRow);
    } else {
      const existing = map.get(key);

      measures.forEach((m) => {
        if (typeof row[m] === "number") {
          existing[m] += row[m];
        }
      });
    }
  });

  return Array.from(map.values());
}
// ─────────────────────────────────────────────
// CHART COMPONENT
// ─────────────────────────────────────────────

const DynamicChart: React.FC<{ data: any[] }> = ({ data }) => {
   if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);

  // 🔥 split dims / measures
  const measures = keys.filter((k) => typeof data[0][k] === "number");
  const dimensions = keys.filter((k) => typeof data[0][k] !== "number");

  // 🔥 choisir meilleure dimension
  const bestDim = getBestDimension(data, dimensions);

  if (!bestDim || measures.length === 0) return null;

  // 🔥 group data
  const grouped = groupData(data, bestDim, measures);

  // 🔥 choisir type chart
  const chartType =
    measures.length === 1 ? "bar" : "line";

  return (
    <div className="w-full h-[350px] bg-white rounded-xl p-2 shadow">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "bar" ? (
          <BarChart data={grouped}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={bestDim} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={measures[0]} fill="#3b82f6" />
          </BarChart>
        ) : (
          <LineChart data={grouped}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={bestDim} />
            <YAxis />
            <Tooltip />
            {measures.map((m) => (
              <Line key={m} type="monotone" dataKey={m} stroke="#3b82f6" />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
// ─────────────────────────────────────────────
// TABLE COMPONENT (DYNAMIC)
// ─────────────────────────────────────────────

type Props = {
  data: any[];
};

export const DynamicTable: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  // ─────────────────────────────
  // 1. CLEAN DATA
  // ─────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      columns.every((col) => row[col] !== null && row[col] !== undefined)
    );
  }, [data]);

  // ─────────────────────────────
  // 2. DETECT GROUPABLE COLUMNS
  // ─────────────────────────────
const groupableColumns = useMemo(() => {
  const columnStats = columns.map((col) => {
    const values = filteredData.map((r) => r[col]);
    const uniqueCount = new Set(values).size;
    const total = values.length;

    return { col, uniqueCount, total };
  });

  console.table(columnStats);

  // 🔥 1. garder seulement dimensions pertinentes
  let candidates = columnStats.filter(
    (c) =>
      c.uniqueCount > 1 && // pas constant
      c.uniqueCount < c.total // pas mesure
  );

  // 🔥 2. supprimer doublons (ex: Month vs MonthName)
  const seenCardinality = new Set<number>();

  candidates = candidates.filter((c) => {
    if (seenCardinality.has(c.uniqueCount)) return false;
    seenCardinality.add(c.uniqueCount);
    return true;
  });

  // 🔥 3. trier (meilleure dimension en premier)
  candidates.sort((a, b) => a.uniqueCount - b.uniqueCount);

  return candidates.map((c) => c.col);
}, [filteredData]);
  // ─────────────────────────────
  // 3. STATE (USER CHOICE)
  // ─────────────────────────────
  const [groupBy, setGroupBy] = useState<string | "">("");
  useEffect(() => {
  if (groupableColumns.length > 0) {
    setGroupBy(groupableColumns[0]); // 🔥 meilleur choix auto
  }
}, [groupableColumns]);

  // ─────────────────────────────
  // 4. GROUPING ENGINE
  // ─────────────────────────────
  const groupedData = useMemo(() => {
    if (!groupBy) return filteredData;

    const map = new Map<string, any>();

    filteredData.forEach((row) => {
      const key = row[groupBy];

      if (!map.has(key)) {
        map.set(key, { ...row });
      } else {
        const existing = map.get(key);

        Object.keys(row).forEach((col) => {
          if (col !== groupBy && typeof row[col] === "number") {
            existing[col] += row[col]; // SUM
          }
        });
      }
    });

    return Array.from(map.values());
  }, [filteredData, groupBy]);

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow p-2 mt-3 space-y-2">

      {/* 🔥 GROUP BY SELECT */}
      {groupableColumns.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">Group by:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="">None</option>
            {groupableColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-auto">
        <table className="w-full text-sm border text-black">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="border px-2 py-1 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groupedData.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col} className="border px-2 py-1">
                    {row[col]}
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
// ─────────────────────────────────────────────
// MAIN CHAT PAGE
// ─────────────────────────────────────────────

export const GenerativePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Bonjour 👋 Posez votre question analytique" },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─────────────────────────────────────────────
  // API CALL CHAIN
  // ─────────────────────────────────────────────

  async function sendToBackend(prompt: string) {
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

  // ─────────────────────────────────────────────
  // SEND MESSAGE
  // ─────────────────────────────────────────────

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setLoading(true);

    try {
      const data = await sendToBackend(userMsg.text);

      const botMsg: Message = Array.isArray(data)
        ? { from: "bot", tableData: data }
        : { from: "bot", text: "Aucun résultat" };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Erreur serveur" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className="h-screen w-full flex flex-col border-r bg-white">

      {/* LEFT: CHAT */}
      <div className="p-3 bg-blue-600 text-black font-bold">
          Chat BI Assistant
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-black">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.tableData ? (
                <div className="space-y-3">
                  <DynamicChart data={msg.tableData} />
                  <DynamicTable data={msg.tableData}  />
                </div>
              ) : (
                <div
                  className={`p-2 rounded ${
                    msg.from === "user"
                      ? "bg-blue-500 text-black ml-auto w-fit"
                      : "bg-black-200"
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 border-t flex">
          <input
            className="flex-1 border rounded px-2 py-1 text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-black px-4 ml-2 rounded"
          >
            Send
          </button>
        </div>

      {/* RIGHT: VISUALIZATION EXPAND SPACE */}
      {/* <div className="flex-1 p-4 overflow-auto">
        <div className="text-black-500">
          📊 Les visualisations apparaissent dans le chat à gauche
        </div>
      </div> */}
    </div>
  );
};