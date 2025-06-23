# Hybrid Hook Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the hybrid state management pattern when creating new features or refactoring existing ones. Follow these patterns to ensure consistency with the established architecture.

## 🚀 Quick Start: Creating a New Feature

Let's walk through creating a hypothetical "notifications" feature using the hybrid pattern.

### Step 1: Create Feature Structure

```bash
mkdir -p src/features/notifications/{api,components,hooks,store,types}
```

### Step 2: Define Types

```typescript
// src/features/notifications/types/index.ts
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  user_id: string;
}

export interface NotificationFilters {
  read?: boolean;
  type?: 'info' | 'warning' | 'error' | 'success';
  search?: string;
}

export interface NotificationInput {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  user_id: string;
}
```

### Step 3: Create API Layer (React Query)

```typescript
// src/features/notifications/api/notificationsApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Notification, NotificationFilters, NotificationInput } from '../types';

// Query Keys
export const queryKeys = {
  notifications: ['notifications'] as const,
  notification: (id: string) => ['notifications', id] as const,
  notificationsWithFilters: (filters: NotificationFilters) => 
    ['notifications', 'filtered', filters] as const,
};

// API Functions
const notificationsApi = {
  async getAll(filters?: NotificationFilters): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read);
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(notification: NotificationInput): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// React Query Hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsApi.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes for real-time data
  });
};

export const useNotificationsWithFilters = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: queryKeys.notificationsWithFilters(filters || {}),
    queryFn: () => notificationsApi.getAll(filters),
    enabled: !!filters && Object.keys(filters).length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useNotification = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.notification(id!),
    queryFn: () => notificationsApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (data) => {
      // Update specific notification in cache
      queryClient.setQueryData(queryKeys.notification(data.id), data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};
```

### Step 4: Create UI Redux Slice

```typescript
// src/features/notifications/store/notificationsUISlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationFilters } from '../types';

export interface NotificationsUIState {
  filters: NotificationFilters;
  selectedNotifications: string[];
  viewMode: 'list' | 'compact';
  showUnreadOnly: boolean;
  sortBy: 'date' | 'type' | 'read';
  sortDirection: 'asc' | 'desc';
  pagination: {
    page: number;
    itemsPerPage: number;
  };
}

const initialState: NotificationsUIState = {
  filters: {},
  selectedNotifications: [],
  viewMode: 'list',
  showUnreadOnly: false,
  sortBy: 'date',
  sortDirection: 'desc',
  pagination: {
    page: 1,
    itemsPerPage: 20,
  },
};

const notificationsUISlice = createSlice({
  name: 'notificationsUI',
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<NotificationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    
    setViewMode: (state, action: PayloadAction<'list' | 'compact'>) => {
      state.viewMode = action.payload;
    },
    
    toggleUnreadOnly: (state) => {
      state.showUnreadOnly = !state.showUnreadOnly;
      state.filters.read = state.showUnreadOnly ? false : undefined;
      state.pagination.page = 1;
    },
    
    toggleNotificationSelection: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const index = state.selectedNotifications.indexOf(notificationId);
      
      if (index > -1) {
        state.selectedNotifications.splice(index, 1);
      } else {
        state.selectedNotifications.push(notificationId);
      }
    },
    
    selectAllNotifications: (state, action: PayloadAction<string[]>) => {
      state.selectedNotifications = action.payload;
    },
    
    clearSelection: (state) => {
      state.selectedNotifications = [];
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortDirection: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy as any;
      state.sortDirection = action.payload.sortDirection;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.page = 1;
    },
  },
});

export const {
  updateFilters,
  clearFilters,
  setViewMode,
  toggleUnreadOnly,
  toggleNotificationSelection,
  selectAllNotifications,
  clearSelection,
  setSorting,
  setPage,
  setItemsPerPage,
} = notificationsUISlice.actions;

// Selectors
export const selectNotificationsFilters = (state: { notificationsUI: NotificationsUIState }) => 
  state.notificationsUI.filters;
export const selectSelectedNotifications = (state: { notificationsUI: NotificationsUIState }) => 
  state.notificationsUI.selectedNotifications;
export const selectViewMode = (state: { notificationsUI: NotificationsUIState }) => 
  state.notificationsUI.viewMode;
export const selectShowUnreadOnly = (state: { notificationsUI: NotificationsUIState }) => 
  state.notificationsUI.showUnreadOnly;
export const selectSorting = (state: { notificationsUI: NotificationsUIState }) => ({
  sortBy: state.notificationsUI.sortBy,
  sortDirection: state.notificationsUI.sortDirection,
});
export const selectPagination = (state: { notificationsUI: NotificationsUIState }) => 
  state.notificationsUI.pagination;

export default notificationsUISlice.reducer;
```

