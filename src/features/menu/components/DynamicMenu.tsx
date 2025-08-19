import React from 'react';
import { useMenuItems } from '../contexts/MenuContext';
import { filterMenuItemsByFeatures } from '../utils/menuAdapters';
import { useEnabledFeatures } from '@/hooks/useSettings';
import type { DynamicMenuProps, MenuItem } from '@/types/menu';

/**
 * Dynamic menu component that fetches menu items from the database
 * and renders them with proper loading states and error handling
 */
export const DynamicMenu: React.FC<DynamicMenuProps & {
  renderItem: (item: MenuItem, level?: number) => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: string) => React.ReactNode;
}> = ({
  position,
  fallbackItems = [],
  className = '',
  renderItem,
  renderLoading,
  renderError
}) => {
  const { items: rawItems, loading, error, refresh } = useMenuItems(position);
  const { isFeatureEnabled } = useEnabledFeatures();

  // Filter items based on feature flags
  const filteredItems = React.useMemo(() => {
    const itemsToFilter = rawItems.length > 0 ? rawItems : fallbackItems;
    return filterMenuItemsByFeatures(itemsToFilter, isFeatureEnabled);
  }, [rawItems, fallbackItems, isFeatureEnabled]);

  // Loading state
  if (loading && renderLoading) {
    return <>{renderLoading()}</>;
  }

  // Error state with fallback
  if (error) {
    if (renderError) {
      return <>{renderError(error)}</>;
    }
    
    // If no custom error renderer and we have fallback items, use them
    if (fallbackItems.length > 0) {
      const fallbackFiltered = filterMenuItemsByFeatures(fallbackItems, isFeatureEnabled);
      return (
        <div className={className}>
          {fallbackFiltered.map(item => renderItem(item, 0))}
        </div>
      );
    }
    
    // Default error display
    return (
      <div className={`${className} text-red-600`}>
        <span>Failed to load menu</span>
        <button 
          onClick={refresh}
          className="ml-2 text-sm underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render menu items
  return (
    <div className={className}>
      {filteredItems.map(item => renderItem(item, 0))}
    </div>
  );
};

/**
 * Loading skeleton component for menu items
 */
export const MenuLoadingSkeleton: React.FC<{ 
  count?: number; 
  className?: string;
  itemClassName?: string;
}> = ({ 
  count = 5, 
  className = '',
  itemClassName = 'h-4 bg-gray-200 rounded animate-pulse' 
}) => (
  <div className={className}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={itemClassName} />
    ))}
  </div>
);

/**
 * Error display component for menu loading failures
 */
export const MenuErrorDisplay: React.FC<{
  error: string;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => (
  <div className={`${className} text-red-600 text-sm`}>
    <span>Menu failed to load: {error}</span>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="ml-2 underline hover:no-underline"
        aria-label="Retry loading menu"
      >
        Retry
      </button>
    )}
  </div>
);