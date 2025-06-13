import React from 'react';
import { CardProps } from '@/shared/components/ui/Card/types';

/**
 * Base card component
 * Provides the foundation for all card variants in the application
 */
const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = true,
  shadow = true,
  border = false,
  className = '',
  onClick,
  id,
}) => {
  // Base classes for the card
  const baseClasses = 'bg-white dark:bg-slate-800 rounded-lg overflow-hidden';
  
  // Optional classes based on props
  const shadowClass = shadow ? 'shadow-md' : '';
  const borderClass = border ? 'border border-slate-200 dark:border-slate-700' : '';
  const paddingClass = padding ? 'p-6' : '';
  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow' : '';
  
  // Determine if the card should be clickable
  const isClickable = !!onClick;
  const clickableClass = isClickable ? 'cursor-pointer' : '';
  
  return (
    <div 
      id={id}
      className={`
        ${baseClasses}
        ${shadowClass}
        ${borderClass}
        ${paddingClass}
        ${hoverClass}
        ${clickableClass}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
