import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { formatDate } from '@/shared/utils/dateUtils';
import { [Feature]Item } from '../../types';
import { [Component]Props } from './types';

/**
 * [Component] - Brief description of what this component does
 * 
 * @example
 * <[Component] 
 *   item={item}
 *   onAction={handleAction}
 *   variant="compact"
 * />
 */
export default function [Component]({ 
  item,
  onAction,
  variant = 'default',
  className = '',
  ...props
}: [Component]Props) {
  // Early return for invalid data
  if (!item) {
    return (
      <Card className={`${className} p-4 text-gray-500`}>
        No data available
      </Card>
    );
  }

  // Event handlers
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onAction?.(item);
  };

  // Computed values
  const displayDate = item.createdAt ? formatDate(item.createdAt) : 'Unknown date';
  const isCompact = variant === 'compact';

  // Render helpers
  const renderImage = () => {
    if (!item.image && !item.images?.length) return null;
    
    const imageSrc = item.image || item.images?.[0] || '/placeholder.jpg';
    
    return (
      <img 
        src={imageSrc}
        alt={item.title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
    );
  };

  const renderContent = () => (
    <>
      <h3 className="text-lg font-semibold line-clamp-2">
        {item.title}
      </h3>
      
      {!isCompact && item.description && (
        <p className="text-gray-600 mt-2 line-clamp-3">
          {item.description}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          {displayDate}
        </span>
        
        {item.status && (
          <Badge variant={item.status === 'published' ? 'success' : 'default'}>
            {item.status}
          </Badge>
        )}
      </div>
    </>
  );

  // Main render
  return (
    <Card 
      className={`
        [component]-card 
        [component]-card--${variant}
        ${className}
      `}
      data-testid="[component]-card"
      {...props}
    >
      <Link 
        to={`/[feature]/${item.id}`}
        className="block hover:no-underline"
        aria-label={`View details for ${item.title}`}
      >
        {renderImage()}
        
        <div className="p-4">
          {renderContent()}
        </div>
      </Link>
      
      {onAction && (
        <div className="px-4 pb-4">
          <button
            onClick={handleClick}
            className="
              w-full py-2 px-4 
              bg-orange-500 text-white 
              rounded-md hover:bg-orange-600 
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-orange-500
            "
            aria-label={`Perform action on ${item.title}`}
          >
            View Details
          </button>
        </div>
      )}
    </Card>
  );
}

// Export types for external use
export type { [Component]Props } from './types';