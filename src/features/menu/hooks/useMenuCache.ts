import { useCallback } from 'react';
import { useMenu } from '../contexts/MenuContext';

/**
 * Hook for managing menu cache operations
 */
export const useMenuCache = () => {
  const { clearCache, refreshMenu } = useMenu();

  // Clear cache for all menus
  const clearAllCache = useCallback(() => {
    clearCache();
  }, [clearCache]);

  // Clear cache for specific menu position
  const clearPositionCache = useCallback((position: string) => {
    clearCache(position);
  }, [clearCache]);

  // Refresh specific menu position
  const refreshPosition = useCallback(async (position: string) => {
    await refreshMenu(position);
  }, [refreshMenu]);

  // Refresh all common menu positions
  const refreshAllMenus = useCallback(async () => {
    const positions = ['main_header', 'footer_links', 'mobile_menu'];
    await Promise.all(positions.map(position => refreshMenu(position)));
  }, [refreshMenu]);

  // Preload menu data for better performance
  const preloadMenus = useCallback(async () => {
    const positions = ['main_header', 'footer_links'];
    await Promise.all(positions.map(position => refreshMenu(position)));
  }, [refreshMenu]);

  return {
    clearAllCache,
    clearPositionCache,
    refreshPosition,
    refreshAllMenus,
    preloadMenus
  };
};