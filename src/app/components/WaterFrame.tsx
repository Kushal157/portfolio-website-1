import React from 'react';
import { motion } from 'motion/react';

interface WaterFrameProps {
  imageUrl: string;
}

export const WaterFrame: React.FC<WaterFrameProps> = ({ imageUrl }) => {
  return (
    <div className="relative flex items-center justify-center w-72 h-72 md:w-96 md:h-96 select-none">
      {/* Outer Water Glow */}
      <div className="absolute inset-[-15%] bg-gradient-to-br from-blue-500/20 via-cyan-400/20 to-purple-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Layer 1: Back spinning distortion liquid - hardware accelerated CSS keyframes */}
      <div
        className="absolute inset-0 border-[5px] border-blue-500/40 rounded-[38%_62%_55%_45%/45%_38%_62%_55%] animate-[spin_18s_linear_infinite] will-change-transform pointer-events-none shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Layer 2: Middle counter-spinning liquid */}
      <div
        className="absolute inset-[3%] border-[4px] border-cyan-400/45 rounded-[55%_45%_38%_62%/62%_55%_45%_38%] animate-[spin_14s_linear_infinite_reverse] will-change-transform pointer-events-none shadow-[0_0_16px_rgba(34,211,238,0.25)]"
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Layer 3: Inner tight spinning liquid */}
      <div
        className="absolute inset-[6%] border-[3px] border-[#a5f3fc]/50 rounded-[45%_55%_62%_38%/38%_45%_55%_62%] animate-[spin_10s_linear_infinite] will-change-transform pointer-events-none shadow-[0_0_20px_rgba(165,243,252,0.3)]"
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Central Image Container */}
      <div className="absolute inset-[8%] rounded-full overflow-hidden border-[3px] border-white/20 shadow-[0_0_30px_rgba(34,211,238,0.25)] bg-[#0a0a0f] z-10 will-change-transform">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          src={imageUrl}
          alt="Hero"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center will-change-transform"
        />
      </div>
    </div>
  );
};
