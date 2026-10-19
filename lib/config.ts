export const IS_SERVER = typeof window === "undefined";

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (!IS_SERVER) {
    const origin = window.location.origin;
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return "http://localhost:5000/api/v1";
    }
  }
  return "https://frealanceos-api.onrender.com/api/v1";
}

export const API_BASE_URL = getApiBaseUrl();

export function isMockMode(): boolean {
  const v = process.env.NEXT_PUBLIC_USE_MOCK;
  if (v === "true") return true;
  if (v === "false") return false;
  return false;
}

export const USE_MOCK = isMockMode();
