# API Consolidation Audit Report

## Overview
This audit identifies all API files in the codebase and their duplication status.

## Duplicate APIs (exist in both locations)
1. **companiesApi.ts**
   - Legacy: `/src/api/companiesApi.ts`
   - Feature: `/src/features/companies/api/companiesApi.ts`
   - Status: Feature version is canonical (most imports use it)

2. **eventsApi.ts**
   - Legacy: `/src/api/eventsApi.ts`
   - Feature: `/src/features/events/api/eventsApi.ts`
   - Status: Need to check which is canonical

3. **groupsApi.ts**
   - Legacy: `/src/api/groupsApi.ts`
   - Feature: `/src/features/groups/api/groupsApi.ts`
   - Status: Need to check which is canonical

4. **marketplaceApi.ts**
   - Legacy: `/src/api/marketplaceApi.ts`
   - Feature: `/src/features/marketplace/api/marketplaceApi.ts`
   - Status: Need to check which is canonical

5. **membersApi.ts**
   - Legacy: `/src/api/membersApi.ts`
   - Feature: `/src/features/directory/api/membersApi.ts`
   - Status: Need to check which is canonical

6. **newsApi.ts**
   - Legacy: `/src/api/newsApi.ts`
   - Feature: `/src/features/news/api/newsApi.ts`
   - Status: Need to check which is canonical

7. **opportunitiesApi.ts**
   - Legacy: `/src/api/opportunitiesApi.ts`
   - Feature: `/src/features/opportunities/api/opportunitiesApi.ts`
   - Status: Need to check which is canonical

8. **resourcesApi.ts**
   - Legacy: `/src/api/resourcesApi.ts`
   - Feature: `/src/features/resources/api/resourcesApi.ts`
   - Status: Need to check which is canonical

## APIs only in legacy location (/src/api/)
1. **Admin APIs** (should move to /src/features/admin/api/)
   - `/src/api/admin/audit.ts`
   - `/src/api/admin/contactSubmissions.ts`
   - `/src/api/admin/features.ts`
   - `/src/api/admin/moderation.ts`
   - `/src/api/admin/roles.ts`
   - `/src/api/admin/settings.ts`
   - `/src/api/admin/stats.ts`

2. **Newsletter APIs** (should move to /src/features/newsletter/api/)
   - `/src/api/newsletter/analytics.ts`
   - `/src/api/newsletter/campaigns.ts`
   - `/src/api/newsletter/content.ts`
   - `/src/api/newsletter/subscriptions.ts`

3. **Contact Submissions APIs** (should move to /src/features/contact/api/)
   - `/src/api/contactSubmissions.ts`
   - `/src/api/contactSubmissionsApi.ts`

4. **Utilities** (should move to /src/shared/api/)
   - `/src/api/supabaseUtils.ts`

## APIs only in feature locations (already migrated)
1. **Gallery APIs** (/src/features/gallery/api/)
   - `companyGalleryApi.ts`
   - `galleryApi.ts`
   - `galleryApiNew.ts`
   - `groupGalleryApi.ts`
   - `index.ts`
   - `pageHeaderApi.ts`
   - `photoApi.ts`
   - `promotionApi.ts`
   - `uploadApi.ts`

2. **Directory APIs** (/src/features/directory/api/)
   - `createMemberProfile.ts`

3. **Onboarding APIs** (/src/features/onboarding/api/)
   - `onboardingApi.ts`

4. **Pages APIs** (/src/features/pages/api/)
   - `pagesApi.ts`

## Migration Priority
1. **High Priority** (duplicates with active usage)
   - companiesApi (already mostly migrated)
   - membersApi
   - eventsApi
   - opportunitiesApi

2. **Medium Priority** (duplicates with moderate usage)
   - groupsApi
   - newsApi
   - resourcesApi
   - marketplaceApi

3. **Low Priority** (no duplicates but need migration)
   - Admin APIs
   - Newsletter APIs
   - Contact Submissions APIs
   - Utilities