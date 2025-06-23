# Hybrid State Architecture (Redux + React Query)

## Overview

This document outlines the hybrid state management approach implemented for the Nelson Tech application, combining React Query for server state management and Redux for complex UI state management.

## Architecture Principles

### 1. **React Query for Server State**
- All data fetching, caching, and synchronization
- Automatic background refetching
- Optimistic updates
- Request deduplication
- Cache invalidation

### 2. **Redux for UI State**
- Complex multi-component state (selections, filters)
- UI workflows (multi-step forms, wizards)
- Application-wide UI preferences
- Ephemeral state that doesn't persist

### 3. **Local State for Simple UI**
- Component-specific toggles
- Form inputs without validation
- Hover states, tooltips
- Animation states

## Implementation Patterns

### Gallery Feature Example

#### Data Layer (React Query)
```typescript
// src/features/gallery/hooks/useGalleryQueries.ts
export function useGalleries(filters?: GalleryFilters) {
  return useQuery({
    queryKey: ['galleries', filters],
    queryFn: () => galleryApi.getAllGalleries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

#### UI State Layer (Redux)
```typescript
// src/features/gallery/store/galleryUISlice.ts
const galleryUISlice = createSlice({
  name: 'galleryUI',
  initialState: {
    selectedPhotos: [],
    uploadProgress: {},
    viewMode: 'grid',
    filters: {},
    lightbox: { isOpen: false, currentIndex: 0 }
  },
  reducers: {
    togglePhotoSelection: (state, action) => {
      // Selection logic
    },
    setUploadProgress: (state, action) => {
      // Progress tracking
    }
  }
});
```

#### Hybrid Hook (Combining Both)
```typescript
// src/features/gallery/hooks/useGalleryHybrid.ts
export const useGalleryHybrid = (galleryId?: string) => {
  // React Query for data
  const galleriesQuery = useGalleries();
  const photosQuery = useGalleryPhotos(galleryId);
  
  // Redux for UI state
  const selectedPhotos = useAppSelector(selectSelectedPhotos);
  const uploadProgress = useAppSelector(selectUploadProgress);
  
  // Combined actions
  const uploadPhoto = async (input) => {
    // Update Redux progress state
    dispatch(setUploadProgress({ id, progress: 0 }));
    
    // Execute React Query mutation
    const photo = await uploadMutation.mutateAsync(input);
    
    // Update Redux on completion
    dispatch(setUploadProgress({ id, progress: 100 }));
    
    return photo;
  };
  
  return {
    // Data
    galleries: galleriesQuery.data,
    photos: photosQuery.data,
    
    // UI State
    selectedPhotos,
    uploadProgress,
    
    // Actions
    uploadPhoto,
    toggleSelection
  };
};
```

## Migration Guide

### Step 1: Identify State Categories
```typescript
// Server State (move to React Query)
- User data
- Gallery listings
- Photo metadata
- API responses

// UI State (keep in Redux)
- Selected items
- Filter/sort preferences
- Modal/dialog states
- Multi-step form progress

// Local State (use useState)
- Input field values
- Dropdown open/closed
- Hover states
```

### Step 2: Create React Query Hooks
```typescript
// Before (Redux Thunk)
export const fetchCompanies = createAsyncThunk(
  'companies/fetch',
  async () => {
    const data = await api.getCompanies();
    return data;
  }
);

// After (React Query)
export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: api.getCompanies
  });
}
```

### Step 3: Refactor Redux Slices
```typescript
// Before (Mixed concerns)
const slice = createSlice({
  name: 'companies',
  initialState: {
    companies: [],      // Server data
    loading: false,     // Server state
    filters: {},        // UI state
    selectedIds: []     // UI state
  }
});

// After (UI only)
const uiSlice = createSlice({
  name: 'companiesUI',
  initialState: {
    filters: {},
    selectedIds: []
  }
});
```

### Step 4: Create Hybrid Hooks
```typescript
export function useCompaniesHybrid() {
  // Data from React Query
  const { data: companies, isLoading } = useCompanies();
  
  // UI state from Redux
  const filters = useAppSelector(selectCompanyFilters);
  const selectedIds = useAppSelector(selectSelectedCompanies);
  
  // Filtered data (computed)
  const filteredCompanies = useMemo(() => {
    return applyFilters(companies, filters);
  }, [companies, filters]);
  
  return {
    companies: filteredCompanies,
    isLoading,
    selectedIds,
    // ... actions
  };
}
```

## Common Patterns

### 1. Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: api.updatePhoto,
  onMutate: async (newData) => {
    // Cancel queries
    await queryClient.cancelQueries(['photos']);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['photos']);
    
    // Optimistically update
    queryClient.setQueryData(['photos'], old => {
      return updateInPlace(old, newData);
    });
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['photos'], context.previous);
  }
});
```

### 2. Synchronized Filters
```typescript
function useFilteredData() {
  const filters = useAppSelector(selectFilters);
  const debouncedFilters = useDebounce(filters, 500);
  
  return useQuery({
    queryKey: ['data', debouncedFilters],
    queryFn: () => api.getData(debouncedFilters)
  });
}
```

### 3. Progress Tracking
```typescript
function useUploadWithProgress() {
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async (file) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        dispatch(updateProgress({
          id: file.id,
          progress: (e.loaded / e.total) * 100
        }));
      };
      
      return uploadFile(file, xhr);
    }
  });
}
```

## Performance Considerations

### 1. Query Key Strategy
```typescript
// Hierarchical keys for efficient invalidation
const keys = {
  all: ['galleries'],
  lists: () => [...keys.all, 'list'],
  list: (filters) => [...keys.lists(), filters],
  details: () => [...keys.all, 'detail'],
  detail: (id) => [...keys.details(), id]
};

// Invalidate all gallery lists
queryClient.invalidateQueries({ queryKey: keys.lists() });

// Invalidate specific gallery
queryClient.invalidateQueries({ queryKey: keys.detail(id) });
```

### 2. Selective Subscriptions
```typescript
// Only subscribe to needed state
const selectedCount = useAppSelector(state => 
  state.ui.selectedPhotos.length
);

// Instead of subscribing to entire array
const selectedPhotos = useAppSelector(state => 
  state.ui.selectedPhotos
);
```

### 3. Memoization
```typescript
const expensiveFilter = useMemo(() => {
  return photos.filter(photo => 
    matchesComplexCriteria(photo, filters)
  );
}, [photos, filters]);
```

## Testing Strategy

### React Query Mocking
```typescript
const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  }
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={mockQueryClient}>
    {children}
  </QueryClientProvider>
);

test('loads galleries', async () => {
  const { result } = renderHook(() => useGalleries(), { wrapper });
  
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
});
```

### Redux Testing
```typescript
test('toggles photo selection', () => {
  const state = galleryUIReducer(initialState, 
    togglePhotoSelection('photo-1')
  );
  
  expect(state.selectedPhotos).toContain('photo-1');
});
```

## Best Practices

1. **Keep Redux slices focused on UI state only**
2. **Use React Query for all server state**
3. **Create hybrid hooks for complex features**
4. **Implement proper error boundaries**
5. **Use optimistic updates for better UX**
6. **Leverage React Query's caching strategies**
7. **Memoize expensive computations**
8. **Use TypeScript for type safety**

## Benefits

- **Better Performance**: React Query's intelligent caching
- **Simpler Code**: Clear separation of concerns
- **Better DX**: Less boilerplate, more declarative
- **Automatic Features**: Background refetch, request deduplication
- **Type Safety**: Full TypeScript support
- **Testability**: Easier to test isolated concerns