# Hybrid Architecture Migration Guide

## Overview
This guide provides step-by-step instructions for migrating existing Redux-based features to the hybrid Redux + React Query architecture.

## Migration Checklist

### Phase 1: Analysis
- [ ] Identify all state in the Redux slice
- [ ] Categorize state as server data vs UI state
- [ ] Map all async thunks to potential React Query hooks
- [ ] Identify cross-component UI state dependencies

### Phase 2: Implementation
- [ ] Create React Query hooks for data fetching
- [ ] Create new UI-only Redux slice
- [ ] Build hybrid hook combining both
- [ ] Update components to use hybrid hook
- [ ] Remove old Redux slice

### Phase 3: Testing
- [ ] Test data fetching and caching
- [ ] Verify UI state management
- [ ] Check error handling
- [ ] Validate optimistic updates
- [ ] Performance benchmarking

## Feature-Specific Migration Plans

### 1. Companies Feature

#### Current State Analysis
```typescript
// Current Redux slice has:
- companies: Company[]        // SERVER DATA
- currentCompany: Company     // SERVER DATA
- filteredCompanies: Company[] // COMPUTED DATA
- filters: CompanyFilters     // UI STATE
- status: LoadingStatus       // SERVER STATE
- error: string              // SERVER STATE
```

#### Migration Steps

**Step 1: Create React Query Hooks**
```typescript
// src/features/companies/hooks/useCompanyQueries.ts
export const companyQueryKeys = {
  all: ['companies'] as const,
  lists: () => [...companyQueryKeys.all, 'list'] as const,
  list: (filters?: CompanyFilters) => [...companyQueryKeys.lists(), { filters }] as const,
  details: () => [...companyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyQueryKeys.details(), id] as const,
};

export function useCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: companyQueryKeys.list(filters),
    queryFn: () => companiesApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompany(id?: string) {
  return useQuery({
    queryKey: companyQueryKeys.detail(id!),
    queryFn: () => companiesApi.getById(id!),
    enabled: !!id,
  });
}
```

**Step 2: Create UI Redux Slice**
```typescript
// src/features/companies/store/companiesUISlice.ts
interface CompaniesUIState {
  filters: CompanyFilters;
  selectedCompanyIds: string[];
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'industry' | 'size';
}

const companiesUISlice = createSlice({
  name: 'companiesUI',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    toggleCompanySelection: (state, action) => {
      // Selection logic
    }
  }
});
```

**Step 3: Create Hybrid Hook**
```typescript
// src/features/companies/hooks/useCompaniesHybrid.ts
export function useCompaniesHybrid() {
  // React Query
  const filters = useAppSelector(selectCompanyFilters);
  const { data: companies, isLoading } = useCompanies(filters);
  
  // Redux UI State
  const selectedIds = useAppSelector(selectSelectedCompanies);
  const viewMode = useAppSelector(selectViewMode);
  
  // Actions
  const dispatch = useAppDispatch();
  const updateFilters = useCallback((filters) => {
    dispatch(setFilters(filters));
  }, [dispatch]);
  
  return {
    companies,
    isLoading,
    selectedIds,
    viewMode,
    updateFilters,
    // ... other actions
  };
}
```

### 2. Members/Directory Feature

#### Current State Analysis
```typescript
// Current Redux slice has:
- members: Member[]           // SERVER DATA
- filteredMembers: Member[]   // COMPUTED DATA
- searchTerm: string         // UI STATE
- filterOptions: FilterOpts   // UI STATE
- selectedMemberIds: string[] // UI STATE
- viewPreferences: ViewPrefs  // UI STATE
```

#### Migration Steps

**Step 1: Create React Query Hooks**
```typescript
// src/features/directory/hooks/useMemberQueries.ts
export function useMembers(filters?: MemberFilters) {
  return useQuery({
    queryKey: ['members', filters],
    queryFn: () => membersApi.getAll(filters),
  });
}

export function useMemberSearch(searchTerm: string) {
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  return useQuery({
    queryKey: ['members', 'search', debouncedSearch],
    queryFn: () => membersApi.search(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });
}
```

**Step 2: Create UI Slice**
```typescript
// src/features/directory/store/directoryUISlice.ts
interface DirectoryUIState {
  searchTerm: string;
  filters: {
    skills: string[];
    location: string;
    industry: string;
  };
  selectedMemberIds: string[];
  viewMode: 'cards' | 'list' | 'compact';
  showFilters: boolean;
}
```

### 3. Events Feature

#### Current State Analysis
```typescript
// Current Redux slice has:
- events: Event[]            // SERVER DATA
- upcomingEvents: Event[]    // COMPUTED DATA
- pastEvents: Event[]        // COMPUTED DATA
- selectedEvent: Event       // SERVER DATA
- filters: EventFilters      // UI STATE
- calendarView: CalendarView // UI STATE
- registrations: Registration[] // SERVER DATA
```

#### Migration Steps

**Step 1: Split Data Queries**
```typescript
// src/features/events/hooks/useEventQueries.ts
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.getAll(filters),
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsApi.getUpcoming(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useEventRegistrations(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'registrations'],
    queryFn: () => eventsApi.getRegistrations(eventId),
  });
}
```

