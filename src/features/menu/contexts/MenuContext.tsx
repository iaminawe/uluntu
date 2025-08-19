import React, { createContext, useContext, useCallback, useReducer, useEffect, useMemo } from 'react';
import { fetchMenuHierarchy } from '@/features/menu/api/menuApi';
import type { MenuItem, MenuState, MenuContextType, MenuCacheEntry } from '@/types/menu';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 20; // Maximum number of menu positions to cache

// Action types for reducer
type MenuAction =
  | { type: 'FETCH_START'; payload: { position: string } }
  | { type: 'FETCH_SUCCESS'; payload: { position: string; items: MenuItem[] } }
  | { type: 'FETCH_ERROR'; payload: { position: string; error: string } }
  | { type: 'CLEAR_CACHE'; payload?: { position: string } }
  | { type: 'INVALIDATE_CACHE'; payload: { position: string } };

// Initial state
const initialState: MenuState = {
  items: {},
  loading: {},
  errors: {},
  lastFetch: {}
};

// Reducer function
function menuReducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.position]: true },
        errors: { ...state.errors, [action.payload.position]: null }
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        items: { ...state.items, [action.payload.position]: action.payload.items },
        loading: { ...state.loading, [action.payload.position]: false },
        errors: { ...state.errors, [action.payload.position]: null },
        lastFetch: { ...state.lastFetch, [action.payload.position]: Date.now() }
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.position]: false },
        errors: { ...state.errors, [action.payload.position]: action.payload.error }
      };

    case 'CLEAR_CACHE':
      if (action.payload?.position) {
        // Clear specific position
        const { [action.payload.position]: removedItems, ...restItems } = state.items;
        const { [action.payload.position]: removedLoading, ...restLoading } = state.loading;
        const { [action.payload.position]: removedErrors, ...restErrors } = state.errors;
        const { [action.payload.position]: removedFetch, ...restFetch } = state.lastFetch;
        
        return {
          items: restItems,
          loading: restLoading,
          errors: restErrors,
          lastFetch: restFetch
        };
      } else {
        // Clear all cache
        return initialState;
      }

    case 'INVALIDATE_CACHE':
      const { [action.payload.position]: removed, ...restLastFetch } = state.lastFetch;
      return {
        ...state,
        lastFetch: restLastFetch
      };

    default:
      return state;
  }
}

// Context
const MenuContext = createContext<MenuContextType | null>(null);

// Provider component
export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(menuReducer, initialState);

  // Check if cache is valid for a position
  const isCacheValid = useCallback((position: string): boolean => {
    const lastFetch = state.lastFetch[position];
    if (!lastFetch) return false;
    
    const now = Date.now();
    return (now - lastFetch) < CACHE_DURATION;
  }, [state.lastFetch]);

  // Fetch menu items for a position
  const fetchMenu = useCallback(async (position: string, forceRefresh = false): Promise<void> => {
    // Check cache first (unless force refresh)
    if (!forceRefresh && isCacheValid(position) && state.items[position]) {
      return;
    }

    // Don't fetch if already loading
    if (state.loading[position]) {
      return;
    }

    dispatch({ type: 'FETCH_START', payload: { position } });

    try {
      const items = await fetchMenuHierarchy(position);
      dispatch({ 
        type: 'FETCH_SUCCESS', 
        payload: { position, items: items || [] } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch menu';
      dispatch({ 
        type: 'FETCH_ERROR', 
        payload: { position, error: errorMessage } 
      });
    }
  }, [state.loading, state.items, isCacheValid]);

  // Get menu items for a position
  const getMenuItems = useCallback((position: string): MenuItem[] => {
    return state.items[position] || [];
  }, [state.items]);

  // Check loading state for a position
  const isLoading = useCallback((position: string): boolean => {
    return Boolean(state.loading[position]);
  }, [state.loading]);

  // Get error for a position
  const getError = useCallback((position: string): string | null => {
    return state.errors[position] || null;
  }, [state.errors]);

  // Refresh menu for a position
  const refreshMenu = useCallback(async (position: string): Promise<void> => {
    await fetchMenu(position, true);
  }, [fetchMenu]);

  // Clear cache for specific position or all
  const clearCache = useCallback((position?: string): void => {
    dispatch({ type: 'CLEAR_CACHE', payload: position ? { position } : undefined });
  }, []);

  // Cache cleanup effect
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      const positions = Object.keys(state.lastFetch);
      
      positions.forEach(position => {
        const lastFetch = state.lastFetch[position];
        if (lastFetch && (now - lastFetch) > CACHE_DURATION * 2) {
          // Remove expired cache entries
          dispatch({ type: 'CLEAR_CACHE', payload: { position } });
        }
      });
    };

    // Run cleanup every 10 minutes
    const cleanupInterval = setInterval(cleanup, 10 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, [state.lastFetch]);

  const contextValue: MenuContextType = useMemo(() => ({
    getMenuItems,
    isLoading,
    getError,
    refreshMenu,
    clearCache
  }), [getMenuItems, isLoading, getError, refreshMenu, clearCache]);
  
  // Also expose internal state and fetchMenu for useMenuItems hook
  const internalContext = useMemo(() => ({
    ...contextValue,
    state,
    fetchMenu
  }), [contextValue, state, fetchMenu]);

  return (
    <MenuContext.Provider value={internalContext as any}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook to use menu context
export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

// Hook to use menu items for a specific position
export const useMenuItems = (position: string) => {
  const { getMenuItems, isLoading, getError, refreshMenu } = useMenu();
  const context = useContext(MenuContext);
  
  // Use effect to trigger fetch outside of render phase
  useEffect(() => {
    if (!context) return;
    
    const state = (context as any).state;
    const fetchMenu = (context as any).fetchMenu;
    
    if (state && fetchMenu && !state.items[position] && !state.loading[position] && !state.errors[position]) {
      fetchMenu(position);
    }
  }, [position, context]);
  
  return {
    items: getMenuItems(position),
    loading: isLoading(position),
    error: getError(position),
    refresh: () => refreshMenu(position)
  };
};