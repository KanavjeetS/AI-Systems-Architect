
import React from 'react';
import { SystemStatus } from '../types';
import { PIPELINE_STAGES } from '../constants';
import { CheckCircle2, Clock, AlertCircle, Loader2, Zap } from 'lucide-react';

interface ExecutionPipelineProps {
  status: SystemStatus;
  progress: number;
}

const ExecutionPipeline: React.FC<ExecutionPipelineProps> = ({ status, progress }) => {
  const getStageStatus = (stageId: string) => {
    const stageIndex = PIPELINE_STAGES.findIndex(s => s.id === stageId);
    const currentIndex = PIPELINE_STAGES.findIndex(s => {
      if (status === SystemStatus.IDLE) return false;
      if (status === SystemStatus.ANALYZING) return s.id === 'analysis';
      if (status === SystemStatus.SPAWNING) return s.id === 'spawning';
      if (status === SystemStatus.BUILDING) return s.id === 'build';
      if (status === SystemStatus.DEPLOYING) return s.id === 'deploy';
      if (status === SystemStatus.HEALING) return s.id === 'heal';
      if (status === SystemStatus.COMPLETE) return false;
      return false;
    });

    if (status === SystemStatus.COMPLETE) return 'DONE';
    if (stageIndex < currentIndex) return 'DONE';
    if (stageIndex === currentIndex) return 'ACTIVE';
    return 'PENDING';
  };

  return (
    <div className="glass animated-border rounded-2xl p-6 relative flex flex-col gap-4 bg-black/95">
      <div className="star-layer"></div>
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-xs font-orbitron text-[#00AEFF] uppercase tracking-widest">SYSTEM LIFECYCLE</h3>
        <span className="text-xs font-mono text-[#00FFFF]">{progress}% COMPLETE</span>
      </div>

      <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden z-10">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00AEFF] via-[#00FFFF] to-[#00DE94] shadow-[0_0_15px_rgba(0,174,255,0.6)] transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
        {/* Animated flow effect */}
        <div className="absolute inset-0 bg-white/10 opacity-20 animate-pulse"></div>
      </div>

      <div className="flex flex-col gap-2.5 mt-2 relative z-10">
        {PIPELINE_STAGES.map((stage) => {
          const s = getStageStatus(stage.id);
          const isHealStage = stage.id === 'heal';
          const hasError = isHealStage && status === SystemStatus.HEALING;

          return (
            <div key={stage.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              hasError ? 'border-amber-500/50 bg-amber-500/10' :
              s === 'ACTIVE' ? 'bg-[#00AEFF]/20 border-[#00AEFF]/50 glow-blue' : 
              s === 'DONE' ? 'bg-[#00FF52]/5 border-[#00FF52]/20' : 
              'bg-black/40 border-white/5 opacity-40'
            }`}>
              <div className="flex-shrink-0">
                {s === 'DONE' && <CheckCircle2 className="w-5 h-5 text-[#00FF52]" />}
                {s === 'ACTIVE' && <Loader2 className="w-5 h-5 text-[#00AEFF] animate-spin" />}
                {s === 'PENDING' && <Clock className="w-5 h-5 text-slate-600" />}
              </div>
              <div className="flex-grow">
                <div className={`text-[11px] font-space font-bold tracking-wider ${
                  hasError ? 'text-amber-400' :
                  s === 'ACTIVE' ? 'text-[#00AEFF]' : 
                  s === 'DONE' ? 'text-[#00FF52]' : 'text-slate-500'
                }`}>
                  {stage.label.toUpperCase()}
                </div>
              </div>
              {hasError && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] font-orbitron border border-amber-500/30 rounded">
                  <AlertCircle className="w-2.5 h-2.5" /> ANOMALY DETECTED
                </div>
              )}
              {s === 'DONE' && stage.id === 'heal' && (
                <div className="flex items-center gap-1 text-[#00FF52] text-[8px] font-orbitron">
                  <Zap className="w-2.5 h-2.5" /> HEALED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutionPipeline;
