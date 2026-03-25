import { motion } from 'motion/react';

interface AnimatedBackgroundProps {
  luxeMode?: 'midnight' | 'aurora';
}

export function AnimatedBackground({ luxeMode = 'midnight' }: AnimatedBackgroundProps) {
  const isAurora = luxeMode === 'aurora';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-1000">
      {/* Deep Radial Gradient Background */}
      <motion.div 
        className="absolute inset-0"
        initial={false}
        animate={{
          background: isAurora
            ? 'radial-gradient(circle at 50% 50%, #1E1B4B 0%, #0F172A 100%)'
            : 'radial-gradient(circle at 50% 50%, #1E293B 0%, #0F172A 100%)'
        }}
        transition={{ duration: 1.5 }}
      />

      {/* Subtle accent glow orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
        initial={false}
        animate={{
          background: isAurora
            ? 'radial-gradient(circle, #06B6D4 0%, transparent 70%)'
            : 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
          top: isAurora ? '0%' : '-10%',
          left: isAurora ? '50%' : '-10%',
          translateX: isAurora ? '-50%' : '0%',
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
        initial={false}
        animate={{
          background: isAurora
            ? 'radial-gradient(circle, #F43F5E 0%, transparent 70%)'
            : 'radial-gradient(circle, #9333EA 0%, transparent 70%)',
          bottom: isAurora ? '20%' : '10%',
          right: isAurora ? '10%' : '-5%',
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ 
            x: [0, -40, 0], 
            y: [0, -60, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Subtle grid for tech feel */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="tech-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F8FAFC" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-grid)" />
      </svg>
    </div>
  );
}
