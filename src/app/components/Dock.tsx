import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

interface DockProps {
  items: {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }[];
}

const DOCK_ITEM_WIDTH = 56;
const DOCK_MAGNIFICATION = 1.45;
const DOCK_DISTANCE = 140;

// Custom hook for window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

function DockItem({ 
  icon, 
  label, 
  onClick,
  mouseX,
  isLast,
  isMobile,
  baseWidth,
  magnification,
  activeDistance
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  mouseX: MotionValue<number>;
  isLast: boolean;
  isMobile: boolean;
  baseWidth: number;
  magnification: number;
  activeDistance: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  
  const widthSync = useTransform(
    distance, 
    [-activeDistance, -activeDistance / 2, 0, activeDistance / 2, activeDistance], 
    [baseWidth, baseWidth * 1.12, baseWidth * magnification, baseWidth * 1.12, baseWidth]
  );
  
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 220, damping: 21 });
  const scale = useTransform(width, (w) => w / baseWidth);

  return (
    <div className="flex items-center">
      <motion.button
        ref={ref}
        style={{ width }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="aspect-square relative flex items-center justify-center rounded-2xl transition-all duration-300 group hover:z-50"
        whileTap={{ scale: 0.9 }}
      >
        <motion.div 
          className="flex flex-col items-center justify-center relative transition-transform duration-300 group-hover:-translate-y-3"
          style={{
            filter: 'brightness(1.15) drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
            scale,
          }}
          animate={{
            filter: isHovered 
              ? `brightness(1.3) drop-shadow(0 0 ${isMobile ? '8px' : '18px'} rgba(59, 130, 246, 0.7))`
              : 'brightness(1.15) drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
          }}
        >
          {icon}
        </motion.div>
        
        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
            scale: isHovered ? 1 : 0.9,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`absolute ${isMobile ? '-top-12' : '-top-16'} left-1/2 -translate-x-1/2 pointer-events-none z-[100]`}
        >
          <div className={`relative bg-slate-900/95 text-slate-100 ${isMobile ? 'text-[9px] px-2.5 py-1' : 'text-[11px] px-3.5 py-1.5'} rounded-full whitespace-nowrap border border-white/10 shadow-2xl font-bold tracking-tight backdrop-blur-md`}>
            {label}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-2 h-2 bg-slate-900/95 border-r border-b border-white/10 rotate-45" />
          </div>
        </motion.div>
      </motion.button>
      
      {!isMobile && !isLast && (
        <span className="mx-1.5 text-white/10 select-none font-light text-base">|</span>
      )}
    </div>
  );
}

export function Dock({ items }: DockProps) {
  const mouseX = useMotionValue<number>(Infinity);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 640;

  // Responsive dynamic base width so that icons are larger but fit perfectly on mobile screens
  const baseWidth = isMobile 
    ? Math.min(48, Math.max(38, (windowWidth - 48 - (items.length - 1) * 12) / items.length))
    : DOCK_ITEM_WIDTH;

  const magnification = isMobile ? 1.25 : DOCK_MAGNIFICATION;
  const activeDistance = isMobile ? 80 : DOCK_DISTANCE;

  return (
    <div className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 z-50 px-3 w-full max-w-fit flex justify-center">
      {/* Subtle glassmorphism outer glow */}
      <div className="absolute inset-x-4 inset-y-0 -z-10 bg-blue-500/5 blur-3xl rounded-full" />

      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => { mouseX.set(Infinity); }}
        className="flex items-center justify-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3.5 rounded-[24px] border border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.65)] relative"
        style={{
          background: 'rgba(15, 23, 42, 0.45)', // Sleek dark slate glassmorphism
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {items.map((item, index) => (
          <DockItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            mouseX={mouseX}
            isLast={index === items.length - 1}
            isMobile={isMobile}
            baseWidth={baseWidth}
            magnification={magnification}
            activeDistance={activeDistance}
          />
        ))}
      </motion.div>
    </div>
  );
}