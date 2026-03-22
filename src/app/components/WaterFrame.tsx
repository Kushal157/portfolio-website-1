import React from 'react';
import { motion } from 'motion/react';

interface WaterFrameProps {
  imageUrl: string;
}

export const WaterFrame: React.FC<WaterFrameProps> = ({ imageUrl }) => {
  return (
    <div className="relative flex items-center justify-center w-72 h-72 md:w-96 md:h-96">
      {/* SVG Filters for realistic water displacement */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="water-ripple">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.015 0.02" 
              numOctaves="3" 
              result="noise"
            >
              <animate 
                attributeName="baseFrequency" 
                dur="15s" 
                values="0.015 0.02; 0.02 0.015; 0.015 0.02" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="15" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* Outer Water Glow */}
      <div className="absolute inset-[-20%] bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none mix-blend-screen" />

      {/* Layer 1: Back spinning distortion liquid */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-[6px] border-blue-500/30 rounded-[35%_65%_55%_45%/45%_35%_65%_55%] opacity-60 backdrop-blur-sm"
        style={{ filter: "url(#water-ripple) drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))" }}
      />

      {/* Layer 2: Middle reversed spinning liquid */}
      <motion.div
        animate={{ rotate: -360, scale: [1, 1.02, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[3%] border-[4px] border-cyan-400/40 rounded-[55%_45%_35%_65%/65%_55%_45%_35%] opacity-70"
        style={{ filter: "url(#water-ripple) drop-shadow(0 0 10px rgba(34, 211, 238, 0.4))" }}
      />
      
      {/* Layer 3: Inner tight spinning liquid */}
      <motion.div
        animate={{ rotate: 360, scale: [0.98, 1, 0.98] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[6%] border-[5px] border-[#a5f3fc]/50 rounded-[45%_55%_65%_35%/35%_45%_55%_65%]"
        style={{ filter: "url(#water-ripple) drop-shadow(0 0 20px rgba(165, 243, 252, 0.6))" }}
      />

      {/* Splash accents */}
      <motion.div
        animate={{ rotate: -180, scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-4 rounded-full border border-blue-300/10 pointer-events-none"
      >
        <div className="absolute top-10 left-10 w-3 h-3 bg-cyan-300/80 rounded-full blur-[1px] shadow-[0_0_10px_#67e8f9]" />
        <div className="absolute bottom-12 right-8 w-4 h-4 bg-blue-400/80 rounded-full blur-[2px] shadow-[0_0_15px_#60a5fa]" />
        <div className="absolute top-1/2 -left-2 w-2 h-2 bg-white/60 rounded-full blur-[1px]" />
      </motion.div>

      {/* Central Image Container */}
      <div className="absolute inset-[8%] rounded-full overflow-hidden border-[3px] border-white/20 shadow-[0_0_30px_rgba(34,211,238,0.3)] bg-[#0a0a0f] z-10">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          src={imageUrl}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};
