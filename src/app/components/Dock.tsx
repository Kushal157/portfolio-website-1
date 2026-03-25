import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'motion/react';
import { useRef } from 'react';

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

// Responsive dock item width
const getDockItemWidth = () => {
  if (typeof window === 'undefined') return DOCK_ITEM_WIDTH;
  return window.innerWidth < 640 ? 44 : DOCK_ITEM_WIDTH;
};

function DockItem({ 
  icon, 
  label, 
  onClick,
  mouseX,
  index,
  isLast
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  mouseX: MotionValue<number>;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const baseWidth = getDockItemWidth();
  
  const widthSync = useTransform(
    distance, 
    [-DOCK_DISTANCE, -DOCK_DISTANCE / 2, 0, DOCK_DISTANCE / 2, DOCK_DISTANCE], 
    [baseWidth, baseWidth * 1.25, baseWidth * DOCK_MAGNIFICATION, baseWidth * 1.25, baseWidth]
  );
  
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div className="flex items-center">
      <motion.button
        ref={ref}
        style={{ width }}
        onClick={onClick}
        className="aspect-square relative flex items-center justify-center rounded-xl transition-all duration-300 group hover:z-50"
        whileTap={{ scale: 0.9 }}
        initial="rest"
        whileHover="hover"
      >
        <motion.div 
          className="flex flex-col items-center relative transition-transform duration-300 group-hover:-translate-y-4"
          style={{
            filter: 'drop-shadow(0 0 0px rgba(59, 130, 246, 0))',
          }}
          variants={{
            hover: {
              filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))',
            }
          }}
        >
          {icon}
        </motion.div>
        
        {/* WhatsApp-style Tooltip */}
        <motion.div
          variants={{
            rest: { opacity: 0, y: 10, scale: 0.9 },
            hover: { opacity: 1, y: 0, scale: 1 }
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 pointer-events-none z-[100]"
        >
          <div className="relative bg-[#1E293B] text-slate-50 text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap border border-white/10 shadow-2xl font-bold tracking-tight">
            {label}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-2 h-2 bg-[#1E293B] border-r border-b border-white/10 rotate-45" />
          </div>
        </motion.div>
      </motion.button>
      
      {!isLast && (
        <span className="mx-1 text-white/20 select-none font-light">|</span>
      )}
    </div>
  );
}

export function Dock({ items }: DockProps) {
  const mouseX = useMotionValue<number>(Infinity);

  return (
    <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-fit">
      {/* Subtle outer glow behind dock */}
      <div className="absolute inset-x-4 inset-y-0 -z-10 bg-blue-500/10 blur-3xl rounded-full" />

      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center gap-1 md:gap-2 px-3 py-3 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] relative"
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
          />
        ))}
      </motion.div>
    </div>
  );
}