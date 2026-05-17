import { cleanMDX } from "@/services/mdx.utils";

const API_BASE = "http://localhost:5078/api";
const FASTAPI_BASE = "http://localhost:8000";
const TOP_K = 15;

export class AnalyticsService {
  static async generateMDX(prompt: string) {
    const res = await fetch(`${FASTAPI_BASE}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        top_k: TOP_K,
      }),
    });

    if (!res.ok) {
      throw new Error("Erreur génération MDX");
    }

    const data = await res.json();

    return cleanMDX(data.mdx);
  }

  static async executeMDX(mdx: string) {
    const res = await fetch(`${API_BASE}/llm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generatedQuery: mdx,
      }),
    });

    if (!res.ok) {
      throw new Error("Erreur exécution MDX");
    }

    return res.json();
  }

  static async ask(prompt: string) {
    const mdx = await this.generateMDX(prompt);

    const result = await this.executeMDX(mdx);

    return result.data;
  }
}