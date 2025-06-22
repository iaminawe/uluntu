# Nelson Tech Platform - Code Migration Guide

## Overview

This guide provides step-by-step instructions for migrating existing code to follow the standardized patterns documented in [PATTERNS.md](./PATTERNS.md).

## Priority Migration Tasks

### 🔴 Critical (Must Fix Immediately)

#### 1. Fix Redux Slices Environment Configuration
**Impact**: High - Causes incorrect data source usage  
**Effort**: Low - Simple find/replace  
**Files**: All Redux slice files

**Current Issue**:
```typescript
// ❌ WRONG - Direct environment check
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';
```

**Migration Steps**:
1. Import the centralized configuration:
   ```typescript
   import { getIsSupabaseEnabled } from '@/config/env';
   ```

2. Replace all instances in async thunks:
   ```typescript
   // ✅ CORRECT
   if (getIsSupabaseEnabled()) {
     // Use Supabase API
   } else {
     // Use mock data
   }
   ```

**Files to Update**:
- `/src/features/news/store/newsSlice.ts`
- `/src/features/marketplace/store/marketplaceSlice.ts`
- `/src/features/events/store/eventsSlice.ts`
- `/src/features/groups/store/groupsSlice.ts`
- `/src/features/opportunities/store/opportunitiesSlice.ts`
- `/src/features/resources/store/resourcesSlice.ts`
- `/src/features/companies/store/companiesSlice.ts`
- `/src/features/directory/store/membersSlice.ts`

#### 2. Fix Authentication Role Loading
**Impact**: High - Admin dashboard disappears after login  
**Effort**: Medium - Requires careful timing adjustments  
**Files**: Auth-related contexts and hooks

**Migration Steps**:
1. Update `SessionContextWithRedux` to ensure roles are loaded before setting loading to false
2. Add proper role loading state to Redux
3. Update `ProtectedRoute` to wait for role loading
4. Remove duplicate role fetching from `useAuth` hook

### 🟡 Important (Fix Soon)

#### 3. Standardize API Error Handling
**Impact**: Medium - Inconsistent error messages  
**Effort**: Medium - Update all API services

**Migration Pattern**:
```typescript
// Before
try {
  // ... code
} catch (e) {
  console.log(e);
  return null;
}

// After
try {
  // ... code
} catch (error) {
  console.error('[FeatureName] Error description:', error);
  throw handleApiError(error);
}
```

#### 4. Remove Mock Data from Redux Slices
**Impact**: Medium - Code duplication  
**Effort**: High - Requires refactoring

Consider moving all mock data handling to the API layer or a separate mock service.

### 🟢 Nice to Have (Gradual Migration)

#### 5. Update Component Structure
**Impact**: Low - Improves maintainability  
**Effort**: Medium - Many files

Migrate components to follow the standard template structure with proper loading/error states.

## Migration Checklist by Feature

### Auth Feature
- [ ] Fix role loading timing in `SessionContextWithRedux`
- [ ] Add role loading state to Redux
- [ ] Update `ProtectedRoute` to check role loading
- [ ] Remove duplicate role fetching from `useAuth`
- [ ] Add proper error handling to auth API calls

### Marketplace Feature
- [ ] Update `marketplaceSlice.ts` to use `getIsSupabaseEnabled()`
- [ ] Standardize error handling in `marketplaceApi.ts`
- [ ] Update components to use Redux hooks consistently
- [ ] Add proper TypeScript types for all data structures
- [ ] Update tests to use `renderWithProviders`

### News Feature
- [ ] Update `newsSlice.ts` to use `getIsSupabaseEnabled()`
- [ ] Fix slug-based routing consistency
- [ ] Standardize API error handling
- [ ] Update components to follow template structure
- [ ] Add comprehensive tests

### Events Feature
- [ ] Update `eventsSlice.ts` to use `getIsSupabaseEnabled()`
- [ ] Standardize date handling across components
- [ ] Fix RSVP functionality consistency
- [ ] Update API service structure
- [ ] Add missing TypeScript types

### Groups Feature
- [ ] Update `groupsSlice.ts` to use `getIsSupabaseEnabled()`
- [ ] Standardize membership handling
- [ ] Fix visibility logic consistency
- [ ] Update component structure
- [ ] Add proper error states

### Directory Feature
- [ ] Update `membersSlice.ts` to use `getIsSupabaseEnabled()`
- [ ] Standardize member profile handling
- [ ] Fix search functionality
- [ ] Update filter components
- [ ] Add pagination support

