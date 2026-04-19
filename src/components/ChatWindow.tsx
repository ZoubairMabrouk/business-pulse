  import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
  import { useQuery } from "@tanstack/react-query";


  // ─── Types ───────────────────────────────────────────────────────────────────
  
  type Message = {
    from: "user" | "bot";
    text: string;
  };
  
  // ─── Config ──────────────────────────────────────────────────────────────────
  
  const API_BASE = "http://localhost:5078/api";
  const FASTAPI_BASE = "http://localhost:8000";
  const TOP_K = 15;
  
  // ─── FastAPI Chat Service ─────────────────────────────────────────────────────
  
  async function sendToFastApi(prompt: string): Promise<string> {
    const response = await fetch(`${FASTAPI_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        top_k: TOP_K,
      }),
    });
  
    if (!response.ok) {
      throw new Error(`FastAPI error: ${response.status} ${response.statusText}`);
    }
  
    const data = await response.json();
  const cleanQuery = cleanMDX(data.mdx);

    console.log("Clean MDX:", cleanQuery);

    const mdxRes = await fetch(`${API_BASE}/llm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generatedQuery: cleanQuery,
      }),
    });
if (!mdxRes.ok) {
    const errorText = await mdxRes.text();
    console.error("MDX API Error:", errorText);
    throw new Error(`API error: ${mdxRes.status}`);
  }

  // ✅ IMPORTANT : lire le body
  const result = await mdxRes.json();

  console.log("MDX Result:", result);
  const formatted = formatMDXResult(result.data);

  // adapte selon ton backend
  return formatted || "Aucun résultat trouvé pour cette requête.";
  }
  
  function cleanMDX(raw: string): string {
    if (!raw) return "";

    return raw
      .replace(/```mdx/g, "")   
      .replace(/```/g, "")      
      .trim();                  
  }
  function formatMDXResult(data: any[]): string {
  if (!Array.isArray(data)) return "Aucun résultat";

  return data
    .slice(0, 20) // ⚠️ limiter pour éviter 7000 lignes
    .map((row) => {
      const year = row["[Dim Date].[Year].[Year].[MEMBER_CAPTION]"];
      const value = row["[Measures].[Doc Total HT]"];

      return `📅 ${year} → 💰 ${value}`;
    })
    .join("\n");
}
  
  export const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
      { from: "bot", text: "Bonjour ! Comment puis-je vous aider ?" },
    ]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
  
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  
    const sendMessage = async () => {
      if (!input.trim() || loading) return;
  
      const userMessage: Message = { from: "user", text: input };
      console.log("User message:", userMessage.text);
  
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);
  
      try {
        const answer = await sendToFastApi(userMessage.text);
  
        const botMessage: Message = { from: "bot", text: answer };
        console.log("Bot message:", botMessage.text);
  
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Erreur FastAPI:", error);
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Erreur lors de la récupération de la réponse." },
        ]);
      } finally {
        setLoading(false);
      }
    };
  
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") sendMessage();
    };
  
    return (
  <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border">
        {/* Fixed header */}
        <div className="bg-blue-600 text-white font-semibold p-3 text-center">
          Chatbot Analytique
        </div>
  
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[70%] px-4 py-2 rounded-2xl break-words shadow-sm ${
                  msg.from === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
  
          {loading && (
            <div className="flex justify-start">
              <span className="max-w-[70%] px-4 py-2 rounded-2xl break-words shadow-sm bg-gray-200 text-gray-900 italic">
                ...en cours de réponse
              </span>
            </div>
          )}
  
          <div ref={messagesEndRef} />
        </div>
  
        {/* Input + send button */}
        <div className="flex p-2 border-t bg-white text-black">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Écrire un message..."
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className={`bg-blue-600 text-white px-6 rounded-r-full transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "..." : "Envoyer"}
          </button>
        </div>
      </div>
    );
  };