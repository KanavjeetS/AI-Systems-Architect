
import React from 'react';

interface AuroraProps {
  colorStops: string[];
  amplitude?: number;
  blend?: number;
}

const Aurora: React.FC<AuroraProps> = ({ colorStops, amplitude = 1, blend = 0.5 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20" style={{ zIndex: -1 }}>
      <div 
        className="aurora-blob absolute w-[150%] h-[150%] -top-[25%] -left-[25%]"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${colorStops[0]} 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, ${colorStops[1]} 0%, transparent 50%),
                       radial-gradient(circle at 50% 50%, ${colorStops[2]} 0%, transparent 60%)`,
          opacity: blend,
          transform: `scale(${1 + amplitude * 0.1})`,
        }}
      />
    </div>
  );
};

export default Aurora;
