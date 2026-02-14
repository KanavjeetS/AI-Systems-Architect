
import React from 'react';
import { AgentNode } from '../types';

interface AgentTreeProps {
  nodes: AgentNode[];
}

/* ── Coordinate map ─────────────────────────────────────────────
   viewBox = 0 0 400 440  (wider padding, taller canvas)
   
       SEED           (200, 55)
         │
      ORCHESTRA        (200, 155)
       / | \
    DEV-α DEV-β DEVOPS (80,275) (200,275) (320,275)
         │
       HEALER          (200, 380)
──────────────────────────────────────────────────────────────── */

const POSITIONS = {
  seed: { x: 200, y: 55 },
  parent: { x: 200, y: 155 },
  child1: { x: 80, y: 275 },
  child2: { x: 200, y: 275 },
  child3: { x: 320, y: 275 },
  doctor: { x: 200, y: 380 },
};

const getNodeFill = (type: string, status: string) => {
  if (status === 'PENDING') return { fill: '#000', stroke: '#334155', glow: 'none' };
  if (status === 'ACTIVE') {
    switch (type) {
      case 'SEED': return { fill: '#000', stroke: '#00FFFF', glow: '0 0 12px #00FFFF' };
      case 'PARENT': return { fill: '#000', stroke: '#00AEFF', glow: '0 0 12px #00AEFF' };
      case 'DOCTOR': return { fill: 'rgba(0,222,148,0.15)', stroke: '#00DE94', glow: '0 0 12px #00DE94' };
      default: return { fill: '#000', stroke: '#00FFFF', glow: '0 0 12px #00FFFF' };
    }
  }
  // DONE
  switch (type) {
    case 'SEED': return { fill: '#00FFFF', stroke: '#fff', glow: '0 0 8px #00FFFF' };
    case 'PARENT': return { fill: '#00AEFF', stroke: '#fff', glow: '0 0 8px #00AEFF' };
    case 'DOCTOR': return { fill: '#00DE94', stroke: '#fff', glow: '0 0 8px #00DE94' };
    case 'CHILD_DEV': return { fill: '#00FFFF', stroke: '#fff', glow: '0 0 6px #00FFFF' };
    case 'CHILD_DEVOPS': return { fill: '#00AEFF', stroke: '#fff', glow: '0 0 6px #00AEFF' };
    default: return { fill: '#00FFFF', stroke: '#fff', glow: 'none' };
  }
};

