
export enum SystemStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SPAWNING = 'SPAWNING',
  BUILDING = 'BUILDING',
  DEPLOYING = 'DEPLOYING',
  HEALING = 'HEALING',
  COMPLETE = 'COMPLETE'
}

export interface AgentNode {
  id: string;
  type: 'SEED' | 'PARENT' | 'CHILD_DEV' | 'CHILD_DEVOPS' | 'DOCTOR';
  label: string;
  status: 'PENDING' | 'ACTIVE' | 'DONE' | 'ERROR';
  children?: string[];
  role?: string;
  visible?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'PARENT' | 'CHILD' | 'DOCTOR' | 'MCP';
  message: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
}

export interface MetricData {
  time: string;
  execution: number;
  healing: number;
  tasks: number;
}

export interface DeploymentUnit {
  name: string;
  status: 'UP' | 'DOWN' | 'SCALING' | 'PENDING';
  uptime: string;
  latency: number;
}

export interface MCPService {
  name: string;
  status: 'CONNECTED' | 'ACTIVE' | 'RUNNING' | 'OFFLINE';
  id: string;
  icon?: React.ReactNode;
  invocations?: number;
}

export interface DoctorData {
  issues_detected: Array<{ id: string; severity: string; description: string }>;
  healed_code: string;
  improvement_summary: string[];
  stats: { issues_found: number; issues_healed: number; advisory_only: number };
}

export interface DevOpsData {
  dockerfile: string;
  deployment_script: string;
  ci_config: string;
  infra_metadata: {
    container_runtime: string;
    ci_provider: string;
    exposed_port: number;
  };
  status: { files_generated: number };
}
