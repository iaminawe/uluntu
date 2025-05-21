import React from 'react';
import { CardFooterProps } from './types';

/**
 * Card footer component
 * Used for displaying metadata, actions, and other information at the bottom of cards
 */
const CardFooter: React.FC<CardFooterProps> = ({
  children,
  actions,
  meta,
  className = '',
}) => {
  // If children are provided, render them directly
  if (children) {
    return <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 ${className}`}>{children}</div>;
  }

  return (
    <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Meta information (e.g., author, date, category) */}
        {meta && meta.length > 0 && (
          <div className="flex items-center space-x-4">
            {meta.map((item, index) => (
              <div key={index} className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                {item.icon && <span className="mr-1.5">{item.icon}</span>}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Actions (e.g., buttons, links) */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardFooter;
