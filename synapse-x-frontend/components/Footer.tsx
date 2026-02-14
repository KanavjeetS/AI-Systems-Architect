
import React from 'react';
import { Github, ExternalLink, ShieldCheck } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="glass border-t border-white/10 px-6 py-4 mt-12">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span className="font-orbitron font-bold text-slate-300 tracking-wider">SYNAPSE-X</span>
            <span className="font-mono opacity-50">v1.2.4-STABLE</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-500 bg-[#00FF52]/5 px-2 py-1 rounded border border-[#00FF52]/20">
            <ShieldCheck className="w-3 h-3 text-[#00FF52]" />
            <span className="font-space uppercase tracking-widest text-[#00FF52]/80">Runtime Integrity Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 font-space">
          <a href="#" className="hover:text-[#00AEFF] transition-colors flex items-center gap-1.5">
            <Github className="w-3 h-3" /> GITHUB
          </a>
          <a href="#" className="hover:text-[#00AEFF] transition-colors flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3" /> DOCUMENTATION
          </a>
          <div className="px-3 py-1 bg-white/5 rounded text-[10px] font-orbitron text-[#00FFFF] border border-[#00FFFF]/20">
            HACKATHON BUILD 2025
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