### Step 5: Create Hybrid Hook

```typescript
// src/features/notifications/hooks/useNotificationsHybrid.ts
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useQueryClient } from '@tanstack/react-query';
import {
  useNotifications,
  useNotificationsWithFilters,
  useCreateNotification,
  useMarkNotificationAsRead,
  useDeleteNotification,
} from '../api/notificationsApi';
import {
  updateFilters,
  clearFilters,
  setViewMode,
  toggleUnreadOnly,
  toggleNotificationSelection,
  selectAllNotifications,
  clearSelection,
  setSorting,
  setPage,
  setItemsPerPage,
  selectNotificationsFilters,
  selectSelectedNotifications,
  selectViewMode,
  selectShowUnreadOnly,
  selectSorting,
  selectPagination,
} from '../store/notificationsUISlice';
import { NotificationFilters, NotificationInput } from '../types';

/**
 * Hybrid hook for notifications that combines React Query for data fetching
 * with Redux for UI state management
 */
export function useNotificationsHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // UI state from Redux
  const filters = useAppSelector(selectNotificationsFilters);
  const selectedNotifications = useAppSelector(selectSelectedNotifications);
  const viewMode = useAppSelector(selectViewMode);
  const showUnreadOnly = useAppSelector(selectShowUnreadOnly);
  const sorting = useAppSelector(selectSorting);
  const pagination = useAppSelector(selectPagination);
  
  // React Query for data fetching
  const hasFilters = Object.keys(filters).length > 0;
  const notificationsQuery = useNotificationsWithFilters(hasFilters ? filters : undefined);
  
  // Mutations
  const createMutation = useCreateNotification();
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();
  
  // Enhanced actions with better UX
  const createNotification = async (data: NotificationInput) => {
    try {
      const result = await createMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  const markAsRead = async (id: string) => {
    try {
      const result = await markAsReadMutation.mutateAsync(id);
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  const deleteNotification = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      throw error;
    }
  };
  
  // Filter actions (Redux)
  const updateFiltersAction = (newFilters: Partial<NotificationFilters>) => {
    dispatch(updateFilters(newFilters));
  };
  
  const setSearchTerm = (search?: string) => {
    updateFiltersAction({ search });
  };
  
  const setTypeFilter = (type?: 'info' | 'warning' | 'error' | 'success') => {
    updateFiltersAction({ type });
  };
  
  const setReadFilter = (read?: boolean) => {
    updateFiltersAction({ read });
  };
  
  const clearAllFilters = () => {
    dispatch(clearFilters());
  };
  
  // View actions (Redux)
  const setViewModeAction = (mode: 'list' | 'compact') => {
    dispatch(setViewMode(mode));
  };
  
  const toggleUnreadOnlyAction = () => {
    dispatch(toggleUnreadOnly());
  };
  
  // Selection actions (Redux)
  const toggleSelection = (id: string) => {
    dispatch(toggleNotificationSelection(id));
  };
  
  const selectAll = () => {
    const allIds = notificationsQuery.data?.map(n => n.id) || [];
    dispatch(selectAllNotifications(allIds));
  };
  
  const clearSelectionAction = () => {
    dispatch(clearSelection());
  };
  
  // Sorting actions (Redux)
  const setSortingAction = (sortBy: string, sortDirection: 'asc' | 'desc') => {
    dispatch(setSorting({ sortBy, sortDirection }));
  };
  
  // Pagination actions (Redux)
  const setPageAction = (page: number) => {
    dispatch(setPage(page));
  };
  
  const setItemsPerPageAction = (itemsPerPage: number) => {
    dispatch(setItemsPerPage(itemsPerPage));
  };
  
  // Computed values
  const totalNotifications = notificationsQuery.data?.length || 0;
  const unreadCount = notificationsQuery.data?.filter(n => !n.read).length || 0;
  const hasSelection = selectedNotifications.length > 0;
  
  // Client-side pagination (can be moved to server-side later)
  const paginatedNotifications = useMemo(() => {
    const notifications = notificationsQuery.data || [];
    const startIndex = (pagination.page - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return notifications.slice(startIndex, endIndex);
  }, [notificationsQuery.data, pagination]);
  
  const totalPages = Math.ceil(totalNotifications / pagination.itemsPerPage);
  
  return {
    // Data from React Query
    notifications: notificationsQuery.data || [],
    paginatedNotifications,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    
    // UI state from Redux
    filters,
    selectedNotifications,
    viewMode,
    showUnreadOnly,
    sorting,
    pagination,
    
    // Computed values
    totalNotifications,
    unreadCount,
    hasSelection,
    totalPages,
    
    // Filter actions
    updateFilters: updateFiltersAction,
    setSearchTerm,
    setTypeFilter,
    setReadFilter,
    clearAllFilters,
    
    // View actions
    setViewMode: setViewModeAction,
    toggleUnreadOnly: toggleUnreadOnlyAction,
    
    // Selection actions
    toggleSelection,
    selectAll,
    clearSelection: clearSelectionAction,
    
    // Sorting actions
    setSorting: setSortingAction,
    
    // Pagination actions
    setPage: setPageAction,
    setItemsPerPage: setItemsPerPageAction,
    
    // Mutation actions
    createNotification,
    markAsRead,
    deleteNotification,
    
    // Mutation states
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAsReadError: markAsReadMutation.error,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Hybrid hook for a single notification
 */
export function useNotificationHybrid(id?: string) {
  const queryClient = useQueryClient();
  
  // React Query for data fetching
  const notificationQuery = useNotification(id);
  
  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();
  
  const markAsRead = async () => {
    if (!id) throw new Error('Notification ID is required');
    return markAsReadMutation.mutateAsync(id);
  };
  
  const deleteNotification = async () => {
    if (!id) throw new Error('Notification ID is required');
    return deleteMutation.mutateAsync(id);
  };
  
  return {
    // Data from React Query
    notification: notificationQuery.data,
    isLoading: notificationQuery.isLoading,
    isError: notificationQuery.isError,
    error: notificationQuery.error,
    refetch: notificationQuery.refetch,
    
    // Actions
    markAsRead,
    deleteNotification,
    
    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    markAsReadError: markAsReadMutation.error,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
```

