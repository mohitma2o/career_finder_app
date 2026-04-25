/**
 * API client module.
 * Single source of truth for all backend communication.
 * Every component imports from here instead of calling fetch directly.
 */

const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res;
}

export async function getQuestionnaire() {
  const res = await request("/questionnaire");
  return res.json();
}

export async function predict(responses, topN = 5) {
  const res = await request("/predict", {
    method: "POST",
    body: JSON.stringify({ responses, top_n: topN }),
  });
  return res.json();
}

export async function getCareers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.minSalary) params.set("min_salary", filters.minSalary);
  if (filters.growth) params.set("growth", filters.growth);
  if (filters.sort) params.set("sort", filters.sort);
  const qs = params.toString();
  const res = await request(`/careers${qs ? `?${qs}` : ""}`);
  return res.json();
}

export async function exportPdf(results, responses) {
  const res = await fetch(`${BASE}/export/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ results, responses }),
  });
  if (!res.ok) throw new Error("PDF export failed");
  return res.blob();
}
