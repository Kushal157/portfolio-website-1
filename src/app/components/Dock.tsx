import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
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
  index 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  mouseX: ReturnType<typeof useMotionValue>;
  index: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const baseWidth = getDockItemWidth();
  const widthSync = useTransform(distance, [-DOCK_DISTANCE, 0, DOCK_DISTANCE], [baseWidth, baseWidth * DOCK_MAGNIFICATION, baseWidth]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.button
      ref={ref}
      style={{ width }}
      onClick={onClick}
      className="aspect-square relative flex items-center justify-center rounded-lg md:rounded-xl transition-colors duration-200 hover:bg-white/10"
      whileTap={{ scale: 0.9 }}
    >
      <motion.div 
        className="flex flex-col items-center relative"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          delay: index * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {icon}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: -5 }}
        className="absolute -top-12 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none backdrop-blur-sm"
      >
        {label}
      </motion.div>
    </motion.button>
  );
}

export function Dock({ items }: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-fit">
      {/* Animated glow behind dock */}
      <motion.div
        className="absolute inset-0 -z-10 blur-2xl opacity-40"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl" />
      </motion.div>

      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 rounded-xl md:rounded-2xl border border-white/20 shadow-2xl relative"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.3)',
            '0 0 40px rgba(147, 51, 234, 0.4)',
            '0 0 20px rgba(59, 130, 246, 0.3)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
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
          />
        ))}
      </motion.div>
    </div>
  );
}