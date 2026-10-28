import { motion, AnimatePresence } from 'motion/react';
import React, { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  transitionKey: string;
}

export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{
          duration: 0.18,
          ease: 'easeOut',
        }}
        className="will-change-transform will-change-[opacity]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
