const API_BASE = import.meta.env.VITE_API_BASE || "";

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const fetchMeta = () => get("/api/meta");
export const fetchBriefing = (deliveryDate) => get(`/api/briefing/${deliveryDate}`);
export const fetchAccuracy = (from = "2026-01-01", to = "2026-01-31") =>
  get(`/api/accuracy?from=${from}&to=${to}`);
