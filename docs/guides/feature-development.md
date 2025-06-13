# Feature Development Guide

This guide explains how to develop new features in the Nelson Tech platform using our feature-based architecture.

## Feature Structure

Each feature is self-contained in the `/src/features` directory with this structure:

```
src/features/[feature-name]/
├── api/              # API calls and data fetching
├── components/       # React components
├── hooks/            # Custom React hooks
├── store/            # Redux slices and actions
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
├── __tests__/        # Feature tests
└── index.ts          # Public API exports
```

## Creating a New Feature

### 1. Plan with SPARC

Start by planning your feature using SPARC methodology:

```bash
# Define requirements
npx claude-flow sparc run spec-pseudocode "Define [feature] requirements"

# Design architecture
npx claude-flow sparc run architect "Design [feature] architecture"
```

### 2. Create Feature Structure

```bash
# Create feature directory
mkdir -p src/features/[feature-name]/{api,components,hooks,store,types,utils,__tests__}

# Create index file
touch src/features/[feature-name]/index.ts
```

### 3. Define Types

Start with TypeScript types in `types/index.ts`:

```typescript
// Domain types
export interface Feature {
  id: string;
  name: string;
  // ... other properties
}

// API types
export interface CreateFeatureRequest {
  name: string;
  // ... other fields
}

// State types
export interface FeatureState {
  items: Feature[];
  loading: boolean;
  error: string | null;
}
```

### 4. Create API Layer

Implement API calls in `api/featureApi.ts`:

```typescript
import { supabase } from '@/shared/lib/supabase';
import { Feature, CreateFeatureRequest } from '../types';

export const featureApi = {
  async getAll(): Promise<Feature[]> {
    const { data, error } = await supabase
      .from('features')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async create(request: CreateFeatureRequest): Promise<Feature> {
    const { data, error } = await supabase
      .from('features')
      .insert(request)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

### 5. Create Hooks

Implement React Query hooks in `hooks/useFeatureQueries.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureApi } from '../api/featureApi';

const QUERY_KEY = ['features'];

export function useFeatures() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: featureApi.getAll
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: featureApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  });
}
```

### 6. Create Redux Slice (if needed)

For complex state management, create `store/featureSlice.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureState } from '../types';

const initialState: FeatureState = {
  items: [],
  loading: false,
  error: null
};

export const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Feature[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const { setItems, setLoading } = featureSlice.actions;
export default featureSlice.reducer;
```

### 7. Create Components

Build React components in `components/`:

```typescript
// components/FeatureList/index.tsx
import { useFeatures } from '../../hooks/useFeatureQueries';
import { FeatureCard } from './FeatureCard';

export function FeatureList() {
  const { data: features, isLoading, error } = useFeatures();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {features?.map(feature => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
```

### 8. Write Tests

Create tests in `__tests__/`:

```typescript
// __tests__/components/FeatureList.test.tsx
import { render, screen } from '@testing-library/react';
import { FeatureList } from '../components/FeatureList';

describe('FeatureList', () => {
  it('renders features', async () => {
    render(<FeatureList />);
    
    expect(await screen.findByText('Feature 1')).toBeInTheDocument();
  });
});
```

### 9. Export Public API

Define exports in `index.ts`:

```typescript
// Components
export { FeatureList } from './components/FeatureList';
export { FeatureDetail } from './components/FeatureDetail';

// Hooks
export { useFeatures, useCreateFeature } from './hooks/useFeatureQueries';

// Types
export type { Feature, FeatureState } from './types';

// Store (if using Redux)
export { featureSlice } from './store/featureSlice';
```

### 10. Create Page Component

Create a thin page component in `/src/pages/[feature]/`:

```typescript
import { FeatureList } from '@/features/[feature-name]';
import { PageLayout } from '@/shared/components/layout/PageLayout';

export default function FeaturePage() {
  return (
    <PageLayout title="Features">
      <FeatureList />
    </PageLayout>
  );
}
```

## Best Practices

### 1. Keep Features Independent
- Minimize dependencies between features
- Use events or shared state for cross-feature communication
- Import from feature's public API (index.ts) only

### 2. Co-locate Related Code
- Keep components, hooks, and tests close to where they're used
- Use nested folders for complex components
- Group related utilities together

### 3. Use TypeScript Strictly
- Define all types explicitly
- Avoid `any` types
- Use discriminated unions for complex states

### 4. Test Everything
- Write tests before implementation (TDD)
- Test components, hooks, and utilities
- Maintain 100% coverage

### 5. Document as You Go
- Add JSDoc comments to complex functions
- Update feature documentation
- Include examples in comments

## Common Patterns

### Data Fetching Pattern
```typescript
// Use React Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['feature', id],
  queryFn: () => featureApi.getById(id)
});
```

### Form Handling Pattern
```typescript
// Use React Hook Form
const { register, handleSubmit } = useForm<FeatureForm>();

const onSubmit = (data: FeatureForm) => {
  createFeature.mutate(data);
};
```

### Error Handling Pattern
```typescript
// Centralized error handling
try {
  await featureApi.create(data);
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

## Checklist

Before considering a feature complete:

- [ ] All components have tests
- [ ] API integration is working
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] Types are properly defined
- [ ] Documentation is updated
- [ ] Accessibility is verified
- [ ] Performance is optimized
- [ ] Code is reviewed
- [ ] Feature is deployed

## Resources

- [React Query Documentation](https://tanstack.com/query)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com)

---

For questions or clarifications, refer to existing features or ask in the team chat.