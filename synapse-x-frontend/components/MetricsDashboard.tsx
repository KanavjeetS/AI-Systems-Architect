
import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MetricsDashboardProps {
  duration?: number;
  mcpCount?: number;
}

const data = [
  { time: '10:00', exec: 24, latency: 12, tasks: 40 },
  { time: '10:05', exec: 45, latency: 15, tasks: 60 },
  { time: '10:10', exec: 32, latency: 45, tasks: 50 },
  { time: '10:15', exec: 58, latency: 30, tasks: 80 },
  { time: '10:20', exec: 75, latency: 25, tasks: 90 },
  { time: '10:25', exec: 68, latency: 50, tasks: 85 },
  { time: '10:30', exec: 92, latency: 42, tasks: 95 },
];

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ duration = 0, mcpCount = 0 }) => {
  return (
    <div className="glass animated-border rounded-2xl p-6 relative flex flex-col gap-4 flex-grow bg-black/95">
      <div className="star-layer"></div>
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-xs font-orbitron text-slate-300 uppercase tracking-widest">NEURAL TELEMETRY</h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00AEFF]"></div>
            <span className="text-[10px] text-slate-500 font-space uppercase tracking-widest">LOAD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#A855F7]"></div>
            <span className="text-[10px] text-slate-500 font-space uppercase tracking-widest">LATENCY</span>
          </div>
        </div>
      </div>

      <div className="relative flex-grow min-h-[140px] w-full min-w-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00AEFF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00AEFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #ffffff20', borderRadius: '8px' }}
              itemStyle={{ fontSize: '10px', fontFamily: 'Orbitron' }}
            />
            <Area
              type="monotone"
              dataKey="exec"
              stroke="#00AEFF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExec)"
              animationDuration={2000}
            />
            <Area
              type="monotone"
              dataKey="latency"
              stroke="#A855F7"
              strokeWidth={2}
              fill="transparent"
              strokeDasharray="5 5"
              animationDuration={3000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-auto relative z-10">
        <div className="bg-black/60 border border-white/5 rounded-lg p-2 group hover:border-[#00FF52]/30 transition-all">
          <div className="text-[8px] text-slate-500 font-orbitron uppercase">Pipeline</div>
          <div className="text-xs font-mono text-[#00FF52]">{duration > 0 ? `${duration.toFixed(1)}s` : '—'}</div>
        </div>
        <div className="bg-black/60 border border-white/5 rounded-lg p-2 group hover:border-[#00AEFF]/30 transition-all">
          <div className="text-[8px] text-slate-500 font-orbitron uppercase">MCP Calls</div>
          <div className="text-xs font-mono text-[#00AEFF]">{mcpCount || '—'}</div>
        </div>
        <div className="bg-black/60 border border-white/5 rounded-lg p-2 group hover:border-[#A855F7]/30 transition-all">
          <div className="text-[8px] text-slate-500 font-orbitron uppercase">Entropy</div>
          <div className="text-xs font-mono text-[#A855F7]">0.002%</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
