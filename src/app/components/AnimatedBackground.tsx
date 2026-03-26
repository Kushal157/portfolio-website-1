interface AnimatedBackgroundProps {
  luxeMode?: 'midnight' | 'aurora';
}

export function AnimatedBackground({ luxeMode = 'midnight' }: AnimatedBackgroundProps) {
  const isAurora = luxeMode === 'aurora';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes orb-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(50px, 30px) scale(1.1); }
          66%       { transform: translate(-20px, 50px) scale(0.95); }
        }
        @keyframes orb-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-40px, -60px) scale(1.2); }
          70%       { transform: translate(30px, -20px) scale(0.9); }
        }
        @keyframes orb-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, -40px) scale(1.15); }
        }
        .orb-a { animation: orb-a 20s ease-in-out infinite; }
        .orb-b { animation: orb-b 25s ease-in-out infinite; }
        .orb-c { animation: orb-c 30s ease-in-out infinite; }
      `}</style>

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
        className="orb-a absolute rounded-full blur-[120px]"
        style={{
          width: 800,
          height: 800,
          opacity: isAurora ? 0.35 : 0.2,
          background: isAurora
            ? 'radial-gradient(circle, #8b5cf6 0%, #4c1d95 60%, transparent 80%)'
            : 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
          top: isAurora ? '-10%' : '-10%',
          left: isAurora ? 'calc(50% - 400px)' : '-10%',
          transition: 'background 1.5s ease-in-out, opacity 1.5s ease-in-out, left 1.5s ease-in-out',
        }}
      />

      {/* Orb B — Cosmic Magenta bottom-right */}
      <div
        className="orb-b absolute rounded-full blur-[100px]"
        style={{
          width: 650,
          height: 650,
          opacity: isAurora ? 0.3 : 0.15,
          background: isAurora
            ? 'radial-gradient(circle, #d946ef 0%, #701a75 60%, transparent 80%)'
            : 'radial-gradient(circle, #9333EA 0%, transparent 70%)',
          bottom: '5%',
          right: isAurora ? '5%' : '-5%',
          transition: 'background 1.5s ease-in-out, opacity 1.5s ease-in-out',
        }}
      />

      {/* Orb C — Soft Starlight Gold accent top-right */}
      <div
        className="orb-c absolute rounded-full blur-[100px]"
        style={{
          width: 500,
          height: 500,
          opacity: isAurora ? 0.15 : 0,
          background: 'radial-gradient(circle, #fde047 0%, #ca8a04 50%, transparent 80%)',
          top: '5%',
          right: '10%',
          transition: 'opacity 1.5s ease-in-out',
        }}
      />

      {/* Subtle grid — Silver/Indigo tint */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isAurora ? 0.04 : 0.03, transition: 'opacity 1.5s ease-in-out' }}
      >
        <defs>
          <pattern id="tech-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isAurora ? '#6366f1' : '#F8FAFC'} strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-grid)" />
      </svg>
    </div>
  );
}
