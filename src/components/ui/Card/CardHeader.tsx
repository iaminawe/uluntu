import React from 'react';
import { CardHeaderProps } from './types';

/**
 * Card header component
 * Used for displaying titles, images, and actions in card headers
 */
const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  title,
  subtitle,
  image,
  imageAlt = '',
  icon,
  actions,
  className = '',
}) => {
  // If children are provided, render them directly
  if (children) {
    return <div className={`${className}`}>{children}</div>;
  }

  // Render based on props
  return (
    <div className={`${className}`}>
      {/* Image (if provided) */}
      {image && (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={imageAlt || title || 'Card header image'}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Content area with title, subtitle, icon and actions */}
      {(title || subtitle || icon || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start">
            {icon && (
              <div className="mr-3 text-orange-500 dark:text-orange-400 flex-shrink-0">
                {icon}
              </div>
            )}
            
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="ml-auto flex items-center">
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardHeader;