### Step 6: Update Store Configuration

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import notificationsUIReducer from '@/features/notifications/store/notificationsUISlice';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    notificationsUI: notificationsUIReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Step 7: Create Components

```typescript
// src/features/notifications/components/NotificationsList/index.tsx
import { useNotificationsHybrid } from '../../hooks/useNotificationsHybrid';
import NotificationCard from './NotificationCard';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import ErrorMessage from '@/shared/components/ui/ErrorMessage';

interface NotificationsListProps {
  // Optional parent data (for flexibility)
  notifications?: Notification[];
  loading?: boolean;
  error?: Error;
}

export default function NotificationsList({
  notifications: parentNotifications,
  loading: parentLoading,
  error: parentError
}: NotificationsListProps) {
  // Determine data source
  const useParentData = parentNotifications !== undefined;
  
  // Use hybrid hook only if no parent data provided
  const {
    paginatedNotifications,
    isLoading,
    error,
    viewMode,
    selectedNotifications,
    toggleSelection,
    totalPages,
    pagination,
    setPage
  } = useNotificationsHybrid();
  
  // Use appropriate data source
  const finalNotifications = useParentData ? parentNotifications : paginatedNotifications;
  const finalLoading = useParentData ? parentLoading : isLoading;
  const finalError = useParentData ? parentError : error;
  
  if (finalLoading) {
    return <LoadingSpinner />;
  }
  
  if (finalError) {
    return <ErrorMessage error={finalError} />;
  }
  
  if (!finalNotifications?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No notifications found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className={`space-y-2 ${viewMode === 'compact' ? 'space-y-1' : ''}`}>
        {finalNotifications.map(notification => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            isSelected={selectedNotifications.includes(notification.id)}
            onToggleSelection={() => toggleSelection(notification.id)}
            compact={viewMode === 'compact'}
          />
        ))}
      </div>
      
      {!useParentData && totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

```typescript
// src/pages/NotificationsPage/index.tsx
import { Helmet } from 'react-helmet-async';
import { useNotificationsHybrid } from '@/features/notifications/hooks/useNotificationsHybrid';
import NotificationsList from '@/features/notifications/components/NotificationsList';
import NotificationsFilters from '@/features/notifications/components/NotificationsFilters';
import { ContentContainer } from '@/shared/components/ui/PageLayout';

