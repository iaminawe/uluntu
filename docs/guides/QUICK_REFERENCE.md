# Quick Reference - Hybrid Pattern

## 🚀 TL;DR

**Server State** → React Query  
**UI State** → Redux  
**Combined** → Hybrid Hook

## 📋 Checklist for New Features

### 1. API Layer (`/api/{feature}Api.ts`)
```typescript
export const featureApi = {
  getAll: (filters?) => Promise<Feature[]>,
  getById: (id) => Promise<Feature>,
  create: (data) => Promise<Feature>,
  update: (id, data) => Promise<Feature>,
  delete: (id) => Promise<boolean>
};
```

### 2. UI Slice (`/store/{feature}UISlice.ts`)
```typescript
interface FeatureUIState {
  filters: FeatureFilters;
  selectedId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
```

### 3. Hybrid Hook (`/hooks/use{Feature}Hybrid.ts`)
```typescript
export function useFeatureHybrid() {
  // Redux UI state
  const filters = useAppSelector(selectFilters);
  
  // React Query server state  
  const query = useQuery({
    queryKey: queryKeys.featureWithFilters(filters),
    queryFn: () => featureApi.getAll(filters)
  });
  
  return {
    // Data
    items: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    
    // UI state
    filters, viewMode, sortBy,
    
    // Actions
    setSearchTerm, setViewMode,
    
    // Queries & Mutations
    getItem, createItem, updateItem
  };
}
```

### 4. Add to Store (`/store/index.ts`)
```typescript
import featureUIReducer from '@/features/{feature}/store/{feature}UISlice';

export const store = configureStore({
  reducer: {
    featureUI: featureUIReducer,
    // ...
  }
});
```

### 5. Usage in Components
```typescript
export default function FeaturePage() {
  const {
    items,
    isLoading,
    setSearchTerm,
    createItem
  } = useFeatureHybrid();
  
  // Component logic...
}
```

## 🎯 What Goes Where?

| Type | Storage | Examples |
|------|---------|----------|
| **Server Data** | React Query | items, users, posts |
| **Loading States** | React Query | isLoading, error |
| **Mutations** | React Query | create, update, delete |
| **Filters** | Redux | search, tags, date range |
| **View State** | Redux | grid/list, sort order |
| **Selections** | Redux | selectedId, checked items |
| **Pagination** | Redux | currentPage, pageSize |

## ⚡ Quick Commands

```bash
# Type check
npm run typecheck

# Build
npm run build

# Test
npm test
```

## 📁 File Locations

```
src/features/{feature}/
├── api/{feature}Api.ts
├── store/{feature}UISlice.ts  
├── hooks/use{Feature}Hybrid.ts
└── components/
```

## 🔗 Links

- [📖 Full Guide](./HYBRID_PATTERN_GUIDE.md)
- [⚙️ CLAUDE.md](../CLAUDE.md)
- [🏪 Store Config](../src/store/index.ts)
- [🔑 Query Keys](../src/config/queryClient.ts)