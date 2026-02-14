
import React from 'react';
import { Server, Database, Cloud, Network, Activity, ShieldCheck, CheckCircle } from 'lucide-react';
import { SystemStatus, DevOpsData } from '../types';

interface DeploymentStatusProps {
  status: SystemStatus;
  devopsData?: DevOpsData | null;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ status, devopsData }) => {
  const isComplete = status === SystemStatus.COMPLETE;
  const isDeploying = status === SystemStatus.DEPLOYING;

  const containerRuntime = devopsData?.infra_metadata?.container_runtime || 'Docker';
  const ciProvider = devopsData?.infra_metadata?.ci_provider || 'GitHub Actions';
  const exposedPort = devopsData?.infra_metadata?.exposed_port || 8080;
  const filesGenerated = devopsData?.status?.files_generated || 0;

  const services = [
    { name: 'API GATEWAY', icon: <Network className="w-4 h-4" />, status: isComplete ? 'UP' : isDeploying ? 'PENDING' : 'OFFLINE' },
    { name: containerRuntime.toUpperCase(), icon: <Server className="w-4 h-4" />, status: isComplete ? 'UP' : isDeploying ? 'PENDING' : 'OFFLINE' },
    { name: ciProvider.toUpperCase().slice(0, 14), icon: <Database className="w-4 h-4" />, status: isComplete ? 'UP' : 'OFFLINE' },
    { name: `PORT ${exposedPort}`, icon: <Activity className="w-4 h-4" />, status: isComplete ? 'UP' : 'OFFLINE' },
  ];

  return (
    <div className="glass animated-border rounded-2xl h-[300px] p-6 relative flex flex-col gap-4 bg-black/95">
      <div className="star-layer"></div>
      <div className="flex items-center justify-between z-10 relative">
        <h3 className="text-xs font-orbitron text-[#00FF52] uppercase tracking-widest mb-1">DEPLOYMENT STATUS</h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#00FF52]/10 border border-[#00FF52]/30 rounded text-[8px] text-[#00FF52] font-orbitron">
          <ShieldCheck className="w-3 h-3" /> {isComplete ? `${filesGenerated} FILES` : 'CI/CD SECURE'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        {services.map((svc) => (
          <div key={svc.name} className={`p-3 rounded-xl flex flex-col gap-2 relative overflow-hidden transition-all duration-500 border ${svc.status === 'UP' ? 'bg-[#00FF52]/5 border-[#00FF52]/30 glow-green' :
              svc.status === 'PENDING' ? 'bg-amber-500/5 border-amber-500/30' : 'bg-black border-white/5'
            }`}>
            <div className="flex items-center justify-between">
              <div className={`p-1.5 rounded-lg border transition-colors ${svc.status === 'UP' ? 'bg-[#00FF52]/20 border-[#00FF52]/40 text-[#00FF52]' : 'bg-black border-white/10 text-slate-500'}`}>
                {svc.icon}
              </div>
              <div className={`w-2 h-2 rounded-full ${svc.status === 'UP' ? 'bg-[#00FF52] shadow-[0_0_10px_#00FF52] animate-pulse' :
                  svc.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'
                }`}></div>
            </div>
            <div>
              <div className="text-[9px] font-orbitron text-slate-400 uppercase tracking-tighter">{svc.name}</div>
              <div className={`text-[10px] font-mono font-bold ${svc.status === 'UP' ? 'text-[#00FF52]' :
                  svc.status === 'PENDING' ? 'text-amber-400' : 'text-slate-600'
                }`}>
                {svc.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3 border-t border-white/10 relative z-10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 font-orbitron tracking-widest">GLOBAL UPTIME</span>
          <span className="text-xs font-mono text-[#00FF52] flex items-center gap-1">
            99.999% <CheckCircle className="w-2.5 h-2.5" />
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-slate-500 font-orbitron tracking-widest">NETWORK LATENCY</span>
          <span className="text-xs font-mono text-[#00AEFF]">14ms</span>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStatus;
