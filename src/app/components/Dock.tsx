import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'motion/react';
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface DockProps {
  items: {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }[];
}

const DOCK_ITEM_WIDTH = 54;
const DOCK_MAGNIFICATION = 1.38;
const DOCK_DISTANCE = 130;

function useWindowWidth() {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    let timeoutId: number | undefined;
    function handleResize() {
      if (timeoutId) cancelAnimationFrame(timeoutId);
      timeoutId = requestAnimationFrame(() => {
        setWidth(window.innerWidth);
      });
    }
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

const DockItem = React.memo(function DockItem({
  icon,
  label,
  onClick,
  mouseX,
  isLast,
  isMobile,
  baseWidth,
  magnification,
  activeDistance,
  registerMeasure,
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
  registerMeasure: (measureFn: () => void) => () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const centerXRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  const updateCenter = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      centerXRef.current = rect.x + rect.width / 2;
    }
  }, []);

  useEffect(() => {
    updateCenter();
    return registerMeasure(updateCenter);
  }, [registerMeasure, updateCenter]);

  // Pure arithmetic transform — avoids layout reflow on mousemove
  const distance = useTransform(mouseX, (val: number) => {
    if (val === Infinity || Number.isNaN(val)) return Infinity;
    const center = centerXRef.current;
    if (!center) return Infinity;
    return val - center;
  });

  const widthSync = useTransform(
    distance,
    [-activeDistance, -activeDistance / 2, 0, activeDistance / 2, activeDistance],
    [baseWidth, baseWidth * 1.08, baseWidth * magnification, baseWidth * 1.08, baseWidth],
  );

  const width = useSpring(widthSync, { mass: 0.1, stiffness: 260, damping: 24 });
  const scale = useTransform(width, (w) => w / baseWidth);

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center justify-center">
        <motion.button
          ref={ref}
          style={{ width }}
          onClick={onClick}
          onMouseEnter={() => {
            updateCenter();
            setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          className="aspect-square relative flex items-center justify-center rounded-2xl cursor-pointer will-change-transform select-none"
          whileTap={{ scale: 0.92 }}
        >
          <motion.div
            className="flex flex-col items-center justify-center relative will-change-transform"
            style={{ scale }}
          >
            {icon}
          </motion.div>

          {/* Tooltip */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.94 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`absolute ${isMobile ? '-top-10' : '-top-14'} left-1/2 -translate-x-1/2 pointer-events-none z-[100]`}
            >
              <div
                className={`relative bg-slate-900/95 text-slate-100 ${
                  isMobile ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3.5 py-1.5'
                } rounded-full whitespace-nowrap border border-white/10 shadow-xl font-medium tracking-tight backdrop-blur-md`}
              >
                {label}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-2 h-2 bg-slate-900/95 border-r border-b border-white/10 rotate-45" />
              </div>
            </motion.div>
          )}
        </motion.button>

        {isMobile && (
          <span className="text-[9px] text-slate-400 font-medium mt-0.5 select-none pointer-events-none tracking-tight">
            {label}
          </span>
        )}
      </div>

      {!isMobile && !isLast && (
        <span className="mx-1 text-white/10 select-none font-light text-base pointer-events-none">|</span>
      )}
    </div>
  );
});

export function Dock({ items }: DockProps) {
  const mouseX = useMotionValue<number>(Infinity);
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const measureListenersRef = useRef<Set<() => void>>(new Set());
  const registerMeasure = useCallback((fn: () => void) => {
    measureListenersRef.current.add(fn);
    return () => {
      measureListenersRef.current.delete(fn);
    };
  }, []);

  const remeasureAll = useCallback(() => {
    measureListenersRef.current.forEach((fn) => fn());
  }, []);

  const baseWidth = isMobile
    ? Math.min(46, Math.max(36, (windowWidth - 48 - (items.length - 1) * 10) / items.length))
    : DOCK_ITEM_WIDTH;

  const magnification = isMobile ? 1.2 : DOCK_MAGNIFICATION;
  const activeDistance = isMobile ? 70 : DOCK_DISTANCE;

  return (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-3 w-full max-w-fit flex justify-center pointer-events-none">
      {/* Background glow */}
      <div className="absolute inset-x-4 inset-y-0 -z-10 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />

      <motion.nav
        onMouseEnter={remeasureAll}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-[24px] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.55)] relative pointer-events-auto backdrop-blur-xl bg-slate-950/60"
        style={{
          contain: 'layout style',
        }}
        aria-label="Quick Navigation Dock"
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
            registerMeasure={registerMeasure}
          />
        ))}
      </motion.nav>
    </div>
  );
}
