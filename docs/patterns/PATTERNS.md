# Nelson Tech Community Platform - Code Patterns & Standards

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Organization](#file-organization)
3. [Component Patterns](#component-patterns)
4. [State Management Patterns](#state-management-patterns)
5. [API Service Patterns](#api-service-patterns)
6. [Hook Patterns](#hook-patterns)
7. [Testing Patterns](#testing-patterns)
8. [Error Handling Patterns](#error-handling-patterns)
9. [Type Safety Patterns](#type-safety-patterns)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## Architecture Overview

The Nelson Tech platform follows a **feature-based architecture** with clear separation of concerns:

```
src/
├── features/         # Feature modules (self-contained)
├── shared/          # Shared utilities and components
├── pages/           # Route pages (thin orchestration layer)
├── store/           # Redux store configuration
└── lib/             # External library configurations
```

### Key Principles

1. **Feature Independence**: Each feature should be self-contained
2. **Single Source of Truth**: Use centralized configuration
3. **Consistent Patterns**: Follow established patterns across all features
4. **Type Safety**: TypeScript for all code
5. **Test Coverage**: Maintain high test coverage

## File Organization

### Feature Module Structure

Every feature MUST follow this structure:

```
features/[feature-name]/
├── api/                 # API service layer
│   └── [feature]Api.ts
├── components/         # Feature-specific components
│   ├── [Component]/
│   │   ├── index.tsx
│   │   ├── types.ts
│   │   └── __tests__/
├── hooks/              # Custom React hooks
│   └── use[Feature]Redux.ts
├── store/              # Redux slice
│   └── [feature]Slice.ts
├── types/              # TypeScript types
│   └── [feature].ts
├── utils/              # Feature utilities
└── index.ts            # Public API exports
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **API Services**: camelCase with 'Api' suffix (e.g., `marketplaceApi.ts`)
- **Redux Slices**: camelCase with 'Slice' suffix (e.g., `authSlice.ts`)
- **Types**: PascalCase (e.g., `MarketplaceListing`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

## Component Patterns

### Page Component Pattern

Pages should be thin orchestration layers that compose feature components:

```typescript
// pages/MarketplaceDetailPage/index.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMarketplaceListingByIdRedux } from '@/features/marketplace/hooks/useMarketplaceRedux';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import DetailContent from './DetailContent';

export default function MarketplaceDetailPage() {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  
  const { 
    listing, 
    isLoading, 
    error,
    fetchListing
  } = useMarketplaceListingByIdRedux(id || '');
  
  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id, fetchListing]);
  
  if (isLoading) return <LoadingState />;
  if (error || !listing) return <ErrorState error={error} />;
  
  return (
    <>
      <Helmet>
        <title>{listing.title} - Nelson Tech</title>
        <meta name="description" content={listing.description} />
      </Helmet>
      
      <ContentContainer>
        <DetailContent 
          listing={listing}
          onAction={() => setShowModal(true)}
        />
      </ContentContainer>
    </>
  );
}
```

### Feature Component Pattern

Feature components should be focused and reusable:

```typescript
// features/marketplace/components/ListingCard/index.tsx
import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';
import { formatCurrency, formatDate } from '@/shared/utils';
import { MarketplaceListing } from '../../types';
import { ListingCardProps } from './types';

export default function ListingCard({ 
  listing, 
  onAction,
  variant = 'default' 
}: ListingCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onAction?.(listing);
  };
  
  return (
    <Card className={`listing-card listing-card--${variant}`}>
      <Link to={`/marketplace/${listing.id}`}>
        <img 
          src={listing.images?.[0] || '/placeholder.jpg'}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold">{listing.title}</h3>
        <p className="text-gray-600 mt-2">{formatCurrency(listing.price)}</p>
        <p className="text-sm text-gray-500">{formatDate(listing.createdAt)}</p>
        
        {onAction && (
          <button
            onClick={handleClick}
            className="mt-4 btn btn-primary"
          >
            View Details
          </button>
        )}
      </div>
    </Card>
  );
}
```

## State Management Patterns

### Redux Slice Pattern

All Redux slices MUST follow this pattern:

```typescript
// features/[feature]/store/[feature]Slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { [feature]Api } from '../api/[feature]Api';
import { RootState } from '@/store';
import { getIsSupabaseEnabled } from '@/config/env';
import mockData from '@/data/mock/mockData';

// State interface
export interface [Feature]State {
  items: [Feature]Item[];
  currentItem: [Feature]Item | null;
  filters: [Feature]Filters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: [Feature]State = {
  items: [],
  currentItem: null,
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks - ALWAYS use getIsSupabaseEnabled()
export const fetch[Feature]Items = createAsyncThunk(
  '[feature]/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      if (getIsSupabaseEnabled()) {
        return await [feature]Api.getAll();
      } else {
        // Use mock data with proper adaptation
        return mockData.[feature]Items.map(adapt[Feature]Item);
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch items'
      );
    }
  }
);

// Slice definition
const [feature]Slice = createSlice({
  name: '[feature]',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<[Feature]Filters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetch[Feature]Items.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetch[Feature]Items.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetch[Feature]Items.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setFilters, clearError } = [feature]Slice.actions;

// Selectors
export const selectAll[Feature]Items = (state: RootState) => state.[feature].items;
export const select[Feature]Status = (state: RootState) => state.[feature].status;
export const select[Feature]Error = (state: RootState) => state.[feature].error;

export default [feature]Slice.reducer;
```

### Critical: Environment Configuration Usage

**NEVER** check `import.meta.env.VITE_USE_SUPABASE` directly in Redux slices. **ALWAYS** use:

```typescript
import { getIsSupabaseEnabled } from '@/config/env';

// In async thunks
if (getIsSupabaseEnabled()) {
  // Use Supabase
} else {
  // Use mock data
}
```

## API Service Patterns

### API Service Structure

```typescript
// features/[feature]/api/[feature]Api.ts
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { adapt[Feature]FromSupabase, adapt[Feature]ToSupabase } from '../adapters';
import { [Feature]Item, [Feature]Input } from '../types';

export const [feature]Api = {
  async getAll(filters?: [Feature]Filters): Promise<[Feature]Item[]> {
    try {
      let query = supabase
        .from('[feature]_table')
        .select('*, related_table(*)');
      
      // Apply filters
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw handleSupabaseError(error);
      
      return (data || []).map(adapt[Feature]FromSupabase);
    } catch (error) {
      console.error('Error fetching [feature] items:', error);
      throw error;
    }
  },
  
  async getById(id: string): Promise<[Feature]Item | null> {
    try {
      const { data, error } = await supabase
        .from('[feature]_table')
        .select('*, related_table(*)')
        .eq('id', id)
        .single();
      
      if (error) throw handleSupabaseError(error);
      
      return data ? adapt[Feature]FromSupabase(data) : null;
    } catch (error) {
      console.error('Error fetching [feature] item:', error);
      return null;
    }
  },
  
  async create(input: [Feature]Input): Promise<[Feature]Item> {
    try {
      const supabaseData = adapt[Feature]ToSupabase(input);
      
      const { data, error } = await supabase
        .from('[feature]_table')
        .insert(supabaseData)
        .select()
        .single();
      
      if (error) throw handleSupabaseError(error);
      
      return adapt[Feature]FromSupabase(data);
    } catch (error) {
      console.error('Error creating [feature] item:', error);
      throw error;
    }
  },
  
  async update(id: string, input: Partial<[Feature]Input>): Promise<[Feature]Item> {
    try {
      const supabaseData = adapt[Feature]ToSupabase(input);
      
      const { data, error } = await supabase
        .from('[feature]_table')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw handleSupabaseError(error);
      
      return adapt[Feature]FromSupabase(data);
    } catch (error) {
      console.error('Error updating [feature] item:', error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('[feature]_table')
        .delete()
        .eq('id', id);
      
      if (error) throw handleSupabaseError(error);
      
      return true;
    } catch (error) {
      console.error('Error deleting [feature] item:', error);
      return false;
    }
  }
};
```

## Hook Patterns

### Redux Hook Pattern

```typescript
// features/[feature]/hooks/use[Feature]Redux.ts
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAll[Feature]Items,
  select[Feature]Status,
  select[Feature]Error,
  fetch[Feature]Items,
  create[Feature]Item,
  update[Feature]Item,
  delete[Feature]Item
} from '../store/[feature]Slice';
import { [Feature]Input } from '../api/[feature]Api';

export function use[Feature]ItemsRedux() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAll[Feature]Items);
  const status = useAppSelector(select[Feature]Status);
  const error = useAppSelector(select[Feature]Error);
  
  const fetchItems = useCallback(() => {
    return dispatch(fetch[Feature]Items());
  }, [dispatch]);
  
  const createItem = useCallback((data: [Feature]Input) => {
    return dispatch(create[Feature]Item(data)).unwrap();
  }, [dispatch]);
  
  const updateItem = useCallback((id: string, data: Partial<[Feature]Input>) => {
    return dispatch(update[Feature]Item({ id, data })).unwrap();
  }, [dispatch]);
  
  const deleteItem = useCallback((id: string) => {
    return dispatch(delete[Feature]Item(id)).unwrap();
  }, [dispatch]);
  
  // Fetch on mount if needed
  useEffect(() => {
    if (status === 'idle') {
      fetchItems();
    }
  }, [status, fetchItems]);
  
  return {
    items,
    isLoading: status === 'loading',
    isError: status === 'failed',
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
}
```

## Testing Patterns

### Component Test Pattern

```typescript
// features/[feature]/components/__tests__/[Component].test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import [Component] from '../[Component]';
import [feature]Reducer from '../../store/[feature]Slice';

// Test utilities
const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { [feature]: [feature]Reducer },
      preloadedState
    }),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
  
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock data
const mock[Feature]Item = {
  id: '1',
  title: 'Test Item',
  description: 'Test description',
  // ... other fields
};

describe('[Component]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Rendering', () => {
    it('should render component with data', () => {
      renderWithProviders(
        <[Component] item={mock[Feature]Item} />
      );
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
    
    it('should handle loading state', () => {
      renderWithProviders(
        <[Component] isLoading />
      );
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
    
    it('should handle error state', () => {
      renderWithProviders(
        <[Component] error="Failed to load" />
      );
      
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    });
  });
  
  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const mockOnClick = jest.fn();
      renderWithProviders(
        <[Component] item={mock[Feature]Item} onClick={mockOnClick} />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledWith(mock[Feature]Item);
      });
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle missing data gracefully', () => {
      renderWithProviders(
        <[Component] item={null} />
      );
      
      expect(screen.getByText(/No data available/)).toBeInTheDocument();
    });
  });
});
```

## Error Handling Patterns

### Consistent Error Handling

```typescript
// shared/utils/errorHandling.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }
  
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR');
}

