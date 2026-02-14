
import React, { useState, useEffect } from 'react';
import { SystemStatus, DoctorData } from '../types';
import { ShieldCheck, HeartPulse, Code2, AlertTriangle, Zap, Microscope, Activity } from 'lucide-react';

interface DoctorConsoleProps {
  status: SystemStatus;
  doctorData?: DoctorData | null;
}

const DoctorConsole: React.FC<DoctorConsoleProps> = ({ status, doctorData }) => {
  const isHealing = status === SystemStatus.HEALING;
  const isComplete = status === SystemStatus.COMPLETE;
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isHealing) {
      const interval = setInterval(() => {
        setScanProgress(p => (p < 100 ? p + 2 : 100));
      }, 40);
      return () => clearInterval(interval);
    } else if (isComplete) {
      setScanProgress(100);
    } else {
      setScanProgress(0);
    }
  }, [isHealing, isComplete]);

  const issuesFound = doctorData?.stats?.issues_found ?? 0;
  const issuesHealed = doctorData?.stats?.issues_healed ?? 0;
  const advisoryOnly = doctorData?.stats?.advisory_only ?? 0;

  // Pick first improvement for the diff display
  const firstIssue = doctorData?.issues_detected?.[0];
  const healedSnippet = doctorData?.healed_code?.split('\n').slice(0, 3).join('\n');

  return (
    <div className="glass animated-border rounded-2xl h-full p-6 relative flex flex-col gap-4 bg-black/95">
      <div className="star-layer"></div>

      <div className="flex items-center justify-between z-10 relative">
        <h3 className="text-xs font-orbitron text-[#00DE94] uppercase tracking-widest flex items-center gap-2">
          <Microscope className="w-3.5 h-3.5" /> HEALING PROTOCOL v4.0
        </h3>
        <div className={`flex items-center gap-2 text-[10px] font-mono px-3 py-1 rounded-full border ${isHealing ? 'bg-[#00DE94]/20 text-[#00DE94] border-[#00DE94]/40 animate-pulse' : 'bg-slate-900 text-slate-500 border-white/5'}`}>
          {isHealing ? 'SCANNING_DNA...' : isComplete && doctorData ? 'HEALED' : 'IDLE_WAITING'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 z-10 relative">
        <div className="bg-black/40 border border-white/5 p-2 rounded-lg text-center">
          <div className="text-[8px] text-slate-500 font-orbitron mb-1">ISSUES</div>
          <div className="text-xs font-mono text-[#00FFFF]">{issuesFound}</div>
        </div>
        <div className="bg-black/40 border border-white/5 p-2 rounded-lg text-center">
          <div className="text-[8px] text-slate-500 font-orbitron mb-1">HEALED</div>
          <div className="text-xs font-mono text-[#00FF52]">{issuesHealed}</div>
        </div>
        <div className="bg-black/40 border border-white/5 p-2 rounded-lg text-center">
          <div className="text-[8px] text-slate-500 font-orbitron mb-1">ADVISORY</div>
          <div className="text-xs font-mono text-[#A855F7]">{advisoryOnly}</div>
        </div>
      </div>

      <div className="space-y-3 flex-grow z-10 relative overflow-hidden">
        {/* Code Diff Split View */}
        <div className="bg-[#050505] rounded-xl border border-white/10 h-full flex flex-col overflow-hidden relative group">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-mono text-slate-400">
                {firstIssue ? firstIssue.description?.slice(0, 40) : 'services/auth_orchestrator.ts'}
              </span>
            </div>
            {isHealing && <span className="text-[9px] text-[#00DE94] font-mono animate-pulse">RESOLVING...</span>}
          </div>

          <div className="flex-grow flex flex-col text-[10px] font-mono p-3 space-y-1 overflow-hidden relative">
            {isHealing && (
              <div
                className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00DE94] to-transparent shadow-[0_0_20px_#00DE94] z-50 pointer-events-none transition-all duration-100 ease-linear"
                style={{ top: `${scanProgress}%` }}
              />
            )}

            <div className="text-slate-600 mb-2 opacity-50 font-bold uppercase text-[8px]">
              {firstIssue ? `Severity: ${firstIssue.severity}` : 'Current Genetic Defect'}
            </div>
            <div className="p-2 bg-red-500/5 border border-red-500/10 rounded mb-4">
              <div className="text-red-400/80">- for(let i=0; i&lt;data.length; i++) {'{'}</div>
              <div className="text-red-400/80">-   if(validate(data[i])) results.push(data[i]);</div>
              <div className="text-red-400/80">- {'}'}</div>
            </div>

            <div className="text-[#00DE94] mb-2 opacity-50 font-bold uppercase text-[8px]">Neural Patch Optimization</div>
            <div className={`p-2 bg-[#00DE94]/5 border border-[#00DE94]/20 rounded transition-all duration-1000 ${(isHealing || isComplete) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="text-[#00FF52]">+ const results = data.parallelMap(validate);</div>
              <div className="text-[#00FF52]">+ results.onComplete(stabilizePipeline);</div>
            </div>

            {/* Improvement summary from backend */}
            {isComplete && doctorData?.improvement_summary && doctorData.improvement_summary.length > 0 && (
              <div className="mt-3 space-y-1 border-t border-white/5 pt-2">
                <div className="text-[8px] text-[#00DE94] font-orbitron opacity-60">IMPROVEMENTS APPLIED</div>
                {doctorData.improvement_summary.slice(0, 3).map((imp, i) => (
                  <div key={i} className="text-[9px] text-slate-400 font-space">✓ {imp}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 z-10 relative">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] font-orbitron text-slate-500">
            <span>AUDIT COVERAGE</span>
            <span>{isComplete ? '100' : isHealing ? scanProgress : '0'}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#00DE94] transition-all duration-300" style={{ width: `${isComplete ? 100 : isHealing ? scanProgress : 0}%` }} />
          </div>
        </div>
        <button
          disabled={!isHealing}
          className={`h-full flex items-center justify-center gap-2 rounded-lg font-orbitron text-[10px] font-bold transition-all ${isHealing
              ? 'bg-[#00DE94] hover:brightness-110 text-black shadow-[0_0_15px_rgba(0,222,148,0.5)]'
              : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
            }`}
        >
          <Zap className="w-3 h-3" /> APPLY PATCH
        </button>
      </div>
    </div>
  );
};

export default DoctorConsole;
