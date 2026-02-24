// API service layer — all calls go to external backend
// Base URL should be configured per environment

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

export type GenerationMode = "text" | "image" | "voice";

export interface GenerateRequest {
  mode: GenerationMode;
  prompt: string;
  style: string;
  render_preset: string;
  file_url?: string;
}

export interface GenerateResponse {
  job_id: string;
}

export interface JobStatus {
  stage: "parsing" | "generating" | "rendering" | "packaging" | "complete" | "error";
  progress: number; // 0-100
  error?: string;
  project_id?: string;
}

export interface ProjectData {
  id: string;
  model_url: string;
  blend_url: string;
  glb_url: string;
  renders_url: string;
  animation_url?: string;
  marketing: {
    product_description: string;
    instagram_caption: string;
    twitter_thread: string;
    email_draft: string;
  };
}

export interface AnalyticsData {
  engagement: number;
  performance_score: number;
  download_count: number;
  publish_status: string;
  timeline: { date: string; views: number; downloads: number }[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  generate: (body: GenerateRequest) =>
    request<GenerateResponse>("/api/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getStatus: (jobId: string) =>
    request<JobStatus>(`/api/status/${jobId}`),

  getProject: (projectId: string) =>
    request<ProjectData>(`/api/project/${projectId}`),

  getAnalytics: (projectId: string) =>
    request<AnalyticsData>(`/api/analytics/${projectId}`),

  publish: (projectId: string) =>
    request<{ success: boolean }>("/api/publish", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId }),
    }),

  uploadFile: async (file: File): Promise<{ file_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  transcribe: async (audioBlob: Blob): Promise<{ transcript: string }> => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    const res = await fetch(`${API_BASE}/api/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Transcription failed");
    return res.json();
  },

  cancelJob: (jobId: string) =>
    request<{ success: boolean }>(`/api/cancel/${jobId}`, { method: "POST" }),
};