// In API services
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw new AppError(error.message, error.code);
  return data;
} catch (error) {
  throw handleApiError(error);
}
```

## Type Safety Patterns

### Strict Type Definitions

```typescript
// features/[feature]/types/index.ts

// Database types (matches Supabase schema)
export interface [Feature]Database {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  // ... other fields
}

// Application types (used in UI)
export interface [Feature]Item {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  status: [Feature]Status;
  // ... other fields
}

// Input types (for forms/creation)
export interface [Feature]Input {
  title: string;
  description?: string;
  status?: [Feature]Status;
  // ... other fields
}

// Enum types
export type [Feature]Status = 'draft' | 'published' | 'archived';

// Props types for components
export interface [Feature]CardProps {
  item: [Feature]Item;
  onClick?: (item: [Feature]Item) => void;
  variant?: 'default' | 'compact';
}
```

## Anti-Patterns to Avoid

### 1. Direct Environment Variable Checking in Redux

❌ **WRONG**:
```typescript
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';
```

✅ **CORRECT**:
```typescript
import { getIsSupabaseEnabled } from '@/config/env';
if (getIsSupabaseEnabled()) { /* ... */ }
```

### 2. Inconsistent Data Fetching

❌ **WRONG**:
```typescript
// Fetching in multiple places
useEffect(() => {
  fetchData();
}, []);

