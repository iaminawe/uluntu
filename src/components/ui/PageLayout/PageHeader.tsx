import React from 'react';
import { PageHeaderProps } from './types';

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
    return (
      <div 
        className={`relative py-12 mb-8 ${className}`}
        style={backgroundImage ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center items-center mb-4">
              {icon && <div className="mr-3">{icon}</div>}
            </div>
            <h1 className={`text-3xl font-bold ${backgroundImage ? 'text-white' : 'text-slate-900 dark:text-white'} mb-2`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`text-lg ${backgroundImage ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'} mt-2 max-w-3xl mx-auto`}>
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
