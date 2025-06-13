# Quick Reference Guide

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm test -- --watch      # Run tests in watch mode
npm test -- --coverage   # Generate coverage report
npm test features/auth   # Test specific feature

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run typecheck        # Run TypeScript compiler
npm run format           # Format with Prettier

# SPARC Development
npx claude-flow sparc modes                    # List SPARC modes
npx claude-flow sparc run tdd "feature name"   # Run TDD workflow
npx claude-flow sparc run debug "issue"        # Debug an issue
```

## 📁 Directory Structure

```
src/
├── features/         # Feature modules
│   └── [feature]/
│       ├── api/      # API calls
│       ├── components/
│       ├── hooks/    # Custom hooks
│       ├── store/    # Redux slices
│       ├── types/    # TypeScript types
│       └── __tests__/
├── shared/          # Shared code
│   ├── components/
│   │   ├── ui/      # UI components
│   │   └── layout/  # Layout components
│   ├── contexts/    # React contexts
│   ├── hooks/       # Shared hooks
│   ├── lib/         # External libs
│   ├── types/       # Shared types
│   └── utils/       # Utilities
├── pages/           # Route pages
├── store/           # Redux store
└── tests/           # Integration tests
```

## 🔧 Import Examples

```typescript
// Feature imports
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CompaniesList } from '@/features/companies/components/CompaniesList';
import { marketplaceApi } from '@/features/marketplace/api/marketplaceApi';

// Shared imports
import { Button } from '@/shared/components/ui/Button';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { formatDate } from '@/shared/utils/dateUtils';
import { supabase } from '@/shared/lib/supabase';

// Store imports
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
```

## 🎯 Feature List

| Feature | Path | Description |
|---------|------|-------------|
| Auth | `/features/auth` | Authentication & authorization |
| Companies | `/features/companies` | Company profiles |
| Directory | `/features/directory` | Member directory |
| Events | `/features/events` | Event management |
| Groups | `/features/groups` | Community groups |
| Marketplace | `/features/marketplace` | Buy/sell listings |
| News | `/features/news` | News & articles |
| Onboarding | `/features/onboarding` | User onboarding |
| Opportunities | `/features/opportunities` | Jobs & volunteering |
| Resources | `/features/resources` | Educational content |

## 🧩 Common Patterns

### API Call Pattern
```typescript
// In api/featureApi.ts
export const featureApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    if (error) throw error;
    return data;
  }
};
```

### React Query Hook Pattern
```typescript
// In hooks/useFeatureQueries.ts
export function useFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: featureApi.getAll
  });
}
```

### Component Pattern
```typescript
// In components/FeatureList/index.tsx
export function FeatureList() {
  const { data, isLoading, error } = useFeatures();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {data?.map(item => (
        <FeatureCard key={item.id} {...item} />
      ))}
    </div>
  );
}
```

### Redux Slice Pattern
```typescript
// In store/featureSlice.ts
export const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    }
  }
});
```

## 🔍 Debugging Tips

1. **Check imports** - Ensure using @ alias
2. **Clear cache** - `rm -rf node_modules/.vite`
3. **Type errors** - Run `npm run typecheck`
4. **Test specific file** - `npm test -- path/to/file`
5. **Check Redux state** - Use Redux DevTools

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 🚨 Common Issues

### Import not found
- Check file exists in new location
- Verify @ alias in import path
- Run TypeScript compiler

### Test failures
- Clear test cache: `npm test -- --clearCache`
- Check mock implementations
- Verify test file imports

### Build errors
- Clean install: `rm -rf node_modules && npm install`
- Check for circular dependencies
- Verify environment variables

## 📚 Resources

- [Project Documentation](./README.md)
- [CLAUDE.md](../CLAUDE.md) - AI assistant guide
- [Feature Development Guide](./guides/feature-development.md)
- [Testing Strategy](./guides/testing-strategy.md)

---

*Last updated: June 2024*