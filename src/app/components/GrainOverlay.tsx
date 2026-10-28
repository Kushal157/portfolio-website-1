import React from 'react';

export function GrainOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-40 opacity-[0.025]"
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 0.5px, transparent 0.5px)',
        backgroundSize: '4px 4px',
        transform: 'translateZ(0)',
        contain: 'strict',
      }}
      aria-hidden="true"
    />
  );
}
