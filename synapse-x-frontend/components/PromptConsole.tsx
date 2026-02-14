
import React, { useState, useEffect } from 'react';
import { Zap, RotateCcw, Play, History, ChevronDown, Sparkles } from 'lucide-react';
import { SystemStatus } from '../types';
import { EXAMPLE_PROMPTS } from '../constants';

interface PromptConsoleProps {
  status: SystemStatus;
  onStart: (p: string) => void;
  onReset: () => void;
  history: string[];
}

const PromptConsole: React.FC<PromptConsoleProps> = ({ status, onStart, onReset, history }) => {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPTS[0]);
  const [showHistory, setShowHistory] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const isRunning = status !== SystemStatus.IDLE && status !== SystemStatus.COMPLETE;

  useEffect(() => {
    let currentText = '';
    const statusMap: Record<string, string> = {
      [SystemStatus.ANALYZING]: 'Analyzing Neural Seed...',
      [SystemStatus.SPAWNING]: 'Spawning Child Organisms...',
      [SystemStatus.BUILDING]: 'Building System Infrastructure...',
      [SystemStatus.DEPLOYING]: 'Deploying Final Build...',
      [SystemStatus.HEALING]: 'Auditing System Integrity...',
      [SystemStatus.COMPLETE]: 'Synthesis Complete.',
      [SystemStatus.IDLE]: 'Awaiting Command...'
    };
    
    const target = statusMap[status] || '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < target.length) {
        currentText += target[i];
        setDisplayText(currentText);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="glass animated-border rounded-2xl p-6 relative bg-black/90 group z-30">
      <div className="star-layer"></div>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00AEFF] to-transparent z-10"></div>
      
      <div className="flex flex-col gap-4 relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-orbitron text-[#00FFFF] uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3" /> COMMAND INTERFACE
            </h3>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="text-[10px] font-mono text-[#00AEFF] typing-cursor">{displayText}</div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 rounded hover:bg-white/5 border border-white/5 text-slate-500 transition-colors"
              title="Prompt History"
            >
              <History className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPrompt(EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)])}
              className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-orbitron bg-white/5 border border-white/10 rounded-full hover:border-[#00FFFF]/50 transition-all text-slate-400"
            >
              <Sparkles className="w-3 h-3 text-[#00FFFF]" /> EXAMPLES
            </button>
          </div>
        </div>

        {showHistory && history.length > 0 && (
          <div className="absolute top-12 right-6 w-80 bg-black border border-white/10 rounded-xl p-2 z-50 shadow-2xl backdrop-blur-xl">
            {history.map((h, i) => (
              <button 
                key={i} 
                onClick={() => { setPrompt(h); setShowHistory(false); }}
                className="w-full text-left p-2 hover:bg-white/5 rounded text-[10px] text-slate-400 font-space truncate border-b border-white/5 last:border-0"
              >
                {h}
              </button>
            ))}
          </div>
        )}

        <div className="relative group/input">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isRunning}
            placeholder="Describe the system you want SYNAPSE-X to build..."
            className="w-full h-24 bg-black/80 border border-white/10 rounded-xl p-4 text-[#00FFFF] font-space resize-none focus:outline-none focus:border-[#00AEFF] focus:ring-1 focus:ring-[#00AEFF]/20 transition-all placeholder:text-slate-700 relative z-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => onStart(prompt)}
            disabled={isRunning}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#00AEFF] hover:bg-[#00FFFF] disabled:opacity-50 disabled:cursor-not-allowed px-10 py-3 rounded-lg font-orbitron text-sm font-bold tracking-tight transition-all text-black glow-blue transform active:scale-95"
          >
            {isRunning ? 'SYNTHESIZING...' : 'START SYSTEM PIPELINE'}
          </button>

          <button 
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#00DE94]/30 hover:bg-[#00DE94]/10 font-orbitron text-xs font-bold transition-all text-[#00DE94]"
          >
            <RotateCcw className="w-4 h-4" /> RESET
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptConsole;
