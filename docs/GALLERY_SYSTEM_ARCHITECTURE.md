# Gallery System Architecture Documentation

## System Overview

The Nelson Tech platform implements a **SINGLE, UNIFIED GALLERY SYSTEM** that provides comprehensive photo management capabilities across all entity types.

## ✅ Confirmed: Single Gallery System

After thorough analysis of the codebase, we can confirm:
- **ONE gallery system** implemented throughout the application
- **ONE database schema** for galleries (user_galleries table)
- **ONE API layer** (galleryApi.ts)
- **ONE set of components** for gallery functionality
- **NO duplicate implementations**

## Core Architecture

### 1. Database Schema

#### Primary Tables
- `user_galleries` - Main gallery storage table
- `gallery_photos` - Individual photos within galleries
- `gallery_topics` - Topic categorization (FIXED: now correctly references user_galleries)
- `gallery_comments` - User comments on photos
- `gallery_likes` - Like tracking for photos

#### Entity Junction Tables
- `event_galleries` - Links galleries to events
- `news_galleries` - Links galleries to news articles  
- `resource_galleries` - Links galleries to resources
- `page_galleries` - Links galleries to pages
- `user_profile_galleries` - Links galleries to user profiles
- `marketplace_galleries` - Links galleries to marketplace listings
- `group_galleries` - Links galleries to groups (existing)
- `company_galleries` - Links galleries to companies (existing)

### 2. Storage System

**Supabase Storage Buckets:**
- `gallery-photos` - Main photo storage
- `gallery-thumbnails` - Optimized thumbnails

### 3. API Layer

**Location:** `/src/features/gallery/api/galleryApi.ts`

**Key Methods:**
- `getAllGalleries()` - Fetch galleries with filtering
- `getGalleryById()` - Single gallery details
- `createGallery()` - Create new gallery
- `updateGallery()` - Update gallery metadata
- `deleteGallery()` - Remove gallery
- `uploadPhoto()` - Add photos to gallery
- `deletePhoto()` - Remove photos

**Feature Toggle Integration:**
All methods include `await requirePhotoGalleriesFeature()` check

### 4. Frontend Components

#### Admin Components
- `MediaManagementPage` - Central admin hub
- `GalleryList` - Display and manage galleries
- `GalleryForm` - Create/edit galleries
- `PhotoUploader` - Batch photo uploads
- `ModerationQueue` - Content moderation
- `GalleryAnalytics` - Usage statistics
- `EntityAssignments` - Manage entity relationships

#### Public Components
- `GalleryBrowser` - Public gallery browsing
- `GalleryDetail` - Individual gallery view
- `PhotoViewer` - Full-screen photo display
- `PhotoGrid` - Responsive photo grid
- `GalleryCard` - Gallery preview cards

### 5. State Management

**Redux Store:** `/src/store/slices/gallerySlice.ts`
- Manages gallery list state
- Handles photo uploads
- Tracks selection states
- Caches gallery data

### 6. Feature Toggle System

**Feature Key:** `photo_galleries`

**Integration Points:**
1. Route protection with `FeatureGate`
2. API method checks with `requirePhotoGalleriesFeature()`
3. Menu visibility with `useFeatureToggle` hook
4. Component rendering conditionals

## Fixed Issues

### Gallery Topics Table Reference (RESOLVED)
**Issue:** Migration incorrectly referenced non-existent 'galleries' table
**Fix:** Migration `20250824120000_fix_gallery_topics_reference.sql` corrects reference to 'user_galleries'

```sql
-- Before (INCORRECT)
gallery_id UUID NOT NULL REFERENCES galleries(id)

-- After (CORRECT)  
gallery_id UUID NOT NULL REFERENCES user_galleries(id)
```

## Gallery Ownership Model

The system uses a **polymorphic ownership pattern**:

```typescript
interface GalleryOwnership {
  owner_type: 'user' | 'group' | 'company' | 'event' | 'page';
  owner_id: UUID;
  user_id: UUID; // Creator/uploader
}
```

This allows:
- Any entity type to own galleries
- Tracking of who created the gallery
- Flexible permission models

## Permission Model

### Row Level Security (RLS)
1. **Public galleries** - Anyone can view
2. **Members-only galleries** - Authenticated users can view
3. **Private galleries** - Only owner can view
4. **Admin access** - Full access for admins/superadmins

### Gallery Operations
- **Create:** Authenticated users
- **Edit:** Gallery owner or admin
- **Delete:** Gallery owner or admin
- **View:** Based on privacy settings

## Performance Optimizations

