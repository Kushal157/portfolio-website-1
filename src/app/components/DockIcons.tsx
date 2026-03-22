import { useState } from 'react';
import { motion } from 'motion/react';

export function LinkedInOcto() {
  return (
    <motion.div
      className="relative w-12 h-12"
      whileHover={{ scale: 1.1 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Official LinkedIn Icon */}
        <motion.rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="12"
          fill="#0A66C2"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glow effect */}
        <motion.rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="12"
          fill="none"
          stroke="#0A66C2"
          strokeWidth="3"
          opacity="0.5"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        
        {/* "in" text */}
        <motion.text
          x="50"
          y="68"
          fontSize="48"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          animate={{
            y: [68, 66, 68],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          in
        </motion.text>
        
        {/* Particle effects */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            r="2"
            fill="#0A66C2"
            opacity="0.6"
            animate={{
              cx: [20 + i * 30, 20 + i * 30 + 10, 20 + i * 30],
              cy: [20, 10, 20],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

export function GitHubOcto() {
  return (
    <motion.div
      className="relative w-12 h-12"
      whileHover={{ scale: 1.1 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="#24292e"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#24292e"
          strokeWidth="2"
          opacity="0.4"
          animate={{
            r: [40, 45, 40],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        
        {/* GitHub Logo - Official Octocat silhouette */}
        <motion.path
          d="M 50 25 C 36 25 25 36 25 50 C 25 61 32 70 42 73 C 43 73 44 72 44 71 L 44 67 C 40 68 39 65 39 65 C 38 63 37 62 37 62 C 35 60 37 60 37 60 C 39 60 40 62 40 62 C 42 65 45 64 46 63 C 46 62 47 61 48 60 C 42 59 36 57 36 48 C 36 45 37 43 39 41 C 39 40 38 38 39 35 C 39 35 41 34 44 36 C 45 36 47 35 50 35 C 53 35 55 36 56 36 C 59 34 61 35 61 35 C 62 38 61 40 61 41 C 63 43 64 45 64 48 C 64 57 58 59 52 60 C 53 61 54 62 54 64 L 54 71 C 54 72 55 73 56 73 C 66 70 75 61 75 50 C 75 36 64 25 50 25 Z"
          fill="white"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Code symbols floating around */}
        <motion.text
          x="15"
          y="30"
          fontSize="12"
          fill="white"
          opacity="0.5"
          fontFamily="monospace"
          animate={{
            y: [30, 25, 30],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {'</>'}
        </motion.text>
        
        <motion.text
          x="72"
          y="70"
          fontSize="12"
          fill="white"
          opacity="0.5"
          fontFamily="monospace"
          animate={{
            y: [70, 65, 70],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            delay: 0.5,
            repeat: Infinity,
          }}
        >
          {'{}'}
        </motion.text>
      </svg>
    </motion.div>
  );
}

export function ProjectsOcto() {
  return (
    <motion.div
      className="relative w-12 h-12"
      whileHover={{ scale: 1.1 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="#f59e0b"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          opacity="0.4"
          animate={{
            r: [40, 45, 40],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        
        {/* Folder icon */}
        <motion.g
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Folder tab */}
          <path
            d="M 30 38 L 30 32 L 48 32 L 52 38 Z"
            fill="white"
            opacity="0.9"
          />
          {/* Folder body */}
          <rect
            x="30"
            y="38"
            width="40"
            height="28"
            rx="2"
            fill="white"
            opacity="0.9"
          />
          
          {/* Files inside */}
          <motion.g
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <rect x="36" y="44" width="12" height="16" rx="1" fill="#f59e0b" opacity="0.5" />
            <rect x="50" y="44" width="12" height="16" rx="1" fill="#f59e0b" opacity="0.5" />
          </motion.g>
        </motion.g>
        
        {/* Sparkles */}
        {[0, 1, 2].map((i) => (
          <motion.g
            key={i}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
            }}
          >
            <path
              d={`M ${70 + i * 5} ${25 + i * 10} L ${71 + i * 5} ${27 + i * 10} L ${72 + i * 5} ${25 + i * 10} L ${71 + i * 5} ${23 + i * 10} Z`}
              fill="white"
            />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
}

export function AboutOcto() {
  return (
    <motion.div
      className="relative w-12 h-12"
      whileHover={{ scale: 1.1 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="#8b5cf6"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          opacity="0.4"
          animate={{
            r: [40, 45, 40],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        
        {/* User icon - Official style */}
        <motion.g
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Head */}
          <circle
            cx="50"
            cy="40"
            r="12"
            fill="white"
            opacity="0.95"
          />
          
          {/* Body/Shoulders */}
          <path
            d="M 30 70 Q 30 55 50 55 Q 70 55 70 70 Z"
            fill="white"
            opacity="0.95"
          />
        </motion.g>
        
        {/* Pulse rings */}
        {[0, 1].map((i) => (
          <motion.circle
            key={i}
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0"
            animate={{
              r: [20, 35, 45],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 1.25,
              repeat: Infinity,
            }}
          />
        ))}
        
        {/* Floating dots */}
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            r="2"
            fill="white"
            opacity="0.6"
            animate={{
              cx: [50 + Math.cos(i * Math.PI / 2) * 30, 50 + Math.cos(i * Math.PI / 2) * 35, 50 + Math.cos(i * Math.PI / 2) * 30],
              cy: [50 + Math.sin(i * Math.PI / 2) * 30, 50 + Math.sin(i * Math.PI / 2) * 35, 50 + Math.sin(i * Math.PI / 2) * 30],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

export function ContactOcto() {
  return (
    <motion.div
      className="relative w-12 h-12"
      whileHover={{ scale: 1.1 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="#ec4899"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#ec4899"
          strokeWidth="2"
          opacity="0.4"
          animate={{
            r: [40, 45, 40],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        
        {/* Mail envelope - Official style */}
        <motion.g
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Envelope body */}
          <rect
            x="28"
            y="38"
            width="44"
            height="30"
            rx="2"
            fill="white"
            opacity="0.95"
          />
          
          {/* Envelope flap back */}
          <path
            d="M 28 38 L 50 54 L 72 38"
            fill="none"
            stroke="#ec4899"
            strokeWidth="2"
            opacity="0.3"
          />
          
          {/* Envelope flap front */}
          <motion.path
            d="M 28 38 L 50 54 L 72 38"
            fill="none"
            stroke="#ec4899"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{
              strokeDasharray: ["0, 100", "100, 0", "0, 100"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
        </motion.g>
        
        {/* Flying message indicator */}
        <motion.g
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <circle cx="70" cy="30" r="4" fill="white" />
          <circle cx="74" cy="28" r="3" fill="white" opacity="0.7" />
          <circle cx="78" cy="26" r="2" fill="white" opacity="0.5" />
        </motion.g>
        
        {/* Notification badge */}
        <motion.circle
          cx="68"
          cy="60"
          r="8"
          fill="#10b981"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
        <motion.text
          x="68"
          y="64"
          fontSize="10"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          1
        </motion.text>
      </svg>
    </motion.div>
  );
}

export function UserOcto({ onSwordClick }: { onSwordClick?: () => void }) {
  const [showSword, setShowSword] = useState(false);

  return (
    <motion.div
      className="relative w-12 h-12 flex items-center justify-center cursor-pointer"
      whileHover={{ scale: 1.1 }}
      onMouseEnter={() => setShowSword(true)}
      onMouseLeave={() => setShowSword(false)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="#10b981"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          opacity="0.4"
          animate={{
            r: [40, 45, 40],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        
        {/* User icon */}
        <motion.g
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Head */}
          <circle
            cx="50"
            cy="40"
            r="12"
            fill="white"
            opacity="0.95"
          />
          {/* Body */}
          <path
            d="M 30 70 Q 30 55 50 55 Q 70 55 70 70 Z"
            fill="white"
            opacity="0.95"
          />
        </motion.g>
      </svg>
      
      {showSword && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: -30 }}
          className="absolute -top-6 -right-2 cursor-pointer z-50 p-2 bg-black/80 rounded-full border border-white/20 hover:bg-black transition-colors shadow-lg shadow-black/50 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onSwordClick) onSwordClick();
          }}
        >
          {/* Small Sword Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path>
            <path d="M13 19l6-6"></path>
            <path d="M16 16l4 4"></path>
            <path d="M19 21l2-2"></path>
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}