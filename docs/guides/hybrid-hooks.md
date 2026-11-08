# Hybrid Pattern Guide - React Query + Redux Architecture

## 📖 Overview

The Uluntu uses a **Hybrid Architecture** that combines React Query for server state management with Redux for UI-only state management. This pattern provides the best of both worlds: efficient server state handling with predictable UI state management.

## 🏗️ Architecture Principles

### Core Principle: Separation of Concerns

```
┌─────────────────┬─────────────────┐
│   SERVER STATE  │    UI STATE     │
├─────────────────┼─────────────────┤
│  React Query    │     Redux       │
│                 │                 │
│ • Data fetching │ • Filters       │
│ • Caching       │ • View modes    │
│ • Mutations     │ • Selections    │
│ • Loading states│ • Sort orders   │
│ • Error handling│ • Pagination    │
└─────────────────┴─────────────────┘
```

### Why This Pattern?

- **React Query**: Optimized for server state with built-in caching, background updates, and error handling
- **Redux**: Predictable UI state management with time-travel debugging and persistence
- **Clear Boundaries**: No confusion about where state belongs
- **Performance**: Each tool optimized for its specific use case

## 📁 File Structure

Every feature follows this consistent structure:

```
src/features/{feature-name}/
├── api/
│   └── {feature}Api.ts          # API layer (used by React Query)
├── store/
│   └── {feature}UISlice.ts      # Redux UI-only slice
├── hooks/
│   └── use{Feature}Hybrid.ts    # Hybrid hook combining both
├── components/
│   └── ...                      # Feature components
└── types/
    └── index.ts                 # TypeScript types
```

## 🔧 Implementation Pattern

### 1. API Layer (`{feature}Api.ts`)

The API layer provides methods for server operations:

```typescript
// src/features/events/api/eventsApi.ts
export const eventsApi = {
  async getAll(filters?: EventFilters): Promise<Event[]> {
    // Implementation
  },
  
  async getById(id: string): Promise<Event | null> {
    // Implementation
  },
  
  async create(data: Partial<Event>): Promise<Event> {
    // Implementation
  },
  
  async update(id: string, data: Partial<Event>): Promise<Event> {
    // Implementation
  },
  
  async delete(id: string): Promise<boolean> {
    // Implementation
  }
};
```

### 2. UI Slice (`{feature}UISlice.ts`)

Redux slice for UI-only state:

```typescript
// src/features/events/store/eventsUISlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export interface EventFilters {
  search?: string;
  types?: string[];
  dateRange?: string;
}

export interface EventsUIState {
  filters: EventFilters;
  selectedEventId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'title';
  sortOrder: 'asc' | 'desc';
}

const initialState: EventsUIState = {
  filters: {},
  selectedEventId: null,
  viewMode: 'grid',
  sortBy: 'date',
  sortOrder: 'desc',
};

const eventsUISlice = createSlice({
  name: 'eventsUI',
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<EventFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedEvent: (state, action: PayloadAction<string | null>) => {
      state.selectedEventId = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'title'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
  },
});

export const {
  updateFilters,
  clearFilters,
  setSelectedEvent,
  setViewMode,
  setSortBy,
  setSortOrder,
} = eventsUISlice.actions;

// Selectors
export const selectEventFilters = (state: RootState) => state.eventsUI.filters;
export const selectSelectedEventId = (state: RootState) => state.eventsUI.selectedEventId;
export const selectEventsViewMode = (state: RootState) => state.eventsUI.viewMode;
export const selectEventsSortBy = (state: RootState) => state.eventsUI.sortBy;
export const selectEventsSortOrder = (state: RootState) => state.eventsUI.sortOrder;

export default eventsUISlice.reducer;
```

### 3. Hybrid Hook (`use{Feature}Hybrid.ts`)

The hybrid hook combines React Query and Redux:

```typescript
// src/features/events/hooks/useEventsHybrid.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { eventsApi } from '../api/eventsApi';
import {
  selectEventFilters,
  selectSelectedEventId,
  selectEventsViewMode,
  selectEventsSortBy,
  selectEventsSortOrder,
  updateFilters,
  clearFilters,
  setSelectedEvent,
  setViewMode,
  setSortBy,
  setSortOrder,
} from '../store/eventsUISlice';
import { Event } from '../types';
import { queryKeys } from '@/config/queryClient';

export function useEventsHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // UI state from Redux
  const filters = useAppSelector(selectEventFilters);
  const selectedEventId = useAppSelector(selectSelectedEventId);
  const viewMode = useAppSelector(selectEventsViewMode);
  const sortBy = useAppSelector(selectEventsSortBy);
  const sortOrder = useAppSelector(selectEventsSortOrder);
  
  // React Query for server state
  const eventsQuery = useQuery({
    queryKey: queryKeys.eventsWithFilters(filters),
    queryFn: () => eventsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get single event
  const getEvent = (id: string) => {
    return useQuery({
      queryKey: queryKeys.event(id),
      queryFn: () => eventsApi.getById(id),
      enabled: !!id,
    });
  };
  
  // Mutations
  const createEvent = useMutation({
    mutationFn: (data: Partial<Event>) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
    },
  });
  
  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      eventsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
    },
  });
  
  const deleteEvent = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
    },
  });
  
  // UI actions
  const setSearchTerm = (search?: string) => {
    dispatch(updateFilters({ search }));
  };
  
  const setEventTypes = (types?: string[]) => {
    dispatch(updateFilters({ types }));
  };
  
  const resetFilters = () => {
    dispatch(clearFilters());
  };
  
  // Sort events based on UI state
  const sortedEvents = [...(eventsQuery.data || [])].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return {
    // Data from React Query
    events: sortedEvents,
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    
    // UI state from Redux
    filters,
    selectedEventId,
    viewMode,
    sortBy,
    sortOrder,
    
    // Actions for UI state
    setSearchTerm,
    setEventTypes,
    resetFilters,
    setSelectedEvent: (id: string | null) => dispatch(setSelectedEvent(id)),
    setViewMode: (mode: 'grid' | 'list') => dispatch(setViewMode(mode)),
    setSortBy: (by: 'date' | 'title') => dispatch(setSortBy(by)),
    setSortOrder: (order: 'asc' | 'desc') => dispatch(setSortOrder(order)),
    
    // Query functions
    getEvent,
    refetch: eventsQuery.refetch,
    
    // Mutations
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
```

