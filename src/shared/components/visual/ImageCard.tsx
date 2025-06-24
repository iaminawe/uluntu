import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImageCardProps } from './types';

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  title,
  description,
  badge,
  badgeColor = 'bg-orange-500',
  meta = [],
  link,
  onClick,
  variant = 'default',
  hoverable = true,
  animated = true
}) => {
  const cardContent = (
    <>
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={image.src}
          alt={image.alt}
          className="w-full h-full object-cover"
          whileHover={hoverable ? { scale: 1.1 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge */}
        {badge && (
          <div className={`absolute top-4 left-4 ${badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
            {description}
          </p>
        )}
        
        {meta.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-500">
            {meta.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                {item.icon && <item.icon className="w-4 h-4" {...{} as any} />}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const cardClasses = `
    group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden 
    ${hoverable ? 'hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2' : 'shadow-lg'}
    ${variant === 'glass' ? 'backdrop-blur-md bg-white/80 dark:bg-slate-800/80' : ''}
    ${variant === 'gradient' ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900' : ''}
  `;

  const MotionComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  } : {};

  if (link) {
    return (
      <Link to={link} className="block">
        <MotionComponent className={cardClasses} {...animationProps}>
          {cardContent}
        </MotionComponent>
      </Link>
    );
  }

  if (onClick) {
    return (
      <MotionComponent 
        className={`${cardClasses} cursor-pointer`} 
        onClick={onClick}
        {...animationProps}
      >
        {cardContent}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent className={cardClasses} {...animationProps}>
      {cardContent}
    </MotionComponent>
  );
};

export default ImageCard;