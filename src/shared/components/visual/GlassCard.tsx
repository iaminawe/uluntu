import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  gradient?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  blur = 'md',
  opacity = 0.8,
  gradient = false,
  hoverable = true,
  onClick
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  const baseClasses = `
    relative overflow-hidden rounded-2xl
    ${blurClasses[blur]}
    border border-white/20 dark:border-white/10
    shadow-xl
    ${hoverable ? 'transition-all duration-300 hover:shadow-2xl hover:border-white/30 dark:hover:border-white/20' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const backgroundStyle = {
    backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    ...(gradient && {
      background: `linear-gradient(135deg, rgba(255, 255, 255, ${opacity}) 0%, rgba(255, 255, 255, ${opacity * 0.6}) 100%)`
    })
  };

  const darkBackgroundStyle = {
    backgroundColor: `rgba(30, 41, 59, ${opacity})`,
    ...(gradient && {
      background: `linear-gradient(135deg, rgba(30, 41, 59, ${opacity}) 0%, rgba(30, 41, 59, ${opacity * 0.6}) 100%)`
    })
  };

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Glass Background */}
      <div 
        className="absolute inset-0 bg-white dark:hidden"
        style={backgroundStyle}
      />
      <div 
        className="absolute inset-0 hidden dark:block"
        style={darkBackgroundStyle}
      />

      {/* Gradient Glow Effect */}
      {gradient && (
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20" />
    </motion.div>
  );
};

export default GlassCard;