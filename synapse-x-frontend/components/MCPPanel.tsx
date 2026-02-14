
import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchMCPStatus, MCPServerInfo } from '../services/api';

const ICON_MAP: Record<string, string> = {
  git_mcp: '🐙',
  logs_mcp: '📊',
  deployment_mcp: '☁️',
  healing_mcp: '💉',
};

const MCPPanel: React.FC = () => {
  const [servers, setServers] = useState<Record<string, MCPServerInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    try {
      const data = await fetchMCPStatus();
      setServers(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const entries = Object.entries(servers);

  return (
    <div className="glass animated-border rounded-2xl p-5 bg-black/95 group">
      <div className="star-layer"></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-xs font-orbitron text-[#A855F7] uppercase tracking-widest flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" /> MCP ORCHESTRATION
        </h3>
        <div className="flex items-center gap-2">
          {error && <span className="text-[8px] text-red-400 font-mono">OFFLINE</span>}
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-[#00FF52] shadow-[0_0_8px_#00FF52]'} animate-pulse`}></div>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center py-4 text-slate-600 text-[10px] font-mono">
            <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> Connecting to MCP registry…
          </div>
        ) : entries.length > 0 ? (
          entries.map(([key, mcp]) => (
            <div key={key} className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/5 group-hover:border-[#A855F7]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-black text-[#A855F7] border border-[#A855F7]/20 text-sm">
                  {ICON_MAP[key] || '🔧'}
                </div>
                <div>
                  <span className="text-[10px] font-space font-bold text-slate-300 block">{mcp.name}</span>
                  <span className="text-[8px] font-mono text-slate-600">{mcp.invocations} calls</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#00FF52] opacity-70 tracking-tighter uppercase">{mcp.status}</span>
                <ShieldCheck className="w-3 h-3 text-[#00FF52]" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-[10px] text-slate-600 font-mono text-center py-2">No MCP servers found</div>
        )}
      </div>
    </div>
  );
};

export default MCPPanel;
