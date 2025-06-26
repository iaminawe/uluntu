import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { PresetTheme } from '@/types/theme';
import type { Easing } from 'framer-motion';

interface ThemeTransitionProps {
  theme: PresetTheme;
  children: React.ReactNode;
  duration?: number;
  easing?: Easing;
  enableColorTransition?: boolean;
  enableScaleTransition?: boolean;
  enableBlurTransition?: boolean;
}

/**
 * Smooth theme transition wrapper with advanced animations
 */
export const ThemeTransition: React.FC<ThemeTransitionProps> = ({
  theme,
  children,
  duration = 0.6,
  easing = 'easeInOut',
  enableColorTransition = true,
  enableScaleTransition = false,
  enableBlurTransition = false,
}) => {
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth color transitions using springs
  const primarySpring = useSpring(0);
  const backgroundSpring = useSpring(0);

  useEffect(() => {
    if (theme.slug !== currentTheme.slug) {
      setIsTransitioning(true);
      
      // Animate color transitions
      primarySpring.set(1);
      backgroundSpring.set(1);
      
      const timeout = setTimeout(() => {
        setCurrentTheme(theme);
        primarySpring.set(0);
        backgroundSpring.set(0);
        setIsTransitioning(false);
      }, duration * 1000);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [theme, currentTheme, primarySpring, backgroundSpring, duration]);

  // Transform springs to color values
  const primaryColor = useTransform(
    primarySpring,
    [0, 1],
    [currentTheme.configurations.colors.primary, theme.configurations.colors.primary]
  );

  const backgroundColor = useTransform(
    backgroundSpring,
    [0, 1],
    [currentTheme.configurations.colors.background, theme.configurations.colors.background]
  );

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full"
      animate={{
        scale: enableScaleTransition && isTransitioning ? 0.98 : 1,
        filter: enableBlurTransition && isTransitioning ? 'blur(2px)' : 'blur(0px)',
      }}
      transition={{ duration, ease: easing }}
    >
      {/* Color overlay for smooth transitions */}
      {enableColorTransition && (
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
              style={{
                background: `linear-gradient(135deg, ${theme.configurations.colors.primary}20, ${theme.configurations.colors.secondary}20)`,
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Main content */}
      <div className="relative z-10">{children}</div>

      {/* Animated theme styles */}
      <style>{`
        :root {
          --theme-primary: ${currentTheme.configurations.colors.primary};
          --theme-background: ${currentTheme.configurations.colors.background};
          --theme-transition-duration: ${duration}s;
          --theme-transition-easing: ${easing};
        }
      `}</style>
    </motion.div>
  );
};

/**
 * Theme switch animation with morphing effect
 */
export const ThemeMorphTransition: React.FC<{
  fromTheme: PresetTheme;
  toTheme: PresetTheme;
  isActive: boolean;
  onComplete?: () => void;
}> = ({ fromTheme, toTheme, isActive, onComplete }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {/* Morphing circles */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <radialGradient id="morph-gradient">
                <stop offset="0%" stopColor={toTheme.configurations.colors.primary} />
                <stop offset="100%" stopColor={toTheme.configurations.colors.secondary} />
              </radialGradient>
            </defs>
            
            <motion.circle
              cx="50%"
              cy="50%"
              r="0"
              fill="url(#morph-gradient)"
              initial={{ r: 0 }}
              animate={{ r: '150%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ opacity: 0.2 }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Ripple effect for theme changes
 */
export const ThemeRipple: React.FC<{
  x: number;
  y: number;
  color: string;
  onComplete?: () => void;
}> = ({ x, y, color, onComplete }) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 50, opacity: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      <div
        className="w-10 h-10 rounded-full"
        style={{ backgroundColor: color, transform: 'translate(-50%, -50%)' }}
      />
    </motion.div>
  );
};

/**
 * Page transition with theme change
 */
export const ThemePageTransition: React.FC<{
  children: React.ReactNode;
  theme: PresetTheme;
}> = ({ children, theme }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [theme.slug]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Element-level theme transitions
 */
export const ThemeElement: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered theme animations for lists
 */
export const ThemeStagger: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
}> = ({ children, staggerDelay = 0.05 }) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * staggerDelay,
            ease: 'easeOut',
          }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
};

/**
 * Theme color pulse animation
 */
export const ThemePulse: React.FC<{
  color: string;
  duration?: number;
  children: React.ReactNode;
}> = ({ color, duration = 2, children }) => {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}40`,
          `0 0 0 10px ${color}00`,
          `0 0 0 0 ${color}00`,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeOut',
      }}
      className="relative"
    >
      {children}
    </motion.div>
  );
};

/**
 * Theme skeleton loader with shimmer
 */
export const ThemeSkeletonShimmer: React.FC<{
  width?: string;
  height?: string;
  borderRadius?: string;
}> = ({ width = '100%', height = '20px', borderRadius = '4px' }) => {
  return (
    <div
      className="relative overflow-hidden bg-gray-200"
      style={{ width, height, borderRadius }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ x: ['100%', '-100%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

/**
 * Hook for theme transition state
 */
export function useThemeTransition(theme: PresetTheme) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousTheme, setPreviousTheme] = useState(theme);

  useEffect(() => {
    if (theme.slug !== previousTheme.slug) {
      setIsTransitioning(true);
      
      const timeout = setTimeout(() => {
        setPreviousTheme(theme);
        setIsTransitioning(false);
      }, 600);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [theme, previousTheme]);

  return { isTransitioning, previousTheme };
}

/**
 * CSS-in-JS for smooth theme transitions
 */
export const themeTransitionStyles = `
  * {
    transition: color var(--theme-transition-duration, 0.3s) var(--theme-transition-easing, ease-in-out),
                background-color var(--theme-transition-duration, 0.3s) var(--theme-transition-easing, ease-in-out),
                border-color var(--theme-transition-duration, 0.3s) var(--theme-transition-easing, ease-in-out),
                box-shadow var(--theme-transition-duration, 0.3s) var(--theme-transition-easing, ease-in-out);
  }

  /* Disable transitions for immediate updates */
  .theme-no-transition * {
    transition: none !important;
  }

  /* Smooth font changes */
  body {
    transition: font-family 0.3s ease-in-out;
  }

  /* Animated theme indicators */
  .theme-indicator {
    animation: themeIndicatorPulse 2s ease-in-out infinite;
  }

  @keyframes themeIndicatorPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  /* Theme change ripple effect */
  .theme-ripple {
    position: fixed;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: themeRippleExpand 1s ease-out forwards;
  }

  @keyframes themeRippleExpand {
    from {
      width: 0;
      height: 0;
      opacity: 0.8;
    }
    to {
      width: 200vmax;
      height: 200vmax;
      opacity: 0;
    }
  }
`;