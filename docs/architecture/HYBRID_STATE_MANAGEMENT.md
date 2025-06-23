# Hybrid State Management Architecture

## Overview

This document outlines the hybrid state management pattern implemented across the Kootenay Tech Community platform. This architecture combines React Query for server state with Redux for UI state, providing optimal performance, caching, and developer experience.

## 🎯 Core Principles

### 1. Separation of Concerns
- **React Query**: Handles all server state (API calls, caching, background updates, error handling)
- **Redux**: Manages UI-only state (filters, selections, view modes, pagination, form state)

### 2. Single Source of Truth
- Server data lives only in React Query cache
- UI state lives only in Redux store
- No duplication between the two systems

### 3. Performance Optimization
- React Query provides intelligent caching and background updates
- Redux provides predictable UI state management
- Code splitting with lazy loading for all pages

## 🏗️ Architecture Pattern

### High-Level Structure

```
┌─────────────────┐    ┌─────────────────┐
│   React Query   │    │     Redux       │
│  (Server State) │    │   (UI State)    │
├─────────────────┤    ├─────────────────┤
│ • API calls     │    │ • Filters       │
│ • Caching       │    │ • Selections    │
│ • Background    │    │ • View modes    │
│   updates       │    │ • Pagination    │
│ • Error states  │    │ • Form state    │
│ • Loading states│    │ • UI toggles    │
└─────────────────┘    └─────────────────┘
        │                       │
        └───────────┬───────────┘
                    │
            ┌───────▼───────┐
            │ Hybrid Hooks  │
            │ (Integration) │
            └───────────────┘
```

### Implementation Layers

#### 1. API Layer (React Query)
Located in: `/src/features/{feature}/api/`

```typescript
// Example: eventsApi.ts
export const useEvents = () => {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: eventsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEventsWithFilters = (filters?: EventFilters) => {
  return useQuery({
    queryKey: queryKeys.eventsWithFilters(filters || {}),
    queryFn: () => eventsApi.getAll(filters),
    enabled: !!filters,
  });
};
```

#### 2. UI State Layer (Redux)
Located in: `/src/features/{feature}/store/`

```typescript
// Example: eventsUISlice.ts
export interface EventsUIState {
  filters: EventFilters;
  selectedEvents: string[];
  viewMode: 'list' | 'calendar';
  sortBy: 'date' | 'title' | 'popularity';
  sortDirection: 'asc' | 'desc';
  pagination: {
    page: number;
    itemsPerPage: number;
  };
}

const eventsUISlice = createSlice({
  name: 'eventsUI',
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    toggleEventSelection: (state, action) => {
      const eventId = action.payload;
      const index = state.selectedEvents.indexOf(eventId);
      if (index > -1) {
        state.selectedEvents.splice(index, 1);
      } else {
        state.selectedEvents.push(eventId);
      }
    },
  },
});
```

#### 3. Integration Layer (Hybrid Hooks)
Located in: `/src/features/{feature}/hooks/`

```typescript
// Example: useEventsHybrid.ts
export function useEventsHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const filters = useAppSelector(selectEventsFilters);
  
  // React Query for server state
  const hasFilters = Object.keys(filters).length > 0;
  const eventsQuery = useEventsWithFilters(hasFilters ? filters : undefined);
  
  // Redux actions for UI state
  const updateFiltersAction = (newFilters: Partial<EventFilters>) => {
    dispatch(updateFilters(newFilters));
  };

  const setSearchTerm = (search?: string) => {
    updateFiltersAction({ search });
  };

  return {
    // Data from React Query
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    
    // UI state from Redux
    filters,
    
    // Actions
    setSearchTerm,
    updateFilters: updateFiltersAction,
  };
}
```

## 📋 Implementation Guidelines

### For List/Collection Features

1. **Create API hooks for different data access patterns:**
```typescript
// Basic list
export const useEvents = () => useQuery(/*...*/);

// Filtered list
export const useEventsWithFilters = (filters) => useQuery(/*...*/);

// Single item
export const useEvent = (id) => useQuery(/*...*/);

// Mutations
export const useCreateEvent = () => useMutation(/*...*/);
export const useUpdateEvent = () => useMutation(/*...*/);
export const useDeleteEvent = () => useMutation(/*...*/);
```

2. **Create UI slice for state that doesn't come from server:**
```typescript
interface FeatureUIState {
  filters: FilterType;
  selectedItems: string[];
  viewMode: 'list' | 'grid' | 'calendar';
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pagination: PaginationState;
}
```

