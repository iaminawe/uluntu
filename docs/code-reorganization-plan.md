# Code Structure Reorganization Plan

## Overview
This document outlines a comprehensive plan to reorganize the Nelson Tech codebase for better maintainability, consistency, and developer experience.

## Current Issues

### 1. **Legacy and Duplicate Code**
- `auth_template/` directory contains outdated auth implementation
- Multiple duplicate test files (.js and .tsx versions)
- Debug components in production code
- Duplicate hooks (useMarketplaceQueries vs useMarketplaceQueriesFixed)

### 2. **Inconsistent Organization**
- Tests scattered across multiple locations
- No clear feature boundaries
- Mix of contexts/ and context/ directories
- router/ vs routes/ confusion

### 3. **Poor Separation of Concerns**
- Feature code spread across components/, pages/, hooks/, api/, and redux/
- No clear distinction between shared and feature-specific components
- Types scattered throughout the codebase

## Proposed Structure

```
src/
├── features/              # Feature-based modules
│   ├── auth/
│   │   ├── components/    # Feature-specific components
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── api/           # API calls
│   │   ├── store/         # Redux slice
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utilities
│   │   └── __tests__/     # Tests
│   ├── companies/
│   ├── directory/
│   ├── events/
│   ├── groups/
│   ├── marketplace/
│   ├── news/
│   ├── onboarding/        # Already exists
│   ├── opportunities/
│   └── resources/
├── shared/                # Shared across features
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Basic UI elements
│   │   ├── layout/       # Layout components
│   │   └── forms/        # Form components
│   ├── contexts/         # Global contexts
│   ├── hooks/            # Shared hooks
│   ├── lib/              # External library configs
│   ├── types/            # Shared types
│   └── utils/            # Shared utilities
├── pages/                # Route pages (thin layers)
├── routes/               # Routing configuration
├── store/                # Redux store configuration
├── tests/                # Integration and E2E tests
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── App.tsx
├── main.tsx
└── setupTests.ts
```

## Migration Plan

### Phase 1: Clean Up (Week 1)
1. **Remove Legacy Code**
   - Delete `src/auth_template/` directory
   - Remove debug components (MarketplaceDebugDetailPage, etc.)
   - Delete duplicate test files (.js versions)
   - Remove duplicate hooks

2. **Consolidate Directories**
   - Merge `context/` into `contexts/`
   - Remove `router/` in favor of `routes/`
   - Clean up `__mocks__/` directories

### Phase 2: Create Feature Structure (Week 2)
1. **Set up feature directories**
   ```bash
   mkdir -p src/features/{auth,companies,directory,events,groups,marketplace,news,opportunities,resources}/{components,hooks,api,store,types,utils,__tests__}
   ```

2. **Create shared structure**
   ```bash
   mkdir -p src/shared/{components/{ui,layout,forms},contexts,hooks,types,utils}
   ```

### Phase 3: Migrate Features (Weeks 3-4)
Migrate one feature at a time, starting with the most isolated:

1. **Auth Feature**
   - Move: `components/auth/*` → `features/auth/components/`
   - Move: `hooks/useAuth.ts` → `features/auth/hooks/`
   - Move: `redux/slices/authSlice.ts` → `features/auth/store/`
   - Move: auth-related API calls → `features/auth/api/`

2. **Marketplace Feature**
   - Move: `components/MarketplaceList/*` → `features/marketplace/components/`
   - Move: `hooks/useMarketplace*.ts` → `features/marketplace/hooks/`
   - Move: `api/marketplaceApi.ts` → `features/marketplace/api/`
   - Move: `redux/slices/marketplaceSlice.ts` → `features/marketplace/store/`

3. **Continue with other features...**

### Phase 4: Update Imports (Week 5)
1. Update all import paths to reflect new structure
2. Update barrel exports for cleaner imports
3. Update test imports

### Phase 5: Final Cleanup (Week 6)
1. Remove empty directories
2. Update documentation
3. Update build configuration if needed
4. Run full test suite

## File Movement Map

### Auth Feature
```
FROM                                          TO
src/components/auth/*                    →    src/features/auth/components/
src/hooks/useAuth.ts                     →    src/features/auth/hooks/
src/redux/slices/authSlice.ts            →    src/features/auth/store/
src/pages/SignInPage.tsx                 →    src/pages/auth/SignInPage.tsx
src/pages/SignUpPage.tsx                 →    src/pages/auth/SignUpPage.tsx
```

### Companies Feature
```
FROM                                          TO
src/components/CompaniesList/*           →    src/features/companies/components/
src/api/companiesApi.ts                  →    src/features/companies/api/
src/redux/slices/companiesSlice.ts       →    src/features/companies/store/
src/hooks/useCompanies*.ts               →    src/features/companies/hooks/
src/adapters/companyAdapter.ts           →    src/features/companies/adapters/
```

### Shared Components
```
FROM                                          TO
src/components/ui/*                      →    src/shared/components/ui/
src/components/Header/*                  →    src/shared/components/layout/Header/
src/components/Footer/*                  →    src/shared/components/layout/Footer/
src/components/Pagination.tsx            →    src/shared/components/ui/
src/components/DataSourceIndicator.tsx   →    src/shared/components/ui/
```

## Benefits

1. **Clear Feature Boundaries**: Each feature is self-contained with all related code
2. **Better Code Discovery**: Developers can easily find all code related to a feature
3. **Easier Testing**: Tests are co-located with the code they test
4. **Reduced Coupling**: Features are more independent
5. **Consistent Structure**: Every feature follows the same pattern
6. **Cleaner Imports**: Better organization leads to cleaner import statements

## Risks and Mitigation

1. **Risk**: Broken imports during migration
   - **Mitigation**: Use automated refactoring tools, comprehensive testing

2. **Risk**: Merge conflicts with ongoing development
   - **Mitigation**: Coordinate with team, migrate during low-activity periods

3. **Risk**: Build tool configuration issues
   - **Mitigation**: Test build process after each phase

## Success Metrics

- All tests passing after reorganization
- Reduced time to find code (developer survey)
- Clearer separation of concerns
- No circular dependencies between features
- Consistent file naming and structure

## Next Steps

1. Review and approve this plan with the team
2. Create feature branches for each migration phase
3. Begin Phase 1 cleanup
4. Document any deviations from the plan