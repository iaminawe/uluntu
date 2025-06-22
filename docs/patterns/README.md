# Nelson Tech Platform - Patterns & Standards Documentation

This directory contains standardized patterns, templates, and migration guides for the Nelson Tech Community Platform.

## 📚 Documentation

### Core Documentation
- **[PATTERNS.md](./PATTERNS.md)** - Comprehensive guide to code patterns and standards
- **[MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)** - Step-by-step migration instructions

### Templates
Located in `/templates/` directory:
- **[component-template.tsx](./templates/component-template.tsx)** - Standard React component structure
- **[component-types-template.ts](./templates/component-types-template.ts)** - Component TypeScript types
- **[redux-slice-template.ts](./templates/redux-slice-template.ts)** - Redux slice with all standard patterns
- **[api-service-template.ts](./templates/api-service-template.ts)** - API service layer template
- **[hook-template.ts](./templates/hook-template.ts)** - Custom React hook patterns
- **[test-template.test.tsx](./templates/test-template.test.tsx)** - Comprehensive test suite template

### Tooling
- **[eslint-custom-rules.js](./eslint-custom-rules.js)** - Custom ESLint rules to enforce patterns

## 🚨 Critical Issues to Fix

Based on analysis of the codebase, these issues require immediate attention:

### 1. Redux Slices Using Direct Environment Checks
**Problem**: Redux slices are checking `import.meta.env.VITE_USE_SUPABASE` directly instead of using the centralized configuration.

**Impact**: This causes mock data to be shown even when Supabase is enabled.

**Solution**: Use `getIsSupabaseEnabled()` from `@/config/env` in all Redux slices.

### 2. Authentication Role Loading Race Condition
**Problem**: User roles are fetched asynchronously after authentication, causing the admin dashboard to disappear.

**Impact**: Admin users can't access admin features immediately after login.

**Solution**: Ensure roles are fully loaded before setting authentication loading state to false.

## 📋 Quick Reference

### Naming Conventions
- **Components**: `PascalCase` (e.g., `UserProfile.tsx`)
- **Hooks**: `camelCase` with 'use' prefix (e.g., `useAuth.ts`)
- **API Services**: `camelCase` with 'Api' suffix (e.g., `marketplaceApi.ts`)
- **Redux Slices**: `camelCase` with 'Slice' suffix (e.g., `authSlice.ts`)
- **Types**: `PascalCase` (e.g., `MarketplaceListing`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_ENDPOINTS`)

### Import Pattern
```typescript
// Always use @ alias imports
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components/ui/Button';
import { formatDate } from '@/shared/utils/dateUtils';
```

### Environment Configuration
```typescript
// ✅ CORRECT - Use centralized configuration
import { getIsSupabaseEnabled } from '@/config/env';

if (getIsSupabaseEnabled()) {
  // Use Supabase
}

// ❌ WRONG - Never use direct checks
if (import.meta.env.VITE_USE_SUPABASE === 'true') {
  // Don't do this!
}
```

## 🛠️ How to Use These Resources

### For New Features
1. Copy relevant templates from `/templates/`
2. Replace `[Feature]` and `[feature]` placeholders with your feature name
3. Follow the patterns documented in `PATTERNS.md`
4. Ensure all TypeScript types are properly defined
5. Write tests following the test template

### For Existing Code
1. Review `MIGRATION-GUIDE.md` for priority fixes
2. Use the migration scripts provided
3. Run ESLint with custom rules to identify issues
4. Update code incrementally, testing as you go
5. Document any deviations from patterns

### For Code Reviews
1. Reference `PATTERNS.md` for correct patterns
2. Check for anti-patterns listed in documentation
3. Ensure proper error handling and TypeScript usage
4. Verify tests follow the standard template
5. Confirm imports use @ alias

## 📊 Migration Progress Tracker

Create a tracking document with:
- [ ] Redux slices updated to use `getIsSupabaseEnabled()`
- [ ] Authentication role loading fixed
- [ ] API services standardized with error handling
- [ ] Components updated to standard structure
- [ ] Tests updated to use `renderWithProviders`
- [ ] TypeScript types properly defined for all features
- [ ] ESLint custom rules integrated

## 🤝 Contributing

When adding new patterns or updating existing ones:
1. Update relevant documentation files
2. Create or update template files
3. Add examples of correct usage
4. Document any breaking changes
5. Update migration guide if needed

## 📞 Support

For questions or clarification:
- Review existing patterns in `PATTERNS.md`
- Check templates for examples
- Consult migration guide for common issues
- Ask in development channels for help

Remember: Consistency is key! Following these patterns ensures maintainable, scalable code across the entire platform.