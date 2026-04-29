/**
 * API client module.
 * Single source of truth for all backend communication.
 * Every component imports from here instead of calling fetch directly.
 */

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const token = localStorage.getItem('cf_token');
  
  const headers = { 
    "Content-Type": "application/json", 
    ...options.headers 
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  const res = await fetch(url, {
    ...options,
    headers
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
  const res = await request("/export/pdf", {
    method: "POST",
    body: JSON.stringify({ results, responses }),
  });
  return res.blob();
}

export async function chatWithMentor(message, careerContext = null) {
  const res = await request("/chat", {
    method: "POST",
    body: JSON.stringify({ message, career_context: careerContext }),
  });
  return res.json();
}

export async function getSkillTestQuestions(career) {
  const res = await request(`/skill-test-questions?career=${encodeURIComponent(career)}`);
  return res.json();
}

export const analyzeResume = async (resumeData, careerName) => {
  const res = await request("/resume/analyze", {
    method: 'POST',
    body: JSON.stringify({ resume_data: resumeData, career_name: careerName }),
  });
  return res.json();
};

export const exportResumePdf = async (resumeData, careerName) => {
  const res = await request("/resume/export-pdf", {
    method: 'POST',
    body: JSON.stringify({ resume_data: resumeData, career_name: careerName }),
  });
  return res.blob();
};

export const rewriteText = async (text, targetCareer) => {
  const res = await request("/resume-rewrite", {
    method: 'POST',
    body: JSON.stringify({ text, target_career: targetCareer }),
  });
  return res.json();
};
