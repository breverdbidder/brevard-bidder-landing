// BrevardBidderAI - Framer Motion Animation Library
// Premium animations for world-class UI
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// ============================================================
// ANIMATION VARIANTS
// ============================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: 100,
    transition: { duration: 0.2 }
  }
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    transition: { duration: 0.2 }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.15 }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// ============================================================
// ANIMATED COMPONENTS
// ============================================================

interface AnimatedProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// Fade In
export const FadeIn: React.FC<AnimatedProps> = ({ children, className, delay = 0 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={fadeIn}
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Slide Up
export const SlideUp: React.FC<AnimatedProps> = ({ children, className, delay = 0 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={slideUp}
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale In (for modals)
export const ScaleIn: React.FC<AnimatedProps> = ({ children, className, delay = 0 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={scaleIn}
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Stagger Container (for lists)
export const StaggerContainer: React.FC<AnimatedProps> = ({ children, className }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
    className={className}
  >
    {children}
  </motion.div>
);

// Stagger Item (children of StaggerContainer)
export const StaggerItem: React.FC<AnimatedProps> = ({ children, className }) => (
  <motion.div
    variants={staggerItem}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================================
// INTERACTIVE ANIMATIONS
// ============================================================

interface InteractiveProps extends AnimatedProps {
  onClick?: () => void;
  disabled?: boolean;
}

// Hover Lift Effect
export const HoverLift: React.FC<InteractiveProps> = ({ 
  children, 
  className, 
  onClick,
  disabled 
}) => (
  <motion.div
    whileHover={disabled ? {} : { y: -4, transition: { duration: 0.2 } }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    onClick={onClick}
    className={className}
    style={{ cursor: disabled ? 'default' : 'pointer' }}
  >
    {children}
  </motion.div>
);

// Hover Scale Effect
export const HoverScale: React.FC<InteractiveProps> = ({ 
  children, 
  className, 
  onClick,
  disabled 
}) => (
  <motion.div
    whileHover={disabled ? {} : { scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    onClick={onClick}
    className={className}
    style={{ cursor: disabled ? 'default' : 'pointer' }}
  >
    {children}
  </motion.div>
);

// Hover Glow Effect (using box-shadow)
export const HoverGlow: React.FC<InteractiveProps> = ({ 
  children, 
  className, 
  onClick,
  disabled 
}) => (
  <motion.div
    whileHover={disabled ? {} : { 
      boxShadow: '0 0 30px -5px rgba(59, 130, 246, 0.5)',
      transition: { duration: 0.3 }
    }}
    onClick={onClick}
    className={className}
    style={{ cursor: disabled ? 'default' : 'pointer' }}
  >
    {children}
  </motion.div>
);

// ============================================================
// SPECIAL ANIMATIONS
// ============================================================

// Animated Number Counter
interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({ 
  from = 0, 
  to, 
  duration = 1,
  className,
  prefix = '',
  suffix = ''
}) => {
  const [count, setCount] = React.useState(from);
  
  React.useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / (duration * 1000));
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const currentCount = Math.round(from + (to - from) * easeProgress);
      
      setCount(currentCount);
      
      if (now < endTime) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  }, [from, to, duration]);
  
  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Progress Bar Animation
interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
}

export const AnimatedProgress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100,
  className,
  color = 'bg-blue-500'
}) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <div className={`h-2 bg-neutral-800 rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  );
};

// Pulse Animation (for live indicators)
export const Pulse: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
    className={className}
  />
);

// Skeleton Shimmer Animation
export const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={`relative overflow-hidden ${className}`}
    style={{ background: 'linear-gradient(90deg, #27272a 0%, #3f3f46 50%, #27272a 100%)' }}
    animate={{
      backgroundPosition: ['200% 0', '-200% 0']
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }}
  />
);

// ============================================================
// MODAL ANIMATION WRAPPER
// ============================================================

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children 
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          <div className="pointer-events-auto">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ============================================================
// PAGE TRANSITIONS
// ============================================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

export const PageTransition: React.FC<AnimatedProps> = ({ children, className }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageTransition}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================================
// EXPORTS
// ============================================================

export default {
  // Variants
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  staggerContainer,
  staggerItem,
  pageTransition,
  
  // Components
  FadeIn,
  SlideUp,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  HoverLift,
  HoverScale,
  HoverGlow,
  AnimatedCounter,
  AnimatedProgress,
  Pulse,
  Shimmer,
  ModalWrapper,
  PageTransition,
};
