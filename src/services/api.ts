// API base URL - change this to your actual API
const API_BASE = "http://localhost:5078/api";

interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T[];
}

async function fetchApi<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    const json: ApiResponse<T> = await res.json();
    if (json.success) return json.data;
    return [];
  } catch {
    // Return mock data in development
    return getMockData<T>(endpoint);
  }
}

// Revenue
export const revenueApi = {
  byYear: () => fetchApi<{ label: string; value: number }>("/revenue/by-year"),
  byMonth: (year: number) => fetchApi<{ label: string; value: number }>(`/revenue/by-month/${year}`),
  byQuarterDoctype: () => fetchApi<{ label: string; value: number }>("/revenue/by-quarter-doctype"),
  byClient: () => fetchApi<{ client: string; totalHT: number; totalTTC: number }>("/revenue/by-client"),
  topClients: () => fetchApi<{ client: string; totalHT: number; totalTTC: number }>("/revenue/top-clients"),
  bottomClients: () => fetchApi<{ client: string; totalHT: number; totalTTC: number }>("/revenue/bottom-clients"),
  concentration: () => fetchApi<{ client: string; revenue: number; sharePercent: number }>("/revenue/concentration"),
};

// Trends
export const trendsApi = {
  yoyRevenue: (current: number, prior: number) =>
    fetchApi<{ client: string; previousYear: number; currentYear: number; growth: number }>(`/trends/yoy-revenue/${current}/${prior}`),
  yoyVolume: (current: number, prior: number) =>
    fetchApi<{ label: string; previousValue: number; currentValue: number; growth: number }>(`/trends/yoy-volume/${current}/${prior}`),
  ytd: (year: number) => fetchApi<{ label: string; value: number }>(`/trends/ytd/${year}`),
  qtd: (year: number) => fetchApi<{ label: string; value: number }>(`/trends/qtd/${year}`),
  margin: (year: number) => fetchApi<{ month: string; totalValue: number; cost: number; margin: number }>(`/trends/margin/${year}`),
};

// Tax
export const taxApi = {
  tvaByMonth: (year: number) => fetchApi<{ month: string; totalValue: number; rate: number }>(`/tax/tva-by-month/${year}`),
  fodecByDoctype: () => fetchApi<{ documentType: string; totalValue: number }>("/tax/fodec-by-doctype"),
  burdenByQuarter: () => fetchApi<{ label: string; value: number }>("/tax/burden-by-quarter"),
};

// Documents
export const documentsApi = {
  volumeByTypeQuarter: () =>
    fetchApi<{ documentType: string; typeAV: string; quarter: string; quantity: number }>("/documents/volume-by-type-quarter"),
};

// Discounts
export const discountsApi = {
  ratioByYear: () => fetchApi<{ label: string; value: number }>("/discounts/ratio-by-year"),
  topClients: () => fetchApi<{ client: string; totalDiscount: number; discountRate: number }>("/discounts/top-clients"),
  byDocumentType: () => fetchApi<{ documentType: string; totalValue: number }>("/discounts/by-document-type"),
};

// Clients
export const clientsApi = {
  aboveAverage: () => fetchApi<{ client: string; totalHT: number }>("/clients/above-average"),
  outstandingBalance: () =>
    fetchApi<{ client: string; totalTTC: number; paid: number; remaining: number }>("/clients/outstanding-balance"),
  highDiscountLowMargin: () =>
    fetchApi<{ client: string; discountRate: number; margin: number }>("/clients/high-discount-low-margin"),
  byMargin: () =>
    fetchApi<{ client: string; totalHT: number; cost: number; margin: number; marginRate: number }>("/clients/by-margin"),
  avgOrderValue: () =>
    fetchApi<{ client: string; orderCount: number; avgOrderValue: number }>("/clients/avg-order-value"),
};

