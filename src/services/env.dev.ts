export const API_BASE = "http://localhost:5078/api";
export const FASTAPI = "http://localhost:8000";
export const AUTH_API_BASE =
  (import.meta.env.VITE_AUTH_API_URL as string) || "http://localhost:5084/api";
export const GATEWAY_API_BASE = 
  (import.meta.env.GATEWAY_API_BASE as string) || "http://localhost:5085/api";