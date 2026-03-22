import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Intro3DProps {
  onComplete: () => void;
}

export function Intro3D({ onComplete }: Intro3DProps) {
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    if (!soundPlayed) {
      // Play sword swing metal sound effect
      // For a real sword swing sound, replace this URL with your actual sound file
      // Example: const audio = new Audio('/sounds/sword-swing.mp3');
      const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      audio.volume = 0.5;
      
      // Create a more realistic sword swing using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sword swing whoosh sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sword swing characteristics
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
      
      // Volume envelope for swing
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      
      // Metal clang at the end
      setTimeout(() => {
        const clangOsc = audioContext.createOscillator();
        const clangGain = audioContext.createGain();
        const clangFilter = audioContext.createBiquadFilter();
        
        clangOsc.connect(clangFilter);
        clangFilter.connect(clangGain);
        clangGain.connect(audioContext.destination);
        
        clangOsc.type = 'square';
        clangOsc.frequency.setValueAtTime(1200, audioContext.currentTime);
        clangOsc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
        
        clangFilter.type = 'highpass';
        clangFilter.frequency.value = 800;
        
        clangGain.gain.setValueAtTime(0.4, audioContext.currentTime);
        clangGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        clangOsc.start(audioContext.currentTime);
        clangOsc.stop(audioContext.currentTime + 0.2);
      }, 300);
      
      setSoundPlayed(true);
    }

    // Auto complete after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete, soundPlayed]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(10, 10, 15, 1) 50%)',
              'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.15) 0%, rgba(10, 10, 15, 1) 50%)',
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(10, 10, 15, 1) 50%)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Main Logo Animation */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Spinning rings */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border border-white/10 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                opacity: [0, 0.5, 0],
                rotate: 360,
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Center logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [-180, 0],
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
              KN
            </div>
            <motion.div
              className="absolute -inset-4 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.div>
        </div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 text-center"
        >
          <motion.h2
            className="text-2xl text-white font-light tracking-widest mb-4"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            LOADING PORTFOLIO
          </motion.h2>
          
          {/* Progress bar */}
          <div className="w-64 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}