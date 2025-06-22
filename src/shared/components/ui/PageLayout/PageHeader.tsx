import React from 'react';
import { PageHeaderProps } from '@/shared/components/ui/PageLayout/types';

/**
 * Reusable page header component
 * Used to display consistent page headers across the application
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  backgroundImage,
  isHero = false,
  className = '',
}) => {
  // Determine if this is a hero-style header or standard header
  if (isHero || backgroundImage) {
    const hasGradient = className.includes('gradient'); // We might not need this specific check anymore
    const shouldUseWhiteText = backgroundImage || hasGradient; // Keep for text color

    return (
      <div
        className={`relative py-12 mb-8 overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 ${className}`}
        style={{
          minHeight: '300px' // Ensure minimum height for the header
        }}
      >
        {backgroundImage && (
          <img
            src={backgroundImage} // Use the prop directly as src
            alt="Header background"
            className="absolute inset-0 w-full h-full object-cover z-0" // Positioned as background
            onError={(e) => {
              console.error('Failed to load background image:', backgroundImage);
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        <div className="container mx-auto px-4 relative z-20"> {/* Content needs higher z-index */}
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center items-center mb-4">
              {icon && <div className="mr-3">{icon}</div>}
            </div>
            <h1 className={`text-3xl font-bold ${shouldUseWhiteText ? 'text-white' : 'text-slate-900 dark:text-white'} mb-2`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`text-lg ${shouldUseWhiteText ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'} mt-2 max-w-3xl mx-auto`}>
                {subtitle}
              </p>
            )}
            {actions && (
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard header (non-hero)
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-orange-500 dark:text-orange-400">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3 items-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