export default function NotificationsPage() {
  const {
    isLoading,
    error,
    totalNotifications,
    unreadCount,
    setSearchTerm,
    setTypeFilter,
    clearAllFilters,
    viewMode,
    setViewMode
  } = useNotificationsHybrid();
  
  return (
    <>
      <Helmet>
        <title>Notifications - Kootenay Tech Community</title>
        <meta name="description" content="View and manage your notifications" />
      </Helmet>
      
      <ContentContainer>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {totalNotifications} total • {unreadCount} unread
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64">
            <NotificationsFilters
              onSearch={setSearchTerm}
              onTypeFilter={setTypeFilter}
              onClearFilters={clearAllFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </aside>
          
          <main className="flex-1">
            <NotificationsList />
          </main>
        </div>
      </ContentContainer>
    </>
  );
}
```

## 🧪 Testing Pattern

```typescript
// src/features/notifications/hooks/__tests__/useNotificationsHybrid.test.ts
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useNotificationsHybrid } from '../useNotificationsHybrid';
import notificationsUIReducer from '../../store/notificationsUISlice';

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const store = configureStore({
    reducer: {
      notificationsUI: notificationsUIReducer,
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {children}
      </Provider>
    </QueryClientProvider>
  );
};

describe('useNotificationsHybrid', () => {
  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useNotificationsHybrid(), {
      wrapper: createTestWrapper(),
    });
    
    expect(result.current.notifications).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.selectedNotifications).toEqual([]);
    expect(result.current.viewMode).toBe('list');
  });
  
  test('updates filters correctly', () => {
    const { result } = renderHook(() => useNotificationsHybrid(), {
      wrapper: createTestWrapper(),
    });
    
    act(() => {
      result.current.setSearchTerm('test');
    });
    
    expect(result.current.filters.search).toBe('test');
  });
});
```

## 📚 Summary

This implementation pattern provides:

1. **Clear Separation**: Server state in React Query, UI state in Redux
2. **Flexibility**: Components can use parent data or hybrid hooks
3. **Performance**: Intelligent caching and optimistic updates
4. **Maintainability**: Consistent patterns across features
5. **Testability**: Easy to mock and test individual concerns

Follow this pattern for all new features to maintain architectural consistency!