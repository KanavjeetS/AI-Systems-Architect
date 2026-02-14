/**
 * SYNAPSE-X — Centralized API Service
 * All backend communication flows through this module.
 */

const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://127.0.0.1:8000";

export interface BackendLogEntry {
  id: string;
  agent: string;
  event: string;
  level: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface MCPServerInfo {
  name: string;
  status: string;
  description: string;
  capabilities: string[];
  icon: string;
  invocations: number;
  last_used: string | null;
}

export interface PipelineResponse {
  pipeline: string;
  prompt: string;
  duration_seconds: number;
  stages: {
    "1_parent_analysis": Record<string, any>;
    "2_dev_agent": Record<string, any>;
    "3_devops_agent": Record<string, any>;
    "4_doctor_healing": Record<string, any>;
    "5_github_push": Record<string, any>;
  };
  mcp_activity: string[];
  logs: BackendLogEntry[];
  metadata: Record<string, any>;
}

/** Trigger the full orchestration pipeline */
export async function runPipeline(prompt: string): Promise<PipelineResponse> {
  const res = await fetch(`${API_BASE_URL}/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`Pipeline failed: HTTP ${res.status}`);
  return res.json();
}

/** Fetch live MCP server registry */
export async function fetchMCPStatus(): Promise<Record<string, MCPServerInfo>> {
  const res = await fetch(`${API_BASE_URL}/mcp/status`);
  if (!res.ok) throw new Error(`MCP status failed: HTTP ${res.status}`);
  return res.json();
}

/** Fetch pipeline logs */
export async function fetchLogs(limit = 50): Promise<BackendLogEntry[]> {
  const res = await fetch(`${API_BASE_URL}/logs?limit=${limit}`);
  if (!res.ok) throw new Error(`Logs fetch failed: HTTP ${res.status}`);
  return res.json();
}

/** Backend health check */
export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`);
  return res.json();
}

export default API_BASE_URL;