### 4. Query Keys Configuration

Standardized query keys for consistent caching:

```typescript
// src/config/queryClient.ts
export const queryKeys = {
  // Events
  events: ['events'] as const,
  eventsWithFilters: (filters: Record<string, any>) => ['events', 'filtered', filters] as const,
  event: (id: string) => ['events', id] as const,
  featuredEvents: ['events', 'featured'] as const,
  
  // Add other features...
};
```

## 🎯 Usage in Components

### Page Components

```typescript
// src/pages/EventsPage.tsx
export default function EventsPage() {
  const {
    events,
    isLoading,
    error,
    filters,
    setSearchTerm,
    setViewMode,
    viewMode
  } = useEventsHybrid();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <SearchBar value={filters.search} onChange={setSearchTerm} />
      <ViewToggle value={viewMode} onChange={setViewMode} />
      <EventsList events={events} />
    </div>
  );
}
```

### List Components

List components can accept parent data or use the hybrid hook:

```typescript
interface EventsListProps {
  events?: Event[];
  loading?: boolean;
  error?: Error;
}

export default function EventsList({ 
  events: parentEvents,
  loading: parentLoading,
  error: parentError 
}: EventsListProps) {
  const useParentData = parentEvents !== undefined;
  
  // Only use hybrid hook if no parent data provided
  const { events, isLoading, error } = useEventsHybrid();
  
  const finalEvents = useParentData ? parentEvents : events;
  const finalLoading = useParentData ? parentLoading : isLoading;
  const finalError = useParentData ? parentError : error;
  
  // Component implementation...
}
```

## 📝 Development Guidelines

### DO ✅

1. **Use hybrid hooks in page components**
2. **Store only UI state in Redux slices**
3. **Use React Query for all server operations**
4. **Follow consistent naming patterns**
5. **Implement proper error handling**
6. **Use TypeScript interfaces for type safety**

### DON'T ❌

1. **Never store server data in Redux**
2. **Don't mix server state and UI state**
3. **Don't bypass the hybrid hook**
4. **Avoid direct API calls in components**
5. **Don't forget cache invalidation**

## 🧪 Testing Pattern

```typescript
// Test utilities support hybrid pattern
import { render } from '@/utils/testUtils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

test('component renders with hybrid hook', () => {
  render(
    <QueryClientProvider client={mockQueryClient}>
      <EventsPage />
    </QueryClientProvider>
  );
});
```

## 🔄 Migration Checklist

When creating a new feature or migrating an existing one:

1. ✅ Create API layer with standard CRUD methods
2. ✅ Create UI slice with only client state
3. ✅ Create hybrid hook combining both
4. ✅ Add query keys to configuration
5. ✅ Update components to use hybrid hook
6. ✅ Add to store configuration
7. ✅ Update test utilities if needed
8. ✅ Remove old Redux slices storing server data

## 📊 Current Implementation Status

| Feature | API Layer | UI Slice | Hybrid Hook | Status |
|---------|-----------|----------|-------------|---------|
| Events | ✅ | ✅ | ✅ | Complete |
| Companies | ✅ | ✅ | ✅ | Complete |
| Members | ✅ | ✅ | ✅ | Complete |
| News | ✅ | ✅ | ✅ | Complete |
| Groups | ✅ | ✅ | ✅ | Complete |
| Opportunities | ✅ | ✅ | ✅ | Complete |
| Marketplace | ✅ | ✅ | ✅ | Complete |
| Gallery | ✅ | ✅ | ⚠️ | UI cleanup needed |

## 🚀 Benefits Achieved

- **Consistency**: All features follow the same pattern
- **Performance**: Optimized caching and state management
- **Developer Experience**: Predictable API across features
- **Type Safety**: Full TypeScript support
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features

## 📚 References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Project Query Keys](https://github.com/iaminawe/uluntu/blob/main/src/config/queryClient.ts)
- [Store Configuration](https://github.com/iaminawe/uluntu/blob/main/src/store/index.ts)
- [Example Implementation](https://github.com/iaminawe/uluntu/tree/main/src/features/events/)

---

This hybrid pattern represents the architectural standard for the Uluntu. All new features should follow this pattern, and any existing code should be migrated to maintain consistency.