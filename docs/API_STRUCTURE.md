# API Structure Documentation

## Overview
This document describes the consolidated API structure following the Phase 2 API Layer Consolidation.

## Directory Structure

```
src/
├── features/           # Feature-based API organization
│   ├── admin/api/      # Admin feature APIs
│   │   ├── audit.ts
│   │   ├── contactSubmissions.ts
│   │   ├── features.ts
│   │   ├── moderation.ts
│   │   ├── roles.ts
│   │   ├── settings.ts
│   │   └── stats.ts
│   ├── companies/api/  # Company feature APIs
│   │   └── companiesApi.ts
│   ├── contact/api/    # Contact feature APIs
│   │   ├── contactSubmissions.ts
│   │   └── contactSubmissionsApi.ts
│   ├── directory/api/  # Directory feature APIs
│   │   ├── createMemberProfile.ts
│   │   └── membersApi.ts
│   ├── events/api/     # Events feature APIs
│   │   └── eventsApi.ts
│   ├── gallery/api/    # Gallery feature APIs
│   │   ├── companyGalleryApi.ts
│   │   ├── galleryApi.ts
│   │   ├── galleryApiNew.ts
│   │   ├── groupGalleryApi.ts
│   │   ├── index.ts
│   │   ├── pageHeaderApi.ts
│   │   ├── photoApi.ts
│   │   ├── promotionApi.ts
│   │   └── uploadApi.ts
│   ├── groups/api/     # Groups feature APIs
│   │   └── groupsApi.ts
│   ├── marketplace/api/ # Marketplace feature APIs
│   │   └── marketplaceApi.ts
│   ├── news/api/       # News feature APIs
│   │   └── newsApi.ts
│   ├── newsletter/api/ # Newsletter feature APIs
│   │   ├── analytics.ts
│   │   ├── campaigns.ts
│   │   ├── content.ts
│   │   └── subscriptions.ts
│   ├── onboarding/api/ # Onboarding feature APIs
│   │   └── onboardingApi.ts
│   ├── opportunities/api/ # Opportunities feature APIs
│   │   └── opportunitiesApi.ts
│   ├── pages/api/      # Pages feature APIs
│   │   └── pagesApi.ts
│   └── resources/api/  # Resources feature APIs
│       └── resourcesApi.ts
└── shared/api/         # Shared API utilities
    ├── client.ts       # Supabase client and error handling
    ├── config.ts       # API configuration constants
    ├── index.ts        # Central export point
    ├── middleware.ts   # Common middleware functions
    └── types.ts        # Shared API types
```

## Import Patterns

### Feature APIs
```typescript
// Import from feature-specific API
import { companiesApi } from '@/features/companies/api/companiesApi';
import { membersApi } from '@/features/directory/api/membersApi';
import { eventsApi } from '@/features/events/api/eventsApi';
```

### Admin APIs
```typescript
// Import from admin feature APIs
import { adminRolesApi } from '@/features/admin/api/roles';
import { settingsApi } from '@/features/admin/api/settings';
import { adminStatsApi } from '@/features/admin/api/stats';
```

### Shared Utilities
```typescript
// Import shared utilities
import { supabase, handleSupabaseError, adaptItemsList } from '@/shared/api';
import { API_CONFIG } from '@/shared/api/config';
import { withAuth, withErrorHandling } from '@/shared/api/middleware';
```

## API Patterns

### Standard API Structure
Each API module follows this pattern:

```typescript
import { supabase, handleSupabaseError, adaptItemsList } from '@/shared/api';
import { adaptFromDatabase, adaptToDatabase } from '../utils/adapter';
import { FeatureType } from '../types';

export interface FeatureInput {
  // Input type definition
}

export const featureApi = {
  async getAll(filters?: FilterType): Promise<FeatureType[]> {
    // Implementation
  },
  
  async getById(id: string): Promise<FeatureType | null> {
    // Implementation
  },
  
  async create(data: FeatureInput): Promise<FeatureType | null> {
    // Implementation
  },
  
  async update(id: string, data: Partial<FeatureInput>): Promise<FeatureType | null> {
    // Implementation
  },
  
  async delete(id: string): Promise<boolean> {
    // Implementation
  }
};
```

### Error Handling
All APIs use the centralized error handling from `@/shared/api`:

```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) {
    handleSupabaseError(error, 'fetching data');
  }
  return data;
} catch (error) {
  handleSupabaseError(error, 'unexpected error');
  return null;
}
```

### Middleware Usage
Use shared middleware for common patterns:

```typescript
// With authentication
const result = await withAuth(async () => {
  return await featureApi.create(data);
});

// With error handling
const result = await withErrorHandling(
  async () => await featureApi.getAll(),
  'fetching features'
);

// With retry logic
const result = await withRetry(
  async () => await featureApi.getById(id),
  3, // max retries
  1000 // delay in ms
);
```

## Migration Notes

1. **Legacy API Location**: The old `/src/api/` directory has been removed
2. **Import Updates**: All imports have been updated to use the new structure
3. **Shared Utilities**: Common functionality moved to `/src/shared/api/`
4. **Feature Ownership**: Each feature owns its API implementation
5. **No Duplicates**: All duplicate API implementations have been removed

## Benefits

1. **Clear Feature Ownership**: Each feature manages its own API
2. **Reduced Duplication**: No more duplicate implementations
3. **Consistent Patterns**: Shared utilities ensure consistency
4. **Better Organization**: Logical grouping by feature
5. **Easier Maintenance**: Single source of truth for each API