// Mock data for development
function getMockData<T>(endpoint: string): T[] {
  const mocks: Record<string, unknown[]> = {
    "/revenue/by-year": [
      { label: "2020", value: 85000 },
      { label: "2021", value: 102000 },
      { label: "2022", value: 120000 },
      { label: "2023", value: 150000 },
      { label: "2024", value: 180000 },
    ],
    "/revenue/by-month/2024": [
      { label: "Jan", value: 12000 }, { label: "Fév", value: 14500 },
      { label: "Mar", value: 16200 }, { label: "Avr", value: 13800 },
      { label: "Mai", value: 17500 }, { label: "Jun", value: 19200 },
      { label: "Jul", value: 15800 }, { label: "Aoû", value: 11200 },
      { label: "Sep", value: 18900 }, { label: "Oct", value: 20100 },
      { label: "Nov", value: 21500 }, { label: "Déc", value: 19300 },
    ],
    "/revenue/by-quarter-doctype": [
      { label: "2024-Q1", value: 42700 },
      { label: "2024-Q2", value: 50500 },
      { label: "2024-Q3", value: 45900 },
      { label: "2024-Q4", value: 60900 },
    ],
    "/revenue/by-client": [
      { client: "Société Alpha", totalHT: 52000, totalTTC: 61880 },
      { client: "Entreprise Beta", totalHT: 38000, totalTTC: 45220 },
      { client: "Groupe Gamma", totalHT: 31000, totalTTC: 36890 },
      { client: "Delta Corp", totalHT: 27000, totalTTC: 32130 },
      { client: "Epsilon SARL", totalHT: 18000, totalTTC: 21420 },
      { client: "Zeta Industries", totalHT: 14000, totalTTC: 16660 },
    ],
    "/revenue/top-clients": [
      { client: "Société Alpha", totalHT: 52000, totalTTC: 61880 },
      { client: "Entreprise Beta", totalHT: 38000, totalTTC: 45220 },
      { client: "Groupe Gamma", totalHT: 31000, totalTTC: 36890 },
    ],
    "/revenue/bottom-clients": [
      { client: "Micro SAS", totalHT: 2200, totalTTC: 2618 },
      { client: "Petit Commerce", totalHT: 3100, totalTTC: 3689 },
      { client: "Start-Up Omega", totalHT: 4500, totalTTC: 5355 },
    ],
    "/revenue/concentration": [
      { client: "Société Alpha", revenue: 52000, sharePercent: 28.9 },
      { client: "Entreprise Beta", revenue: 38000, sharePercent: 21.1 },
      { client: "Groupe Gamma", revenue: 31000, sharePercent: 17.2 },
      { client: "Delta Corp", revenue: 27000, sharePercent: 15.0 },
      { client: "Autres", revenue: 32000, sharePercent: 17.8 },
    ],
    "/trends/yoy-revenue/2024/2023": [
      { client: "Société Alpha", previousYear: 44000, currentYear: 52000, growth: 18.2 },
      { client: "Entreprise Beta", previousYear: 35000, currentYear: 38000, growth: 8.6 },
      { client: "Groupe Gamma", previousYear: 28000, currentYear: 31000, growth: 10.7 },
      { client: "Delta Corp", previousYear: 30000, currentYear: 27000, growth: -10.0 },
    ],
    "/trends/yoy-volume/2024/2023": [
      { label: "Q1", previousValue: 95, currentValue: 120, growth: 26.3 },
      { label: "Q2", previousValue: 110, currentValue: 135, growth: 22.7 },
      { label: "Q3", previousValue: 100, currentValue: 118, growth: 18.0 },
      { label: "Q4", previousValue: 120, currentValue: 140, growth: 16.7 },
    ],
    "/trends/ytd/2024": [
      { label: "Jan", value: 12000 }, { label: "Fév", value: 26500 },
      { label: "Mar", value: 42700 }, { label: "Avr", value: 56500 },
      { label: "Mai", value: 74000 }, { label: "Jun", value: 93200 },
      { label: "Jul", value: 109000 }, { label: "Aoû", value: 120200 },
      { label: "Sep", value: 139100 }, { label: "Oct", value: 159200 },
      { label: "Nov", value: 180700 }, { label: "Déc", value: 200000 },
    ],
    "/trends/qtd/2024": [
      { label: "Oct", value: 20100 },
      { label: "Nov", value: 41600 },
      { label: "Déc", value: 60900 },
    ],
    "/trends/margin/2024": [
      { month: "Jan", totalValue: 12000, cost: 8400, margin: 3600 },
      { month: "Fév", totalValue: 14500, cost: 9800, margin: 4700 },
      { month: "Mar", totalValue: 16200, cost: 11000, margin: 5200 },
      { month: "Avr", totalValue: 13800, cost: 9500, margin: 4300 },
      { month: "Mai", totalValue: 17500, cost: 11200, margin: 6300 },
      { month: "Jun", totalValue: 19200, cost: 12800, margin: 6400 },
      { month: "Jul", totalValue: 15800, cost: 10900, margin: 4900 },
      { month: "Aoû", totalValue: 11200, cost: 8100, margin: 3100 },
      { month: "Sep", totalValue: 18900, cost: 12200, margin: 6700 },
      { month: "Oct", totalValue: 20100, cost: 13100, margin: 7000 },
      { month: "Nov", totalValue: 21500, cost: 13900, margin: 7600 },
      { month: "Déc", totalValue: 19300, cost: 12600, margin: 6700 },
    ],
    "/tax/tva-by-month/2024": [
      { month: "Jan", totalValue: 2280, rate: 19 },
      { month: "Fév", totalValue: 2755, rate: 19 },
      { month: "Mar", totalValue: 3078, rate: 19 },
      { month: "Avr", totalValue: 2622, rate: 19 },
      { month: "Mai", totalValue: 3325, rate: 19 },
      { month: "Jun", totalValue: 3648, rate: 19 },
      { month: "Jul", totalValue: 3002, rate: 19 },
      { month: "Aoû", totalValue: 2128, rate: 19 },
      { month: "Sep", totalValue: 3591, rate: 19 },
      { month: "Oct", totalValue: 3819, rate: 19 },
      { month: "Nov", totalValue: 4085, rate: 19 },
      { month: "Déc", totalValue: 3667, rate: 19 },
    ],
    "/tax/fodec-by-doctype": [
      { documentType: "FACTURE", totalValue: 3200 },
      { documentType: "AVOIR", totalValue: 800 },
      { documentType: "DEVIS", totalValue: 0 },
    ],
    "/tax/burden-by-quarter": [
      { label: "2023-Q1", value: 17.8 },
      { label: "2023-Q2", value: 18.2 },
      { label: "2023-Q3", value: 18.5 },
      { label: "2023-Q4", value: 19.0 },
      { label: "2024-Q1", value: 18.5 },
      { label: "2024-Q2", value: 19.2 },
      { label: "2024-Q3", value: 19.0 },
      { label: "2024-Q4", value: 19.5 },
    ],
    "/documents/volume-by-type-quarter": [
      { documentType: "FACTURE", typeAV: "VENTE", quarter: "2024-Q1", quantity: 120 },
      { documentType: "FACTURE", typeAV: "VENTE", quarter: "2024-Q2", quantity: 145 },
      { documentType: "FACTURE", typeAV: "VENTE", quarter: "2024-Q3", quantity: 130 },
      { documentType: "FACTURE", typeAV: "VENTE", quarter: "2024-Q4", quantity: 155 },
      { documentType: "AVOIR", typeAV: "VENTE", quarter: "2024-Q1", quantity: 12 },
      { documentType: "AVOIR", typeAV: "VENTE", quarter: "2024-Q2", quantity: 8 },
      { documentType: "AVOIR", typeAV: "VENTE", quarter: "2024-Q3", quantity: 15 },
      { documentType: "AVOIR", typeAV: "VENTE", quarter: "2024-Q4", quantity: 10 },
    ],
    "/discounts/ratio-by-year": [
      { label: "2020", value: 3.8 },
      { label: "2021", value: 4.2 },
      { label: "2022", value: 5.2 },
      { label: "2023", value: 5.8 },
      { label: "2024", value: 6.1 },
    ],
    "/discounts/top-clients": [
      { client: "Société Alpha", totalDiscount: 5200, discountRate: 10.0 },
      { client: "Delta Corp", totalDiscount: 4050, discountRate: 15.0 },
      { client: "Groupe Gamma", totalDiscount: 2480, discountRate: 8.0 },
    ],
    "/discounts/by-document-type": [
      { documentType: "FACTURE", totalValue: 9500 },
      { documentType: "AVOIR", totalValue: 1200 },
    ],
    "/clients/above-average": [
      { client: "Société Alpha", totalHT: 52000 },
      { client: "Entreprise Beta", totalHT: 38000 },
      { client: "Groupe Gamma", totalHT: 31000 },
    ],
    "/clients/outstanding-balance": [
      { client: "Société Alpha", totalTTC: 61880, paid: 45000, remaining: 16880 },
      { client: "Entreprise Beta", totalTTC: 45220, paid: 45220, remaining: 0 },
      { client: "Groupe Gamma", totalTTC: 36890, paid: 28000, remaining: 8890 },
      { client: "Delta Corp", totalTTC: 32130, paid: 20000, remaining: 12130 },
    ],
    "/clients/high-discount-low-margin": [
      { client: "Delta Corp", discountRate: 15, margin: -2000 },
      { client: "Epsilon SARL", discountRate: 12, margin: 500 },
    ],
    "/clients/by-margin": [
      { client: "Société Alpha", totalHT: 52000, cost: 31200, margin: 20800, marginRate: 40.0 },
      { client: "Entreprise Beta", totalHT: 38000, cost: 24700, margin: 13300, marginRate: 35.0 },
      { client: "Groupe Gamma", totalHT: 31000, cost: 21700, margin: 9300, marginRate: 30.0 },
      { client: "Delta Corp", totalHT: 27000, cost: 23000, margin: 4000, marginRate: 14.8 },
      { client: "Epsilon SARL", totalHT: 18000, cost: 14400, margin: 3600, marginRate: 20.0 },
    ],
    "/clients/avg-order-value": [
      { client: "Société Alpha", orderCount: 24, avgOrderValue: 2167 },
      { client: "Entreprise Beta", orderCount: 18, avgOrderValue: 2111 },
      { client: "Groupe Gamma", orderCount: 15, avgOrderValue: 2067 },
      { client: "Delta Corp", orderCount: 22, avgOrderValue: 1227 },
      { client: "Epsilon SARL", orderCount: 9, avgOrderValue: 2000 },
    ],
  };

  // Try exact match first, then try matching with dynamic params
  if (mocks[endpoint]) return mocks[endpoint] as T[];
  
  // Match dynamic endpoints
  for (const key of Object.keys(mocks)) {
    const pattern = key.replace(/\/\d+/g, '/\\d+');
    if (new RegExp(`^${pattern}$`).test(endpoint)) {
      return mocks[key] as T[];
    }
  }

  return [];
}