1. **Thumbnail Generation** - Automatic thumbnail creation
2. **Lazy Loading** - Photos load on demand
3. **Pagination** - Efficient large gallery handling
4. **CDN Integration** - Fast global delivery
5. **Query Caching** - React Query with 5-minute cache

## Usage Limits

Configurable via feature toggle config:
```json
{
  "max_photos_per_gallery": 100,
  "max_galleries_per_user": 50,
  "max_file_size_mb": 10,
  "enable_moderation": true
}
```

## Admin Capabilities

### Gallery Management
- View all galleries across the platform
- Edit any gallery metadata
- Delete inappropriate content
- Manage gallery assignments to entities

### Moderation
- Review flagged content
- Approve/reject galleries
- Ban users from uploading
- Set content policies

### Analytics
- View upload statistics
- Track storage usage
- Monitor popular galleries
- Generate usage reports

## API Endpoints

### Public Endpoints
- `GET /api/galleries` - Browse public galleries
- `GET /api/galleries/:id` - View gallery details
- `GET /api/galleries/:id/photos` - Get gallery photos

### Authenticated Endpoints
- `POST /api/galleries` - Create gallery
- `PUT /api/galleries/:id` - Update gallery
- `DELETE /api/galleries/:id` - Delete gallery
- `POST /api/galleries/:id/photos` - Upload photos
- `DELETE /api/photos/:id` - Delete photo

### Admin Endpoints
- `GET /api/admin/galleries` - All galleries with admin data
- `PUT /api/admin/galleries/:id/moderate` - Moderate gallery
- `GET /api/admin/galleries/stats` - Platform statistics

## Testing Checklist

### Feature Enabled
- [ ] Gallery menu appears in admin
- [ ] Public gallery routes accessible
- [ ] API endpoints functional
- [ ] Entity assignment fields visible
- [ ] Photo upload works

### Feature Disabled
- [ ] Gallery menu hidden in admin
- [ ] Gallery routes return 404
- [ ] API calls return feature disabled error
- [ ] Entity assignment fields hidden
- [ ] Existing galleries preserved but inaccessible

## Migration Status

### Applied Migrations
1. ✅ Photo gallery system base tables
2. ✅ Gallery storage buckets
3. ✅ Entity relationship tables
4. ✅ RLS policies
5. ✅ Utility functions
6. ✅ Feature toggle integration
7. ✅ Gallery topics fix (pending application)

### Required SQL Commands

**1. Apply Gallery Topics Fix:**
```sql
-- Run in Supabase SQL Editor
-- This fixes the incorrect table reference
BEGIN;

DROP TABLE IF EXISTS gallery_topics CASCADE;

CREATE TABLE IF NOT EXISTS gallery_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE gallery_topics ADD CONSTRAINT gallery_topics_unique UNIQUE (gallery_id, topic_id);

CREATE INDEX IF NOT EXISTS idx_gallery_topics_gallery ON gallery_topics(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_topics_topic ON gallery_topics(topic_id);

ALTER TABLE gallery_topics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
-- (policies included in migration file)

COMMIT;
```

**2. Enable Photo Galleries Feature:**
```sql
-- Run in Supabase SQL Editor
INSERT INTO feature_toggles (
  feature_key,
  enabled,
  description,
  config
)
VALUES (
  'photo_galleries',
  true,
  'Enable photo gallery system for users and entities',
  '{"max_photos_per_gallery": 100, "max_galleries_per_user": 50}'::jsonb
)
ON CONFLICT (feature_key) 
DO UPDATE SET
  enabled = true,
  updated_at = now();
```

**3. Grant Admin Access (for specific user):**
```sql
-- Replace 'USER_ID' with actual user UUID
INSERT INTO user_roles (user_id, role_id)
SELECT 'USER_ID', id FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;
```

## Troubleshooting Guide

### Common Issues

1. **"Access Denied" in Admin**
   - Check user has admin/superadmin role
   - Verify feature toggle is enabled
   - Clear browser cache

2. **"Gallery topics table error"**
   - Apply the fix migration above
   - Verify user_galleries table exists

3. **"Feature disabled" errors**
   - Check feature_toggles table
   - Ensure photo_galleries key exists and is enabled

4. **Photos not uploading**
   - Check storage bucket permissions
   - Verify file size limits
   - Check network connectivity

## Summary

The Nelson Tech platform has **ONE comprehensive gallery system** that:
- ✅ Provides full CRUD operations
- ✅ Integrates with all entity types
- ✅ Has feature toggle protection
- ✅ Includes admin management interface
- ✅ Supports moderation and analytics
- ✅ Scales with configurable limits
- ✅ Uses secure RLS policies

The only issue found was an incorrect table reference in one migration file, which has been fixed and documented. The system is ready for production use once the fix migration is applied.