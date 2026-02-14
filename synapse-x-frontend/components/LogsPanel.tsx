
import React, { useRef, useEffect } from 'react';
import { Terminal, Filter, Search } from 'lucide-react';
import { LogEntry } from '../types';

interface LogsPanelProps {
  logs: LogEntry[];
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; // Newest first
    }
  }, [logs]);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'DOCTOR': return 'text-[#00DE94] bg-[#00DE94]/10';
      case 'PARENT': return 'text-[#00AEFF] bg-[#00AEFF]/10';
      case 'CHILD': return 'text-[#00FFFF] bg-[#00FFFF]/10';
      case 'MCP': return 'text-[#A855F7] bg-[#A855F7]/10';
      default: return 'text-slate-400 bg-white/5';
    }
  };

  return (
    <div className="glass animated-border rounded-2xl h-[300px] p-6 relative flex flex-col gap-4 bg-black/95">
      <div className="star-layer"></div>
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center border border-white/10 glow-blue">
            <Terminal className="w-4 h-4 text-[#00AEFF]" />
          </div>
          <div>
            <h3 className="text-xs font-orbitron text-slate-100 uppercase tracking-widest">OBSERVABILITY TERMINAL</h3>
            <div className="text-[8px] font-mono text-slate-500">SESSION_ID: SYN-990-2</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <Search className="w-3 h-3 text-slate-500" />
            <input type="text" placeholder="Filter logs..." className="bg-transparent text-[10px] outline-none text-slate-300 w-24" />
          </div>
          <button className="p-2 rounded-lg hover:bg-white/5 border border-white/5 transition-all">
            <Filter className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-grow overflow-y-auto space-y-1.5 pr-2 custom-scrollbar font-mono text-[11px] relative z-10"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic">
            Awaiting system neural handshake...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4 group hover:bg-white/5 p-1.5 rounded transition-all border-l-2 border-transparent hover:border-[#00AEFF]">
              <span className="text-slate-600 shrink-0 font-bold">[{log.timestamp}]</span>
              <span className={`shrink-0 font-orbitron text-[8px] px-2 py-0.5 rounded uppercase tracking-tighter ${getSourceColor(log.source)}`}>
                {log.source}
              </span>
              <span className={`flex-grow font-space ${log.level === 'ERROR' ? 'text-red-400' :
                  log.level === 'WARN' ? 'text-amber-400' :
                    log.level === 'SUCCESS' ? 'text-[#00FF52]' : 'text-slate-300'
                }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogsPanel;