**Step 2: Complex UI State**
```typescript
// src/features/events/store/eventsUISlice.ts
interface EventsUIState {
  filters: EventFilters;
  calendarView: {
    mode: 'month' | 'week' | 'day' | 'list';
    currentDate: string;
    selectedCategories: string[];
  };
  registrationForm: {
    eventId: string | null;
    step: number;
    data: Partial<RegistrationData>;
  };
}
```

## Common Migration Patterns

### Pattern 1: Filter State Migration
```typescript
// Before: Mixed in Redux
const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    filters: { category: '', date: '' },
    filteredEvents: []
  },
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload;
      state.filteredEvents = applyFilters(state.events, state.filters);
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.filteredEvents = applyFilters(state.events, state.filters);
    }
  }
});

// After: Separated concerns
// UI Slice - Only filters
const eventsUISlice = createSlice({
  name: 'eventsUI',
  initialState: { filters: { category: '', date: '' } },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    }
  }
});

// React Query - Data with filters
function useFilteredEvents() {
  const filters = useAppSelector(selectEventFilters);
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.getAll(filters)
  });
}
```

### Pattern 2: Selection State
```typescript
// Keep selections in Redux (UI state)
const selectionSlice = createSlice({
  name: 'selection',
  initialState: {
    selectedIds: new Set<string>()
  },
  reducers: {
    toggleSelection: (state, action) => {
      const id = action.payload;
      if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id);
      } else {
        state.selectedIds.add(id);
      }
    }
  }
});

// Combine with React Query data
function useSelectableItems() {
  const { data: items } = useItems();
  const selectedIds = useAppSelector(selectSelectedIds);
  
  const selectedItems = items?.filter(item => 
    selectedIds.includes(item.id)
  );
  
  return { items, selectedItems, selectedIds };
}
```

### Pattern 3: Form State
```typescript
// Complex forms stay in Redux
const formSlice = createSlice({
  name: 'eventRegistration',
  initialState: {
    currentStep: 1,
    formData: {},
    validationErrors: {}
  }
});

// Simple forms use local state
function SimpleContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const mutation = useSubmitContact();
  
  const handleSubmit = () => {
    mutation.mutate(formData);
  };
}
```

## Testing Migration

### Unit Tests
```typescript
// Test React Query hooks
describe('useCompanies', () => {
  it('fetches companies with filters', async () => {
    const { result } = renderHook(
      () => useCompanies({ industry: 'tech' }),
      { wrapper: createQueryWrapper() }
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toHaveLength(3);
  });
});

// Test UI Redux slices
describe('companiesUISlice', () => {
  it('updates filters', () => {
    const state = companiesUIReducer(
      initialState,
      setFilters({ industry: 'tech' })
    );
    
    expect(state.filters.industry).toBe('tech');
  });
});
```

### Integration Tests
```typescript
describe('Companies Feature', () => {
  it('filters and selects companies', async () => {
    const { getByRole, getByText } = render(
      <CompaniesPage />,
      { wrapper: createAppWrapper() }
    );
    
    // Change filter
    fireEvent.change(getByRole('combobox'), {
      target: { value: 'tech' }
    });
    
    // Wait for filtered results
    await waitFor(() => {
      expect(getByText('Tech Corp')).toBeInTheDocument();
    });
    
    // Select company
    fireEvent.click(getByRole('checkbox'));
    
    expect(store.getState().companiesUI.selectedIds).toContain('1');
  });
});
```

## Performance Metrics

Track these metrics before and after migration:

1. **Initial Load Time**
   - Time to first meaningful paint
   - Time to interactive

2. **Data Fetching**
   - Number of API calls
   - Cache hit rate
   - Background refetch frequency

3. **Memory Usage**
   - Redux store size
   - React Query cache size
   - Component re-renders

4. **User Interactions**
   - Filter response time
   - Selection state updates
   - Form submission time

Use the performance benchmark utility:
```typescript
import { benchmark } from '@/utils/performanceBenchmark';

// Before migration
benchmark.start('redux-filter-update');
dispatch(setFilters(newFilters));
dispatch(fetchFilteredData());
benchmark.end('redux-filter-update');

// After migration
benchmark.start('hybrid-filter-update');
dispatch(setFilters(newFilters)); // Instant UI update
// React Query automatically refetches
benchmark.end('hybrid-filter-update');

// Compare results
const improvement = benchmark.compare(
  'redux-filter-update',
  'hybrid-filter-update'
);
console.log(`Performance improved by ${improvement.improvement}%`);
```

## Rollback Plan

If issues arise during migration:

1. **Feature flags**: Use feature flags to toggle between old and new implementations
2. **Gradual rollout**: Migrate one component at a time
3. **A/B testing**: Run both versions in parallel for comparison
4. **Quick revert**: Keep old Redux slices until new implementation is stable

## Success Criteria

Migration is complete when:
- [ ] All server data fetched via React Query
- [ ] Redux only contains UI state
- [ ] No duplicate data between Redux and React Query
- [ ] Performance metrics show improvement
- [ ] All tests passing
- [ ] No increase in bundle size > 10%