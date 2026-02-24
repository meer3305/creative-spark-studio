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

export interface PublishEmailRequest {
  subject: string;
  body: string;
  recipients: string[];
  attachment_url?: string;
  scheduled_time?: string;
}

export interface PublishLinkedInRequest {
  content: string;
  image_url?: string;
  include_model_link: boolean;
  scheduled_time?: string;
}

export interface BulkPublishRequest {
  campaign_name: string;
  channels: string[];
  content: {
    email?: PublishEmailRequest;
    linkedin?: PublishLinkedInRequest;
  };
  scheduled_time?: string;
}

export interface PublishJobStatus {
  status: "queued" | "sending" | "posted" | "completed" | "failed";
  progress: number;
  error?: string;
}

export interface OptimizeRequest {
  content: string;
  tone: string;
  channel: "email" | "linkedin";
}

export interface CampaignAnalytics {
  email?: {
    open_rate: number;
    click_rate: number;
    delivery_rate: number;
  };
  linkedin?: {
    impressions: number;
    likes: number;
    comments: number;
    engagement_score: number;
  };
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

  publishEmail: (body: PublishEmailRequest) =>
    request<{ publish_job_id: string }>("/api/publish/email", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  publishLinkedIn: (body: PublishLinkedInRequest) =>
    request<{ publish_job_id: string }>("/api/publish/linkedin", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  publishBulk: (body: BulkPublishRequest) =>
    request<{ publish_job_id: string }>("/api/publish/bulk", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getPublishStatus: (publishJobId: string) =>
    request<PublishJobStatus>(`/api/publish/status/${publishJobId}`),

  getCampaignAnalytics: (campaignId: string) =>
    request<CampaignAnalytics>(`/api/analytics/${campaignId}`),

  optimize: (body: OptimizeRequest) =>
    request<{ content: string; hashtags?: string[] }>("/api/optimize", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
