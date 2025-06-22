import React from 'react';
import { motion } from 'framer-motion';
import { ImageConfig, OverlayConfig, SectionConfig } from './types';

interface ImageSectionProps extends SectionConfig {
  title?: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  theme?: 'light' | 'dark';
}

const ImageSection: React.FC<ImageSectionProps> = ({
  title,
  subtitle,
  description,
  children,
  background,
  overlay = {
    gradient: {
      colors: ['from-slate-900/70', 'to-slate-900/30'],
      direction: 'to-top'
    }
  },
  padding = 'lg',
  fullWidth = false,
  align = 'center',
  theme = 'dark'
}) => {
  const paddingClasses = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  const textColorClasses = theme === 'dark' 
    ? 'text-white' 
    : 'text-slate-900 dark:text-white';

  const getGradientClass = () => {
    if (!overlay?.gradient) return '';
    const { colors, direction = 'to-top' } = overlay.gradient;
    return `bg-gradient-${direction} ${colors.join(' ')}`;
  };

  const isImageBackground = (bg: any): bg is ImageConfig => {
    return bg && 'src' in bg;
  };

  return (
    <section className={`relative ${paddingClasses[padding]} overflow-hidden`}>
      {/* Background */}
      {background && isImageBackground(background) && (
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={background.src}
            alt={background.alt}
            className={`w-full h-full object-${background.objectFit || 'cover'}`}
            loading="lazy"
          />
        </motion.div>
      )}

      {/* Overlay */}
      {overlay && (
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
          {overlay.blur && (
            <div 
              className="absolute inset-0 backdrop-blur"
              style={{ backdropFilter: `blur(${overlay.blur}px)` }}
            />
          )}
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${fullWidth ? '' : 'container mx-auto px-4'}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`max-w-4xl ${alignClasses[align]}`}
        >
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-orange-400 font-semibold text-lg mb-4`}
            >
              {subtitle}
            </motion.p>
          )}

          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-4xl md:text-5xl font-bold mb-6 ${textColorClasses}`}
            >
              {title}
            </motion.h2>
          )}

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`text-xl ${theme === 'dark' ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'} mb-8`}
            >
              {description}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ImageSection;