import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface SwordSlashProps {
  onComplete: () => void;
}

export function SwordSlash({ onComplete }: SwordSlashProps) {
  const [slashComplete, setSlashComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload audio
    audioRef.current = new Audio('/sword-slash.mp3');
    audioRef.current.volume = 0.7;
  }, []);

  const handleSlashComplete = () => {
    setSlashComplete(true);
    
    // Play sword sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
    
    // Wait for split animation then call onComplete
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {/* Initial dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* Sword slash animation */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center will-change-[opacity]"
        initial={{ opacity: 1 }}
        animate={{ opacity: slashComplete ? 0 : 1 }}
        transition={{ duration: 0.3, delay: slashComplete ? 0.8 : 0 }}
      >
        {/* Demon Sword SVG */}
        <motion.div
          className="absolute will-change-transform"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.9)) drop-shadow(0 0 60px rgba(251, 191, 36, 0.7))',
          }}
          initial={{ 
            x: '-150%', 
            y: '150%',
            rotate: -45,
            scale: 1.5
          }}
          animate={{ 
            x: '150%', 
            y: '-150%',
            rotate: -45,
            scale: 1.5
          }}
          transition={{
            duration: 0.6,
            ease: [0.76, 0, 0.24, 1],
          }}
          onAnimationComplete={handleSlashComplete}
        >
          <svg width="600" height="200" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sword Blade with gradient */}
            <defs>
              <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
              <linearGradient id="bladeShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            
            {/* Main blade - elongated for katana style */}
            <path
              d="M 50 100 L 500 100 L 550 95 L 560 100 L 550 105 L 500 100 L 50 100 Z"
              fill="url(#bladeGradient)"
              stroke="#DC2626"
              strokeWidth="2"
            />
            
            {/* Blade edge highlight */}
            <path
              d="M 50 95 L 500 95 L 545 92 L 500 95 L 50 95 Z"
              fill="url(#bladeShine)"
              opacity="0.6"
            />
            
            {/* Blade tip */}
            <path
              d="M 545 95 L 560 100 L 545 105 Z"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="1"
            />
            
            {/* Demonic patterns on blade */}
            <g opacity="0.7">
              <path d="M 200 98 L 220 100 L 200 102 Z" fill="#991B1B" />
              <path d="M 280 98 L 300 100 L 280 102 Z" fill="#991B1B" />
              <path d="M 360 98 L 380 100 L 360 102 Z" fill="#991B1B" />
              <path d="M 440 98 L 460 100 L 440 102 Z" fill="#991B1B" />
            </g>
            
            {/* Guard (tsuba) */}
            <rect
              x="40"
              y="85"
              width="20"
              height="30"
              fill="#1F2937"
              stroke="#F59E0B"
              strokeWidth="2"
              rx="2"
            />
            <circle cx="50" cy="100" r="8" fill="#DC2626" opacity="0.8" />
            
            {/* Handle (tsuka) */}
            <rect
              x="0"
              y="90"
              width="45"
              height="20"
              fill="#1F2937"
              stroke="#6B7280"
              strokeWidth="1"
              rx="3"
            />
            
            {/* Handle wrap pattern */}
            <g stroke="#DC2626" strokeWidth="1.5" opacity="0.6">
              <line x1="5" y1="95" x2="40" y2="95" />
              <line x1="5" y1="100" x2="40" y2="100" />
              <line x1="5" y1="105" x2="40" y2="105" />
            </g>
            
            {/* Pommel */}
            <circle cx="5" cy="100" r="5" fill="#991B1B" stroke="#DC2626" strokeWidth="1" />
            
            {/* Energy aura around blade */}
            <g opacity="0.4">
              <path
                d="M 60 100 L 540 100"
                stroke="#F59E0B"
                strokeWidth="8"
                fill="none"
                filter="blur(4px)"
              />
              <path
                d="M 60 100 L 540 100"
                stroke="#DC2626"
                strokeWidth="12"
                fill="none"
                filter="blur(8px)"
              />
            </g>
          </svg>
        </motion.div>

        {/* Slash trail effect */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, times: [0, 0.5, 1] }}
        >
          {/* Main slash line */}
          <motion.div
            className="absolute w-[200%] h-[4px] bg-gradient-to-r from-transparent via-red-500 to-transparent"
            style={{
              left: '-50%',
              top: '50%',
              transformOrigin: 'center',
              rotate: -45,
              boxShadow: '0 0 20px rgba(239, 68, 68, 1), 0 0 40px rgba(251, 191, 36, 0.8)',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 0.5, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          
          {/* Secondary glow */}
          <motion.div
            className="absolute w-[200%] h-[30px] blur-xl bg-gradient-to-r from-transparent via-orange-500 to-transparent"
            style={{
              left: '-50%',
              top: '50%',
              transformOrigin: 'center',
              rotate: -45,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Energy particles along slash */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full will-change-transform"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              backgroundColor: i % 2 === 0 ? '#EF4444' : '#F59E0B',
              left: '50%',
              top: '50%',
              boxShadow: `0 0 ${Math.random() * 15 + 5}px ${i % 2 === 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(251, 191, 36, 1)'}`,
            }}
            initial={{ 
              x: 0, 
              y: 0,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              x: (Math.random() - 0.5) * 600 - Math.random() * 300,
              y: (Math.random() - 0.5) * 600 - Math.random() * 300,
              opacity: [0, 1, 0],
              scale: [0, Math.random() * 2 + 1, 0]
            }}
            transition={{
              duration: 0.9,
              delay: 0.2 + Math.random() * 0.3,
              ease: 'easeOut'
            }}
          />
        ))}

        {/* Speed lines */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              width: Math.random() * 200 + 100,
              left: '20%',
              top: `${30 + i * 7}%`,
              transformOrigin: 'center',
              rotate: -45,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
          />
        ))}
      </motion.div>

      {/* Screen split effect */}
      <motion.div
        className="absolute inset-0 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: slashComplete ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      >
        {/* Left half */}
        <motion.div
          className="absolute inset-0 bg-black origin-center"
          style={{
            clipPath: 'polygon(0 0, 50% 0, 0 100%, 0 100%)',
          }}
          initial={{ x: 0 }}
          animate={{ x: slashComplete ? '-100%' : 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Edge glow for left side */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[2px]"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(239, 68, 68, 0.8), rgba(251, 191, 36, 0.6))',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(251, 191, 36, 0.5)',
              transform: 'skewY(-45deg)',
              transformOrigin: 'top',
            }}
          />
        </motion.div>

        {/* Right half */}
        <motion.div
          className="absolute inset-0 bg-black origin-center"
          style={{
            clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 0 100%)',
          }}
          initial={{ x: 0 }}
          animate={{ x: slashComplete ? '100%' : 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Edge glow for right side */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-[2px]"
            style={{
              background: 'linear-gradient(to left, transparent, rgba(239, 68, 68, 0.8), rgba(251, 191, 36, 0.6))',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(251, 191, 36, 0.5)',
              transform: 'skewY(-45deg)',
              transformOrigin: 'top',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Flash effect on slash */}
      <motion.div
        className="absolute inset-0 bg-white mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: slashComplete ? [0, 0.4, 0] : 0 }}
        transition={{ duration: 0.3, times: [0, 0.5, 1] }}
      />

      {/* Red/orange screen tint */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-orange-600/20 to-yellow-600/30 mix-blend-screen pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: slashComplete ? [0, 1, 0] : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Radial impact effect */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: slashComplete ? [0, 3] : 0, opacity: slashComplete ? [0, 0.5, 0] : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="w-96 h-96 rounded-full border-4 border-red-500 blur-sm" />
      </motion.div>
    </div>
  );
}
