import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';

export function CursorFollower() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if device has a fine pointer (like a mouse) and screen is wide enough
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isWideScreen = window.innerWidth > 768;
    
    if (!hasFinePointer || !isWideScreen) {
      setIsDesktop(false);
      document.body.style.cursor = 'auto';
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);
    document.body.style.cursor = 'none';

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsDesktop(false);
        document.body.style.cursor = 'auto';
      } else if (window.matchMedia('(pointer: fine)').matches) {
        setIsDesktop(true);
        document.body.style.cursor = 'none';
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('resize', handleResize);
      document.body.style.cursor = 'auto';
    };
  }, [cursorX, cursorY]);

  if (!isMounted || !isDesktop) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: cursorX,
        top: cursorY,
        x: '-50%',
        y: '-50%',
      }}
    >
      {/* Mini Groot Cursor SVG */}
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-15deg)', transformOrigin: 'center' }}>
        <defs>
          <filter id="grootShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.4"/>
          </filter>
        </defs>
        <g filter="url(#grootShadow)">
          {/* Head base */}
          <path d="M 16 22 L 14 10 L 19 15 L 24 6 L 29 16 L 35 12 L 32 22 Q 32 40 28 42 L 20 42 Q 16 40 16 22 Z" fill="#A0522D" stroke="#5C3A21" strokeWidth="1.5" strokeLinejoin="round"/>
          
          {/* Texture lines */}
          <path d="M 19 22 L 19 38 M 24 16 L 24 38 M 29 24 L 29 36" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          
          {/* Leaves */}
          <path d="M 23 6 Q 26 2 28 6 Q 25 8 23 6 Z" fill="#4CAF50" />
          <path d="M 14 10 Q 11 8 12 12 Q 15 13 14 10 Z" fill="#4CAF50" />
          <path d="M 35 12 Q 39 10 38 14 Q 34 14 35 12 Z" fill="#8BC34A" />
          
          {/* Eyes */}
          <circle cx="20" cy="28" r="3.5" fill="#1A1A1A" />
          <circle cx="28" cy="28" r="3.5" fill="#1A1A1A" />
          
          {/* Eye catchlights (cute reflection) */}
          <circle cx="21" cy="27" r="1.5" fill="#FFFFFF" />
          <circle cx="29" cy="27" r="1.5" fill="#FFFFFF" />
          <circle cx="19" cy="29" r="0.5" fill="#FFFFFF" />
          <circle cx="27" cy="29" r="0.5" fill="#FFFFFF" />
          
          {/* Smile */}
          <path d="M 22 34 Q 24 36.5 26 34" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>
      </svg>
    </motion.div>
  );
}
