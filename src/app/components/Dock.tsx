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
const DOCK_MAGNIFICATION = 1.5;
const DOCK_DISTANCE = 150;

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
  index,
  isLast,
  isMobile
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  mouseX: MotionValue<number>;
  index: number;
  isLast: boolean;
  isMobile: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const baseWidth = isMobile ? 36 : DOCK_ITEM_WIDTH;
  const magnification = isMobile ? 1.25 : DOCK_MAGNIFICATION;
  const activeDistance = isMobile ? 70 : DOCK_DISTANCE;
  
  const widthSync = useTransform(
    distance, 
    [-activeDistance, -activeDistance / 2, 0, activeDistance / 2, activeDistance], 
    [baseWidth, baseWidth * 1.15, baseWidth * magnification, baseWidth * 1.15, baseWidth]
  );
  
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 20 });

  return (
    <div className="flex items-center">
      <motion.button
        ref={ref}
        style={{ width }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="aspect-square relative flex items-center justify-center rounded-xl transition-all duration-300 group hover:z-50"
        whileTap={{ scale: 0.9 }}
      >
        <motion.div 
          className="flex flex-col items-center relative transition-transform duration-300 group-hover:-translate-y-4"
          style={{
            filter: 'brightness(1.2) drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
          }}
          animate={{
            filter: isHovered 
              ? `brightness(1.3) drop-shadow(0 0 ${isMobile ? '6px' : '15px'} rgba(59, 130, 246, 0.6))`
              : 'brightness(1.2) drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
          }}
        >
          {icon}
        </motion.div>
        
        {/* WhatsApp-style Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
            scale: isHovered ? 1 : 0.9,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`absolute ${isMobile ? '-top-10' : '-top-14'} left-1/2 -translate-x-1/2 pointer-events-none z-[100]`}
        >
          <div className={`relative bg-[#1E293B] text-slate-50 ${isMobile ? 'text-[8px] px-2 py-0.5' : 'text-[11px] px-3 py-1.5'} rounded-full whitespace-nowrap border border-white/10 shadow-2xl font-bold tracking-tight`}>
            {label}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-2 h-2 bg-[#1E293B] border-r border-b border-white/10 rotate-45" />
          </div>
        </motion.div>
      </motion.button>
      
      {!isLast && (
        <span className={`mx-0 text-white/10 select-none font-light ${isMobile ? 'text-[8px]' : 'text-base'}`}>|</span>
      )}
    </div>
  );
}

export function Dock({ items }: DockProps) {
  const mouseX = useMotionValue<number>(Infinity);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 640;

  return (
    <div className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 z-50 px-2 w-full max-w-fit">
      {/* Subtle outer glow behind dock */}
      <div className="absolute inset-x-2 inset-y-0 -z-10 bg-blue-500/10 blur-3xl rounded-full" />

      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => { mouseX.set(Infinity); }}
        className="flex items-center gap-0 px-1.5 md:px-3 py-1.5 md:py-3 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] relative"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {items.map((item, index) => (
          <DockItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            mouseX={mouseX}
            index={index}
            isLast={index === items.length - 1}
            isMobile={isMobile}
          />
        ))}
      </motion.div>
    </div>
  );
}