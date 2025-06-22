import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicHeroProps } from './types';

const DynamicHero: React.FC<DynamicHeroProps> = ({
  title,
  subtitle,
  description,
  images,
  interval = 5000,
  overlay = {
    gradient: {
      colors: ['from-slate-900/80', 'via-slate-900/60', 'to-transparent'],
      direction: 'to-top'
    }
  },
  height = 'large',
  actions = []
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  const heightClasses = {
    full: 'h-screen',
    large: 'h-[80vh]',
    medium: 'h-[60vh]',
    small: 'h-[40vh]'
  };

  const getGradientClass = () => {
    if (!overlay.gradient) return '';
    const { colors, direction = 'to-top' } = overlay.gradient;
    return `bg-gradient-${direction} ${colors.join(' ')}`;
  };

  return (
    <section className={`relative ${heightClasses[height]} overflow-hidden`}>
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={images[currentImageIndex].src}
            alt={images[currentImageIndex].alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className={`absolute inset-0 ${getGradientClass()}`}>
        {overlay.color && (
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundColor: overlay.color, 
              opacity: overlay.opacity || 0.5 
            }} 
          />
        )}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl"
          >
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-orange-400 font-semibold text-lg mb-4"
              >
                {subtitle}
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              {title}
            </motion.h1>

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl md:text-2xl text-slate-200 mb-8 leading-relaxed"
              >
                {description}
              </motion.p>
            )}

            {actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                {actions.map((action, index) => {
                  const baseClasses = "px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105";
                  const variantClasses = {
                    primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl",
                    secondary: "bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20",
                    ghost: "text-white hover:bg-white/10"
                  };

                  return (
                    <Link
                      key={index}
                      to={action.href}
                      className={`${baseClasses} ${variantClasses[action.variant || 'primary']}`}
                    >
                      {action.label}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1, 
          delay: 1,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        className="absolute bottom-8 right-8 text-white/50"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
};

export default DynamicHero;