3. **Create hybrid hook that combines both:**
```typescript
export function useFeatureHybrid() {
  // Get UI state from Redux
  const uiState = useAppSelector(selectFeatureUI);
  
  // Get server data from React Query based on UI state
  const dataQuery = useFeatureData(uiState.filters);
  
  // Provide actions to update UI state
  const actions = {
    setFilter: (filter) => dispatch(updateFilter(filter)),
    toggleSelection: (id) => dispatch(toggleSelection(id)),
  };
  
  return {
    // Server data
    data: dataQuery.data,
    isLoading: dataQuery.isLoading,
    error: dataQuery.error,
    
    // UI state
    ...uiState,
    
    // Actions
    ...actions,
  };
}
```

### For Components

#### Page Components
```typescript
export default function EventsPage() {
  // Use hybrid hook - no need to manage state manually
  const {
    events,
    isLoading,
    error,
    filters,
    setSearchTerm,
    setViewMode
  } = useEventsHybrid();
  
  return (
    <div>
      <SearchInput onSearch={setSearchTerm} />
      <ViewToggle onViewChange={setViewMode} />
      {isLoading ? <Loading /> : <EventsList events={events} />}
    </div>
  );
}
```

#### List Components (Flexible Pattern)
```typescript
interface EventsListProps {
  // Optional: allow parent to provide data
  events?: Event[];
  loading?: boolean;
  error?: Error;
}

export default function EventsList({ 
  events: parentEvents,
  loading: parentLoading,
  error: parentError 
}: EventsListProps) {
  // Determine data source
  const useParentData = parentEvents !== undefined;
  
  // Use hybrid hook only if no parent data provided
  const { events, isLoading, error } = useEventsHybrid();
  
  // Use appropriate data source
  const finalEvents = useParentData ? parentEvents : events;
  const finalLoading = useParentData ? parentLoading : isLoading;
  const finalError = useParentData ? parentError : error;
  
  // Render logic...
}
```

## 🔄 Data Flow

### Read Operations
```
User Interaction → UI State Update (Redux) → React Query Refetch → Component Re-render
```

1. User changes filter
2. Redux action updates filter state
3. Hybrid hook detects filter change
4. React Query automatically refetches with new filters
5. Component receives new data and re-renders

### Write Operations
```
User Action → Mutation (React Query) → Optimistic Update → Cache Invalidation → UI Update
```

1. User submits form
2. React Query mutation executes
3. Optimistic updates provide immediate feedback
4. On success, related queries are invalidated
5. Fresh data is fetched and UI updates

## 🚀 Performance Benefits

### React Query Advantages
- **Intelligent Caching**: Reduces API calls
- **Background Updates**: Keeps data fresh automatically
- **Request Deduplication**: Prevents duplicate requests
- **Optimistic Updates**: Improves perceived performance
- **Error Retry Logic**: Built-in resilience

### Redux Advantages
- **Predictable Updates**: UI state changes are deterministic
- **DevTools**: Excellent debugging experience
- **Time Travel**: Can replay state changes
- **Middleware**: Logging, persistence, etc.

### Combined Benefits
- **Separation of Concerns**: Clear responsibilities
- **Reduced Complexity**: No manual cache management
- **Better UX**: Faster perceived performance
- **Developer Experience**: Great debugging tools for both systems

## 🛠️ Development Tools

### React Query DevTools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to App.tsx in development
{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

### Redux DevTools
Already configured in store setup. Use browser extension for debugging.

## 📊 Migration from Legacy Patterns

### Before (Redux-only)
```typescript
// ❌ Old pattern - everything in Redux
const { events, isLoading, fetchEvents } = useEventsRedux();

useEffect(() => {
  fetchEvents(); // Manual fetching
}, []);
```

### After (Hybrid)
```typescript
// ✅ New pattern - automatic data management
const { events, isLoading } = useEventsHybrid();
// No manual fetching needed!
```

## 🧪 Testing Strategy

### Testing Hybrid Hooks
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <Provider store={testStore}>
        {children}
      </Provider>
    </QueryClientProvider>
  );
};

test('useEventsHybrid returns correct data', () => {
  const { result } = renderHook(() => useEventsHybrid(), {
    wrapper: createWrapper(),
  });
  
  expect(result.current.events).toEqual([]);
  expect(result.current.isLoading).toBe(true);
});
```

## 🔮 Future Enhancements

### Server-Side State Synchronization
- Real-time updates with WebSockets
- Optimistic updates for better UX
- Conflict resolution strategies

### Advanced Caching Strategies
- Background prefetching
- Stale-while-revalidate patterns
- Cache persistence across sessions

### Performance Monitoring
- Query performance metrics
- Cache hit/miss ratios
- Component render optimization

---

This hybrid architecture provides a solid foundation for scalable, maintainable, and performant React applications. Always refer to this document when implementing new features or refactoring existing code.