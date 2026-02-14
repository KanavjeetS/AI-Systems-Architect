
import React from 'react';
import { 
  Zap, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Database, 
  Globe, 
  Server,
  Microscope,
  Github,
  MonitorCheck,
  Workflow
} from 'lucide-react';

export const SYSTEM_MODULES = [
  { id: 'parent', name: 'Parent Core', icon: <Cpu className="w-4 h-4" /> },
  { id: 'mcp', name: 'MCP Gateway', icon: <Globe className="w-4 h-4" /> },
  { id: 'doctor', name: 'Dr. Overseer', icon: <Microscope className="w-4 h-4" /> },
];

export const PIPELINE_STAGES = [
  { id: 'analysis', label: 'Prompt Analysis' },
  { id: 'spawning', label: 'Agent Spawning' },
  { id: 'build', label: 'Build Phase' },
  { id: 'deploy', label: 'Deployment' },
  { id: 'heal', label: 'Self-Healing' },
];

export const INITIAL_NODES = [
  { id: 'seed', type: 'SEED', label: 'User Intent', status: 'PENDING', visible: false },
  { id: 'parent', type: 'PARENT', label: 'Orchestrator', status: 'PENDING', visible: false },
  { id: 'child1', type: 'CHILD_DEV', label: 'Dev Alpha', status: 'PENDING', visible: false },
  { id: 'child2', type: 'CHILD_DEV', label: 'Dev Beta', status: 'PENDING', visible: false },
  { id: 'child3', type: 'CHILD_DEVOPS', label: 'DevOps Node', status: 'PENDING', visible: false },
  { id: 'doctor', type: 'DOCTOR', label: 'Dr. Synapse', status: 'PENDING', visible: false },
];

export const EXAMPLE_PROMPTS = [
  "Build AI SaaS platform with automated subscription billing and user auth",
  "Deploy microservices trading system with low-latency Redis cache",
  "Architect a distributed ETL pipeline with AWS Lambda and Snowflake",
  "Generate a secure multi-tenant CRM dashboard with React and Supabase"
];

export const MCP_SERVICES = [
  { id: 'git', name: 'Git MCP', status: 'CONNECTED', icon: <Github className="w-4 h-4" /> },
  { id: 'logs', name: 'Logs MCP', status: 'ACTIVE', icon: <Terminal className="w-4 h-4" /> },
  { id: 'deploy', name: 'Deployment MCP', status: 'RUNNING', icon: <Workflow className="w-4 h-4" /> }
];