const AgentTree: React.FC<AgentTreeProps> = ({ nodes }) => {
  const findNode = (id: string) => nodes.find(n => n.id === id);
  const P = POSITIONS;

  return (
    <div className="glass animated-border rounded-2xl h-full w-full p-5 relative flex flex-col bg-black/95">
      <div className="star-layer"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <h3 className="text-xs font-orbitron text-[#00FFFF] uppercase tracking-widest">
          AGENT MESH ORCHESTRATION
        </h3>
        <div className="text-[10px] text-slate-500 font-mono">ST staggered: 800ms</div>
      </div>

      {/* SVG Tree */}
      <div className="flex-grow flex items-center justify-center relative z-10 overflow-hidden">
        <svg
          viewBox="0 0 400 440"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', maxHeight: '420px' }}
        >
          <defs>
            {/* Glow filter */}
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── EDGES ── */}
          <g opacity={0.5}>
            {/* Seed → Parent */}
            {findNode('parent')?.visible && (
              <line
                x1={P.seed.x} y1={P.seed.y + 22}
                x2={P.parent.x} y2={P.parent.y - 22}
                stroke="#00FFFF" strokeWidth="1.5" strokeDasharray="6 3"
              >
                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
              </line>
            )}

            {/* Parent → Children */}
            {findNode('child1')?.visible && (
              <>
                <line
                  x1={P.parent.x} y1={P.parent.y + 22}
                  x2={P.child1.x} y2={P.child1.y - 18}
                  stroke="#00AEFF" strokeWidth="1.2" strokeDasharray="5 3"
                >
                  <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1.8s" repeatCount="indefinite" />
                </line>
                <line
                  x1={P.parent.x} y1={P.parent.y + 22}
                  x2={P.child2.x} y2={P.child2.y - 18}
                  stroke="#00AEFF" strokeWidth="1.2" strokeDasharray="5 3"
                >
                  <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1.8s" repeatCount="indefinite" />
                </line>
                <line
                  x1={P.parent.x} y1={P.parent.y + 22}
                  x2={P.child3.x} y2={P.child3.y - 18}
                  stroke="#00AEFF" strokeWidth="1.2" strokeDasharray="5 3"
                >
                  <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1.8s" repeatCount="indefinite" />
                </line>
              </>
            )}

            {/* Children → Doctor (healing arc) */}
            {findNode('doctor')?.visible && (
              <>
                <line
                  x1={P.child1.x} y1={P.child1.y + 18}
                  x2={P.doctor.x} y2={P.doctor.y - 26}
                  stroke="#00DE94" strokeWidth="1" strokeDasharray="4 4" opacity={0.6}
                />
                <line
                  x1={P.child2.x} y1={P.child2.y + 18}
                  x2={P.doctor.x} y2={P.doctor.y - 26}
                  stroke="#00DE94" strokeWidth="1" strokeDasharray="4 4" opacity={0.6}
                />
                <line
                  x1={P.child3.x} y1={P.child3.y + 18}
                  x2={P.doctor.x} y2={P.doctor.y - 26}
                  stroke="#00DE94" strokeWidth="1" strokeDasharray="4 4" opacity={0.6}
                />
              </>
            )}
          </g>

          {/* ── NODES ── */}

          {/* Seed */}
          {findNode('seed')?.visible && (() => {
            const s = getNodeFill('SEED', findNode('seed')?.status || 'PENDING');
            return (
              <g>
                <circle
                  cx={P.seed.x} cy={P.seed.y} r="22"
                  fill={s.fill} stroke={s.stroke} strokeWidth="2"
                  style={{ filter: s.glow !== 'none' ? 'url(#glow-cyan)' : 'none' }}
                />
                <text
                  x={P.seed.x} y={P.seed.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize="9" fontFamily="Orbitron, sans-serif" fontWeight="700"
                >
                  SEED
                </text>
                {/* Type label below */}
                <text
                  x={P.seed.x} y={P.seed.y + 38}
                  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="Space Grotesk, sans-serif"
                >
                  User Intent
                </text>
              </g>
            );
          })()}

          {/* Parent / Orchestrator */}
          {findNode('parent')?.visible && (() => {
            const s = getNodeFill('PARENT', findNode('parent')?.status || 'PENDING');
            return (
              <g>
                <rect
                  x={P.parent.x - 50} y={P.parent.y - 22}
                  width="100" height="44" rx="8"
                  fill={s.fill} stroke={s.stroke} strokeWidth="2"
                  style={{ filter: s.glow !== 'none' ? 'url(#glow-cyan)' : 'none' }}
                />
                <text
                  x={P.parent.x} y={P.parent.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize="9" fontFamily="Orbitron, sans-serif" fontWeight="700"
                >
                  ORCHESTRATOR
                </text>
                <text
                  x={P.parent.x} y={P.parent.y + 36}
                  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="Space Grotesk, sans-serif"
                >
                  Parent Agent
                </text>
              </g>
            );
          })()}

          {/* Child 1 — Dev Alpha */}
          {findNode('child1')?.visible && (() => {
            const s = getNodeFill('CHILD_DEV', findNode('child1')?.status || 'PENDING');
            return (
              <g>
                <circle
                  cx={P.child1.x} cy={P.child1.y} r="18"
                  fill={s.fill} stroke={s.stroke} strokeWidth="2"
                  style={{ filter: s.glow !== 'none' ? 'url(#glow-cyan)' : 'none' }}
                />
                <text
                  x={P.child1.x} y={P.child1.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize="8" fontFamily="Orbitron, sans-serif" fontWeight="700"
                >
                  DEV α
                </text>
                <text
                  x={P.child1.x} y={P.child1.y + 32}
                  textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="Space Grotesk, sans-serif"
                >
                  Code Gen
                </text>
              </g>
            );
          })()}

          {/* Child 2 — Dev Beta */}
          {findNode('child2')?.visible && (() => {
            const s = getNodeFill('CHILD_DEV', findNode('child2')?.status || 'PENDING');
            return (
              <g>
                <circle
                  cx={P.child2.x} cy={P.child2.y} r="18"
                  fill={s.fill} stroke={s.stroke} strokeWidth="2"
                  style={{ filter: s.glow !== 'none' ? 'url(#glow-cyan)' : 'none' }}
                />
                <text
                  x={P.child2.x} y={P.child2.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize="8" fontFamily="Orbitron, sans-serif" fontWeight="700"
                >
                  DEV β
                </text>
                <text
                  x={P.child2.x} y={P.child2.y + 32}
                  textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="Space Grotesk, sans-serif"
                >
                  Code Gen
                </text>
              </g>
            );
          })()}

          {/* Child 3 — DevOps */}
          {findNode('child3')?.visible && (() => {
            const s = getNodeFill('CHILD_DEVOPS', findNode('child3')?.status || 'PENDING');
            return (
              <g>
                <circle
                  cx={P.child3.x} cy={P.child3.y} r="18"
                  fill={s.fill} stroke={s.stroke} strokeWidth="2"
                  style={{ filter: s.glow !== 'none' ? 'url(#glow-cyan)' : 'none' }}
                />
                <text
                  x={P.child3.x} y={P.child3.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize="8" fontFamily="Orbitron, sans-serif" fontWeight="700"
                >
                  DEVOPS
                </text>
                <text
                  x={P.child3.x} y={P.child3.y + 32}
                  textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="Space Grotesk, sans-serif"
                >
                  Infra
                </text>
              </g>
            );
          })()}

          {/* Doctor / Healer */}
          {findNode('doctor')?.visible && (() => {
            const s = getNodeFill('DOCTOR', findNode('doctor')?.status || 'PENDING');
            return (
              <g>
                {/* Outer orbit ring */}
                <circle
                  cx={P.doctor.x} cy={P.doctor.y} r="32"
                  fill="none" stroke="#00DE94" strokeWidth="0.5" strokeDasharray="3 3" opacity={0.4}
                >
                  <animateTransform
                    attributeName="transform" type="rotate"
                    from={`0 ${P.doctor.x} ${P.doctor.y}`} to={`360 ${P.doctor.x} ${P.doctor.y}`}
                    dur="8s" repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={P.doctor.x} cy={P.doctor.y} r="26"
                  fill={s.fill} stroke={s.stroke} strokeWidth="2.5"
                  style={{ filter: 'url(#glow-green)' }}
                />
                <text
                  x={P.doctor.x} y={P.doctor.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize="9" fontFamily="Orbitron, sans-serif" fontWeight="700"
                >
                  HEALER
                </text>
                <text
                  x={P.doctor.x} y={P.doctor.y + 42}
                  textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="Space Grotesk, sans-serif"
                >
                  Dr. Synapse
                </text>
              </g>
            );
          })()}

          {/* ── IDLE STATE placeholder ── */}
          {!findNode('seed')?.visible && (
            <text
              x="200" y="220"
              textAnchor="middle" dominantBaseline="middle"
              fill="#334155" fontSize="11" fontFamily="Space Grotesk, sans-serif"
            >
              Awaiting neural seed…
            </text>
          )}
        </svg>
      </div>

      {/* Bottom stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 relative z-10">
        <div className="bg-black/60 border border-white/5 p-3 rounded-lg hover:border-[#00FF52]/30 transition-colors">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Synapse Sync</div>
          <div className="text-sm font-mono text-[#00FF52] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF52] animate-pulse"></span>
            STABLE MESH
          </div>
        </div>
        <div className="bg-black/60 border border-white/5 p-3 rounded-lg hover:border-[#00FFFF]/30 transition-colors">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Neural Flow</div>
          <div className="text-sm font-mono text-[#00FFFF]">1.86 PBIT/S</div>
        </div>
      </div>
    </div>
  );
};

export default AgentTree;