### Resources Feature
- [ ] Update `resourcesSlice.ts` to use `getIsSupabaseEnabled()`
- [ ] Migrate from array tags to relational tags
- [ ] Standardize content type handling
- [ ] Update API service
- [ ] Add proper TypeScript types

### Companies Feature
- [ ] Update `companiesSlice.ts` to use `getIsSupabaseEnabled()`
- [ ] Standardize employee relationship handling
- [ ] Fix industry categorization
- [ ] Update component structure
- [ ] Add verification status handling

## Step-by-Step Migration Process

### Phase 1: Critical Fixes (Week 1)
1. **Day 1-2**: Fix all Redux slices environment configuration
2. **Day 3-4**: Fix authentication role loading
3. **Day 5**: Test all features with both Supabase and mock data

### Phase 2: API Standardization (Week 2)
1. **Day 1-2**: Update all API services with consistent error handling
2. **Day 3-4**: Add proper TypeScript types and adapters
3. **Day 5**: Update and run all API tests

### Phase 3: Component Updates (Weeks 3-4)
1. Update high-traffic pages first (Home, Directory, Marketplace)
2. Migrate components to standard template structure
3. Add consistent loading and error states
4. Update tests for all migrated components

### Phase 4: Testing & Documentation (Week 5)
1. Run full test suite and fix failures
2. Update component documentation
3. Create Storybook stories for key components
4. Update README with new patterns

## Automated Migration Scripts

### Script 1: Fix Environment Checks
```bash
#!/bin/bash
# fix-env-checks.sh

# Find and replace direct env checks in Redux slices
find src/features -name "*Slice.ts" -type f -exec sed -i '' \
  's/const USE_SUPABASE = import\.meta\.env\.VITE_USE_SUPABASE === '\''true'\'';/import { getIsSupabaseEnabled } from '\''@\/config\/env'\'';/g' {} \;

find src/features -name "*Slice.ts" -type f -exec sed -i '' \
  's/if (import\.meta\.env\.VITE_USE_SUPABASE === '\''true'\'')/if (getIsSupabaseEnabled())/g' {} \;

echo "Environment checks updated. Please review changes and fix any import issues."
```

### Script 2: Add Error Handling
```bash
#!/bin/bash
# add-error-handling.sh

# Add console.error to catch blocks in API files
find src/features -path "*/api/*" -name "*.ts" -type f -exec sed -i '' \
  '/catch.*{/,/}/ s/return null;/console.error('\''[API] Error:'\'', error);\n      return null;/g' {} \;

echo "Error handling added. Please review and customize error messages."
```

## Validation Checklist

After migration, verify:

### Functionality Tests
- [ ] User can log in and roles are properly loaded
- [ ] Admin dashboard appears for admin users
- [ ] Data loads correctly with Supabase enabled
- [ ] Mock data works when Supabase is disabled
- [ ] All CRUD operations work correctly
- [ ] Error states display properly
- [ ] Loading states show during data fetching

### Code Quality Checks
- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no errors
- [ ] Test suite passes (aim for >90% coverage)
- [ ] No console errors in development
- [ ] Bundle size hasn't increased significantly

### Performance Checks
- [ ] Page load times are acceptable
- [ ] No unnecessary re-renders
- [ ] API calls are properly cached/memoized
- [ ] Images use lazy loading

## Common Issues and Solutions

### Issue 1: Import Errors After Migration
**Solution**: Ensure all imports use the `@/` alias and update any relative imports.

### Issue 2: TypeScript Errors with Redux
**Solution**: Use the typed hooks from `@/store/hooks` instead of generic Redux hooks.

### Issue 3: Tests Failing After Updates
**Solution**: Update tests to use `renderWithProviders` utility and proper mocking.

### Issue 4: Data Not Loading
**Solution**: Check that `getIsSupabaseEnabled()` is being called in async thunks, not at module level.

## Support and Resources

- Review [PATTERNS.md](./PATTERNS.md) for detailed pattern documentation
- Check template files in `/docs/patterns/templates/` for examples
- Run ESLint with custom rules to catch pattern violations
- Ask in #dev-help Slack channel for migration assistance

## Migration Tracking

Create a migration tracking spreadsheet with:
- Feature name
- Files to update
- Migration status (Not Started/In Progress/Complete)
- Assigned developer
- Testing status
- Notes/Issues

Regular migration sync meetings recommended to track progress and resolve blockers.