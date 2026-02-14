
import React from 'react';
import { Activity, ShieldCheck, Cpu, User, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface NavbarProps {
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ demoMode, setDemoMode }) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-3 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00AEFF] to-[#00FFFF] flex items-center justify-center glow-blue transition-transform group-hover:rotate-12">
          <span className="font-orbitron font-black text-xl text-black">S</span>
        </div>
        <div>
          <h1 className="font-orbitron text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#00AEFF] to-[#00FFFF]">
            SYNAPSE-X
          </h1>
          <div className="flex items-center gap-2 text-[9px] text-[#00AEFF] font-orbitron uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF52] animate-pulse"></span>
            NEURAL ENGINE ACTIVE
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-2 text-slate-400 hover:text-[#00AEFF] transition-all cursor-pointer group">
          <Cpu className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-orbitron tracking-widest">MCP GATEWAY</span>
          <span className="text-[10px] bg-[#00FF52]/10 text-[#00FF52] px-2 py-0.5 rounded-full border border-[#00FF52]/20 font-bold">STABLE</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 group cursor-default">
          <Activity className="w-4 h-4 group-hover:text-[#00FFFF] transition-colors" />
          <span className="text-xs font-orbitron tracking-widest">MODEL: GEMINI 3 FLASH</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setDemoMode(!demoMode)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-[10px] font-orbitron tracking-widest ${
            demoMode ? 'bg-[#00FFFF]/20 border-[#00FFFF]/50 text-[#00FFFF] glow-cyan' : 'bg-white/5 border-white/10 text-slate-400 hover:border-[#00FFFF]/30'
          }`}
        >
          {demoMode ? <ToggleRight className="text-[#00FFFF] w-4 h-4" /> : <ToggleLeft className="text-slate-400 w-4 h-4" />}
          DEMO MODE
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-orbitron font-bold text-slate-200">ADMIN_SYNAPSE</div>
            <div className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">Level 4 Access</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00AEFF]/20 to-transparent border border-white/20 flex items-center justify-center overflow-hidden hover:scale-110 transition-transform cursor-pointer">
            <User className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
