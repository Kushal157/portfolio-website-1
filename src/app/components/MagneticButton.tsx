import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef, ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'none';
}

export function MagneticButton({ 
  children, 
  className = '', 
  onClick,
  variant = 'none'
}: MagneticButtonProps) {
  const variantStyles = {
    primary: 'luxe-btn-primary bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25',
    ghost: 'luxe-btn-ghost bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-medium transition-all backdrop-blur-sm',
    none: ''
  };

  const combinedClassName = `${variantStyles[variant]} ${className}`.trim();

  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.3);
    y.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={combinedClassName}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: xSpring,
        y: ySpring,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}
