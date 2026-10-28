import React from 'react';

interface AnimatedBackgroundProps {
  luxeMode?: 'midnight' | 'aurora';
}

export function AnimatedBackground({ luxeMode = 'midnight' }: AnimatedBackgroundProps) {
  const isAurora = luxeMode === 'aurora';

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
      style={{ contain: 'strict', transform: 'translateZ(0)' }}
      aria-hidden="true"
    >
      {/* Base background — Cosmos Milky Way: Deep indigo and cosmic purple */}
      <div
        className="absolute inset-0"
        style={{
          background: isAurora
            ? 'linear-gradient(135deg, #020617 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #020617 100%)'
            : 'radial-gradient(circle at 50% 50%, #1E293B 0%, #0F172A 100%)',
          transition: 'background 1.5s ease-in-out',
        }}
      />

      {/* Orb A — Soft Violet Nebula top-center */}
      <div
        className="absolute rounded-full blur-[80px]"
        style={{
          width: 'min(70vw, 560px)',
          aspectRatio: '1',
          opacity: isAurora ? 0.28 : 0.16,
          background: isAurora
            ? 'radial-gradient(circle, #8b5cf6 0%, #4c1d95 60%, transparent 80%)'
            : 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
          top: '-10%',
          left: isAurora ? 'calc(50% - 400px)' : '-10%',
          transition: 'background 1.5s ease-in-out, opacity 1.5s ease-in-out, left 1.5s ease-in-out',
          transform: 'translateZ(0)',
        }}
      />

      {/* Orb B — Cosmic Magenta bottom-right */}
      <div
        className="absolute rounded-full blur-[72px]"
        style={{
          width: 'min(58vw, 460px)',
          aspectRatio: '1',
          opacity: isAurora ? 0.24 : 0.12,
          background: isAurora
            ? 'radial-gradient(circle, #d946ef 0%, #701a75 60%, transparent 80%)'
            : 'radial-gradient(circle, #9333EA 0%, transparent 70%)',
          bottom: '5%',
          right: isAurora ? '5%' : '-5%',
          transition: 'background 1.5s ease-in-out, opacity 1.5s ease-in-out',
          transform: 'translateZ(0)',
        }}
      />

      {/* Orb C — Soft Starlight Gold accent top-right */}
      <div
        className="absolute rounded-full blur-[72px]"
        style={{
          width: 'min(44vw, 360px)',
          aspectRatio: '1',
          opacity: isAurora ? 0.1 : 0,
          background: 'radial-gradient(circle, #fde047 0%, #ca8a04 50%, transparent 80%)',
          top: '5%',
          right: '10%',
          transition: 'opacity 1.5s ease-in-out',
          transform: 'translateZ(0)',
        }}
      />

      {/* Subtle grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: isAurora ? 0.04 : 0.03, transition: 'opacity 1.5s ease-in-out' }}
      >
        <defs>
          <pattern id="tech-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isAurora ? '#6366f1' : '#F8FAFC'} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-grid)" />
      </svg>
    </div>
  );
}
