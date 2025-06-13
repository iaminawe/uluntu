# Import Migration Guide

This guide helps update imports after the code reorganization.

## Import Path Changes

### Auth Feature
```typescript
// OLD
import { useAuth } from '@/hooks/useAuth';
import { SignInForm } from '@/components/auth/SignInForm';
import { authSlice } from '@/redux/slices/authSlice';

// NEW
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SignInForm } from '@/features/auth/components/SignInForm';
import { authSlice } from '@/features/auth/store/authSlice';
```

### Companies Feature
```typescript
// OLD
import { CompaniesList } from '@/components/CompaniesList';
import { companiesApi } from '@/api/companiesApi';
import { useCompanies } from '@/hooks/useCompaniesRedux';
import { companiesSlice } from '@/redux/slices/companiesSlice';

// NEW
import { CompaniesList } from '@/features/companies/components/CompaniesList';
import { companiesApi } from '@/features/companies/api/companiesApi';
import { useCompanies } from '@/features/companies/hooks/useCompanies';
import { companiesSlice } from '@/features/companies/store/companiesSlice';
```

### Marketplace Feature
```typescript
// OLD
import { MarketplaceList } from '@/components/MarketplaceList';
import { marketplaceApi } from '@/api/marketplaceApi';
import { useMarketplaceQueries } from '@/hooks/useMarketplaceQueries';
import { marketplaceSlice } from '@/redux/slices/marketplaceSlice';

// NEW
import { MarketplaceList } from '@/features/marketplace/components/MarketplaceList';
import { marketplaceApi } from '@/features/marketplace/api/marketplaceApi';
import { useMarketplaceQueries } from '@/features/marketplace/hooks/useMarketplaceQueries';
import { marketplaceSlice } from '@/features/marketplace/store/marketplaceSlice';
```

### Shared Components
```typescript
// OLD
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Pagination } from '@/components/Pagination';
import { AuthContext } from '@/contexts/AuthContext';
import { dateUtils } from '@/utils/dateUtils';

// NEW
import { Button } from '@/shared/components/ui/Button';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Pagination } from '@/shared/components/ui/Pagination';
import { AuthContext } from '@/shared/contexts/AuthContext';
import { dateUtils } from '@/shared/utils/dateUtils';
```

### Page Imports
```typescript
// OLD
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';

// NEW
import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';
```

## Automated Import Update Script

Create a file `scripts/update-imports.js`:

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define import mappings
const importMappings = [
  // Auth
  { from: '@/hooks/useAuth', to: '@/features/auth/hooks/useAuth' },
  { from: '@/components/auth/', to: '@/features/auth/components/' },
  { from: '@/redux/slices/authSlice', to: '@/features/auth/store/authSlice' },
  
  // Companies
  { from: '@/components/CompaniesList', to: '@/features/companies/components/CompaniesList' },
  { from: '@/api/companiesApi', to: '@/features/companies/api/companiesApi' },
  { from: '@/hooks/useCompanies', to: '@/features/companies/hooks/useCompanies' },
  { from: '@/redux/slices/companiesSlice', to: '@/features/companies/store/companiesSlice' },
  
  // Marketplace
  { from: '@/components/MarketplaceList', to: '@/features/marketplace/components/MarketplaceList' },
  { from: '@/api/marketplaceApi', to: '@/features/marketplace/api/marketplaceApi' },
  { from: '@/hooks/useMarketplace', to: '@/features/marketplace/hooks/useMarketplace' },
  { from: '@/redux/slices/marketplaceSlice', to: '@/features/marketplace/store/marketplaceSlice' },
  
  // Shared
  { from: '@/components/ui/', to: '@/shared/components/ui/' },
  { from: '@/components/Header', to: '@/shared/components/layout/Header' },
  { from: '@/components/Footer', to: '@/shared/components/layout/Footer' },
  { from: '@/contexts/', to: '@/shared/contexts/' },
  { from: '@/utils/', to: '@/shared/utils/' },
  
  // Pages
  { from: '@/pages/SignInPage', to: '@/pages/auth/SignInPage' },
  { from: '@/pages/SignUpPage', to: '@/pages/auth/SignUpPage' },
];

// Function to update imports in a file
function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  importMappings.forEach(({ from, to }) => {
    const regex = new RegExp(`(['"])${from}`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, `$1${to}`);
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in: ${filePath}`);
  }
}

// Find all TypeScript/JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
});

// Update imports in all files
files.forEach(updateImportsInFile);

console.log('Import update complete!');
```

## Manual Import Update Checklist

1. **Update tsconfig.json paths** (if using path aliases):
```json
{
  "compilerOptions": {
    "paths": {
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/pages/*": ["src/pages/*"],
      "@/store/*": ["src/store/*"],
      "@/tests/*": ["src/tests/*"]
    }
  }
}
```

2. **Update barrel exports** in feature index files:
```typescript
// src/features/auth/index.ts
export * from './components';
export * from './hooks';
export * from './api';
export * from './store';
export * from './types';
```

3. **Update Redux store imports**:
```typescript
// src/store/index.ts
import { authSlice } from '@/features/auth/store/authSlice';
import { companiesSlice } from '@/features/companies/store/companiesSlice';
import { marketplaceSlice } from '@/features/marketplace/store/marketplaceSlice';
// ... other slices
```

4. **Update route imports**:
```typescript
// src/routes/index.tsx
// Auth pages
const SignInPage = lazy(() => import('@/pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));
```

5. **Update test imports**:
```typescript
// Update paths in all test files to match new structure
import { SignInForm } from '@/features/auth/components/SignInForm';
import { authSlice } from '@/features/auth/store/authSlice';
```

## Testing After Migration

1. **Run TypeScript compiler**:
```bash
npx tsc --noEmit
```

2. **Run tests**:
```bash
npm test
```

3. **Check for circular dependencies**:
```bash
npx madge --circular src/
```

4. **Verify build**:
```bash
npm run build
```

## Common Issues and Solutions

### Issue: Module not found errors
**Solution**: Check if the import path has been updated correctly and the file exists in the new location.

### Issue: Circular dependency warnings
**Solution**: Ensure features don't import from each other directly. Use shared interfaces or events for cross-feature communication.

### Issue: Test failures after migration
**Solution**: Update test file imports and mock paths to match the new structure.

### Issue: Build failures
**Solution**: Clear build cache and node_modules, then reinstall:
```bash
rm -rf node_modules dist
npm install
npm run build
```