// Also in onClick
const handleClick = () => {
  fetchData();
};
```

✅ **CORRECT**:
```typescript
// Single source of truth
const { fetchItems } = useItemsRedux();

useEffect(() => {
  fetchItems();
}, [fetchItems]);
```

### 3. Mixed Data Sources

❌ **WRONG**:
```typescript
// Using both Redux and React Query in same component
const { data: queryData } = useQuery();
const reduxData = useSelector(selectData);
const finalData = queryData || reduxData;
```

✅ **CORRECT**:
```typescript
// Use only Redux hooks
const { items, isLoading } = useItemsRedux();
```

### 4. Untyped API Responses

❌ **WRONG**:
```typescript
const { data } = await supabase.from('table').select();
return data; // any type
```

✅ **CORRECT**:
```typescript
const { data } = await supabase.from('table').select();
return (data || []).map(item => adaptFromSupabase(item as DatabaseType));
```

### 5. Prop Drilling

❌ **WRONG**:
```typescript
<Parent user={user} settings={settings}>
  <Child user={user} settings={settings}>
    <GrandChild user={user} settings={settings} />
  </Child>
</Parent>
```

✅ **CORRECT**:
```typescript
// Use Redux or Context
const { user, settings } = useAuth();
```

### 6. Inconsistent Error Handling

❌ **WRONG**:
```typescript
try {
  // ... code
} catch (e) {
  console.log(e);
  return null;
}
```

✅ **CORRECT**:
```typescript
try {
  // ... code
} catch (error) {
  console.error('[Feature] Error description:', error);
  throw handleApiError(error);
}
```

## Migration Checklist

When updating existing code to follow these patterns:

1. ✅ Update Redux slices to use `getIsSupabaseEnabled()`
2. ✅ Ensure consistent error handling with proper logging
3. ✅ Add proper TypeScript types for all data structures
4. ✅ Create proper adapters for data transformation
5. ✅ Update tests to use proper mocking patterns
6. ✅ Remove any direct `import.meta.env` checks
7. ✅ Consolidate duplicate data fetching logic
8. ✅ Add proper loading and error states
9. ✅ Ensure all async operations use try-catch
10. ✅ Document any deviations from patterns

## Resources

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supabase Documentation](https://supabase.com/docs)