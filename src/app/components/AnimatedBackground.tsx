import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#0F172A]">
      {/* Deep Radial Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1E293B 0%, #0F172A 100%)',
        }}
      />

      {/* Subtle accent glow orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
          top: '-10%', left: '-10%',
        }}
        animate={{ 
          x: [0, 50, 0], 
          y: [0, 30, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #9333EA 0%, transparent 70%)',
          bottom: '10%', right: '-5%',
        }}
        animate={{ 
          x: [0, -40, 0], 
          y: [0, -60, 0],
          scale: [1, 1.2, 1] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

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
