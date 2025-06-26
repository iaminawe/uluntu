# Company Slug Debug Guide

## Issue
Company detail pages are showing "Company not found" error.

## Root Cause Identified
The `companiesApi.getAll()` method was not including the `slug` field when mapping data from Supabase, causing the company detail page to fail when trying to look up companies by slug.

## Fix Applied

### 1. Updated companiesApi.ts
Added the `slug` field to the company mapping in the `getAll` method:
```typescript
slug: item.slug || undefined, // Include slug field
```

### 2. Updated Mock Data
Added slugs to mock companies for consistency:
- `tech-innovators`
- `green-solutions`
- `digital-creators`

## Next Steps

### 1. Apply Database Migration (if not already done)
```bash
# Run the company slug migration
./scripts/run-company-slug-migration.sh
```

### 2. Verify Slugs in Database
```sql
-- Run the check script
psql $DATABASE_URL -f check-company-slugs.sql
```

### 3. Test the Fix
1. Visit `/companies` to see the companies list
2. Click on any company card
3. The URL should use the slug (e.g., `/companies/tech-innovators`)
4. The company detail page should load correctly

### 4. If Still Having Issues
1. Check browser console for errors
2. Check network tab to see what data is being returned
3. Verify the slug column exists in the database
4. Ensure all companies have slugs generated

## Technical Details

### How Slug Resolution Works
1. `CompanyCard` creates links using `company.slug || company.id`
2. The route accepts the parameter as `:id` but it can be either ID or slug
3. `useCompanyByIdOrSlugHybrid` hook uses `parseCompanyParam` to determine if it's a UUID or slug
4. The API then calls either `getById` or `getBySlug` accordingly

### Files Modified
- `/src/features/companies/api/companiesApi.ts` - Added slug field to data mapping
- Created `/check-company-slugs.sql` - SQL script to verify database state
- Created this debug guide for reference