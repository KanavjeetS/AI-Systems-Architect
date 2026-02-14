
import React, { useState, useEffect, useCallback } from 'react';
import { SystemStatus, LogEntry, AgentNode, DoctorData, DevOpsData } from './types';
import { INITIAL_NODES, EXAMPLE_PROMPTS } from './constants';
import { runPipeline, PipelineResponse } from './services/api';
import Navbar from './components/Navbar';
import PromptConsole from './components/PromptConsole';
import AgentTree from './components/AgentTree';
import ExecutionPipeline from './components/ExecutionPipeline';
import DoctorConsole from './components/DoctorConsole';
import LogsPanel from './components/LogsPanel';
import DeploymentStatus from './components/DeploymentStatus';
import MetricsDashboard from './components/MetricsDashboard';
import MCPPanel from './components/MCPPanel';
import Footer from './components/Footer';
import Aurora from './components/Aurora';

function App() {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.IDLE);
  const [demoMode, setDemoMode] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [nodes, setNodes] = useState<AgentNode[]>(INITIAL_NODES as AgentNode[]);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [devopsData, setDevopsData] = useState<DevOpsData | null>(null);
  const [mcpActivity, setMcpActivity] = useState<string[]>([]);
  const [pipelineDuration, setPipelineDuration] = useState(0);

  const addLog = useCallback((source: LogEntry['source'], message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source,
      message,
      level
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<AgentNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const resetSimulation = () => {
    setStatus(SystemStatus.IDLE);
    setNodes(INITIAL_NODES as AgentNode[]);
    setProgress(0);
    setLogs([]);
    setDoctorData(null);
    setDevopsData(null);
    setMcpActivity([]);
    setPipelineDuration(0);
    addLog('SYSTEM', 'Simulation reset. Awaiting neural seed.', 'INFO');
  };

  const startPipeline = async (prompt: string) => {
    if (status !== SystemStatus.IDLE) return;

    setHistory(prev => [prompt, ...prev].slice(0, 5));
    setDoctorData(null);
    setDevopsData(null);
    setMcpActivity([]);

    // ── Stage 1: Seed received ──
    setStatus(SystemStatus.ANALYZING);
    addLog('SYSTEM', 'Neural pulse received. Connecting to backend…', 'INFO');
    updateNode('seed', { visible: true, status: 'ACTIVE' });
    setProgress(5);

    try {
      // ── Fire real backend call ──
      addLog('SYSTEM', `POST /build → "${prompt.slice(0, 60)}…"`, 'INFO');
      updateNode('seed', { status: 'DONE' });
      setProgress(10);

      setStatus(SystemStatus.SPAWNING);
      updateNode('parent', { visible: true, status: 'ACTIVE' });
      addLog('PARENT', 'Backend orchestrator analyzing prompt…', 'INFO');
      setProgress(15);

      const result: PipelineResponse = await runPipeline(prompt);

      // ── Map backend response to UI state ──
      setPipelineDuration(result.duration_seconds);
      setMcpActivity(result.mcp_activity || []);

      // Parent done
      updateNode('parent', { status: 'DONE' });
      addLog('PARENT', `Analysis complete — engine: ${result.metadata?.engine || 'unknown'}`, 'SUCCESS');
      setProgress(30);

      // ── Stage 2: Children spawn ──
      setStatus(SystemStatus.BUILDING);
      updateNode('child1', { visible: true, status: 'ACTIVE' });
      updateNode('child2', { visible: true, status: 'ACTIVE' });
      addLog('CHILD', `Dev Agent: ${result.stages['2_dev_agent']?.status?.endpoints_created ?? 0} endpoints generated`, 'INFO');
      await new Promise(r => setTimeout(r, 400));

      updateNode('child1', { status: 'DONE' });
      updateNode('child2', { status: 'DONE' });
      addLog('CHILD', 'Code generation complete.', 'SUCCESS');
      setProgress(50);

      // ── Stage 3: DevOps ──
      setStatus(SystemStatus.DEPLOYING);
      updateNode('child3', { visible: true, status: 'ACTIVE' });
      const devops = result.stages['3_devops_agent'];
      if (devops && !devops.skipped) {
        setDevopsData(devops as DevOpsData);
        addLog('CHILD', `DevOps Agent: ${devops.status?.files_generated ?? 0} infra files generated`, 'INFO');
      }
      await new Promise(r => setTimeout(r, 400));
      updateNode('child3', { status: 'DONE' });
      addLog('CHILD', 'Infrastructure locked and loaded.', 'SUCCESS');
      setProgress(70);

      // ── Stage 4: Doctor healing ──
      setStatus(SystemStatus.HEALING);
      updateNode('doctor', { visible: true, status: 'ACTIVE' });
      const doctor = result.stages['4_doctor_healing'];
      if (doctor && !doctor.skipped) {
        setDoctorData(doctor as DoctorData);
        addLog('DOCTOR', `Scan complete: ${doctor.stats?.issues_found ?? 0} issues found, ${doctor.stats?.issues_healed ?? 0} auto-healed`, 'WARN');
        if (doctor.improvement_summary) {
          doctor.improvement_summary.forEach((imp: string) => {
            addLog('DOCTOR', imp, 'SUCCESS');
          });
        }
      }
      await new Promise(r => setTimeout(r, 600));
      updateNode('doctor', { status: 'DONE' });
      setProgress(90);

      // ── MCP activity logs ──
      if (result.mcp_activity) {
        result.mcp_activity.forEach((act: string) => {
          addLog('MCP', act, 'INFO');
        });
      }

      // ── Stage 5: GitHub push ──
      const gh = result.stages['5_github_push'];
      if (gh?.push?.commit?.sha) {
        addLog('MCP', `Git MCP: code pushed → ${gh.push.commit.sha}`, 'SUCCESS');
      }

      setProgress(100);
      setStatus(SystemStatus.COMPLETE);
      addLog('SYSTEM', `Synthesis complete in ${result.duration_seconds}s. Organism stabilized.`, 'SUCCESS');

      // ── Inject backend logs into UI panel ──
      if (result.logs) {
        const backendLogs: LogEntry[] = result.logs.map((l: any) => ({
          id: l.id || Math.random().toString(36).substr(2, 9),
          timestamp: l.timestamp?.split('T')[1]?.split('.')[0] || '',
          source: mapAgentSource(l.agent),
          message: `[${l.event}] ${l.data ? JSON.stringify(l.data).slice(0, 120) : ''}`,
          level: mapLevel(l.level),
        }));
        setLogs(prev => [...backendLogs.reverse(), ...prev].slice(0, 100));
      }

    } catch (err: any) {
      addLog('SYSTEM', `Pipeline error: ${err.message}`, 'ERROR');
      setStatus(SystemStatus.COMPLETE);
      setProgress(100);
      // Mark all visible nodes as done so UI doesn't hang
      nodes.forEach(n => {
        if (n.visible) updateNode(n.id, { status: 'DONE' });
      });
    }
  };

  useEffect(() => {
    if (demoMode && status === SystemStatus.IDLE) {
      startPipeline(EXAMPLE_PROMPTS[0]);
    }
  }, [demoMode, status]);

  return (
    <div className="min-h-screen flex flex-col relative bg-black text-slate-200">
      <Aurora colorStops={["#5227FF", "#00FFFF", "#00AEFF"]} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar demoMode={demoMode} setDemoMode={setDemoMode} />

        <main className="flex-grow px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full space-y-6">
          <PromptConsole
            status={status}
            onStart={startPipeline}
            onReset={resetSimulation}
            history={history}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 h-[550px]">
              <AgentTree nodes={nodes} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ExecutionPipeline status={status} progress={progress} />
              <MetricsDashboard duration={pipelineDuration} mcpCount={mcpActivity.length} />
              <MCPPanel />
            </div>
            <div className="lg:col-span-4 h-[550px]">
              <DoctorConsole status={status} doctorData={doctorData} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <LogsPanel logs={logs} />
            </div>
            <div className="lg:col-span-4">
              <DeploymentStatus status={status} devopsData={devopsData} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function mapAgentSource(agent: string): LogEntry['source'] {
  if (!agent) return 'SYSTEM';
  const a = agent.toLowerCase();
  if (a.includes('parent')) return 'PARENT';
  if (a.includes('dev') || a.includes('child')) return 'CHILD';
  if (a.includes('doctor')) return 'DOCTOR';
  if (a.includes('mcp') || a.includes('git') || a.includes('log') || a.includes('heal') || a.includes('deploy')) return 'MCP';
  return 'SYSTEM';
}

function mapLevel(level: string): LogEntry['level'] {
  if (!level) return 'INFO';
  const l = level.toLowerCase();
  if (l === 'error') return 'ERROR';
  if (l === 'warning' || l === 'warn') return 'WARN';
  if (l === 'success') return 'SUCCESS';
  return 'INFO';
}

export default App;
