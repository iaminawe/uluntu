# Admin Gallery Management System - Architecture & Design

## Executive Summary

This document outlines the comprehensive admin gallery management system design for the Uluntu. Building on the existing gallery infrastructure, this system provides administrators with powerful tools to manage galleries, photos, and user-generated content through an intuitive interface.

## System Architecture Overview

### Current Infrastructure Analysis

The existing system includes:
- Gallery API (`galleryApi.ts`) with CRUD operations
- Photo API (`photoApi.ts`) with advanced search and metadata handling  
- Comprehensive type definitions supporting batch operations
- Supabase backend with storage integration
- Redux state management with UI slices

### Core Components Hierarchy

```
AdminGalleryManagement/
├── GalleryOverview/
│   ├── GalleryGrid
│   ├── GalleryCard
│   ├── GalleryFilters
│   └── GalleryActions
├── PhotoManagement/
│   ├── PhotoGrid
│   ├── PhotoCard
│   ├── PhotoDetailsPanel
│   ├── BulkOperations
│   └── PhotoUpload
├── GalleryOperations/
│   ├── GalleryForm
│   ├── PhotoReorder
│   ├── ModerationQueue
│   └── ApprovalWorkflow
└── Shared/
    ├── SearchBar
    ├── FilterPanel
    ├── ActionBar
    └── ConfirmationModal
```

## 1. Admin Gallery Overview Interface

### Wireframe: Gallery Grid View

```
┌─────────────────────────────────────────────────────────┐
│ Admin Gallery Management                                 │
├─────────────────────────────────────────────────────────┤
│ [Search] [Filter ▼] [Sort ▼] [+ New Gallery]           │
├─────────────────────────────────────────────────────────┤
│ Selected: 0 [Bulk Actions ▼]                           │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│ │[Thumbnail]  │ │[Thumbnail]  │ │[Thumbnail]  │       │
│ │Gallery Name │ │Gallery Name │ │Gallery Name │       │
│ │12 photos    │ │8 photos     │ │25 photos    │       │
│ │Public       │ │Private      │ │Members Only │       │
│ │Dec 15, 2024 │ │Dec 10, 2024 │ │Dec 8, 2024  │       │
│ │[Edit][Del]  │ │[Edit][Del]  │ │[Edit][Del]  │       │
│ └─────────────┘ └─────────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────────┤
│ [Previous] 1 2 3 4 5 [Next]  Showing 1-12 of 48       │
└─────────────────────────────────────────────────────────┘
```

### Key Features:
- **Grid Layout**: Responsive card-based gallery display
- **Gallery Metadata**: Title, photo count, privacy level, creation date
- **Quick Actions**: Edit, delete, view photos buttons per gallery
- **Bulk Selection**: Checkbox selection with bulk operations
- **Advanced Filtering**: By privacy, date range, owner, tags
- **Search**: Title/description search with auto-complete
- **Sorting**: By date, title, photo count, views

## 2. Photo Management Interface

### Wireframe: Photo Grid within Gallery

```
┌─────────────────────────────────────────────────────────┐
│ Gallery: "Summer Events 2024" (25 photos)              │
├─────────────────────────────────────────────────────────┤
│ [← Back] [Upload Photos] [Gallery Settings]             │
├─────────────────────────────────────────────────────────┤
│ [Search] [Filter ▼] [View: Grid▼] Selected: 0 [Actions]│
├─────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│ │ [✓]    │ │ [ ]    │ │ [ ]    │ │ [★]    │           │
│ │[Photo] │ │[Photo] │ │[Photo] │ │[Photo] │           │
│ │        │ │        │ │        │ │ COVER  │           │
│ │[Edit]  │ │[Edit]  │ │[Edit]  │ │[Edit]  │           │
│ └────────┘ └────────┘ └────────┘ └────────┘           │
├─────────────────────────────────────────────────────────┤
│ Photo Details Panel (Selected Photo)                   │
│ Title: [Event Photo 1]                                 │
│ Description: [Event description...]                    │
│ Tags: [tag1] [tag2] [+ Add]                           │
│ Visibility: [Visible ▼] [Set as Cover] [Delete]       │
└─────────────────────────────────────────────────────────┘
```

### Advanced Features:
- **Photo Grid**: Thumbnail view with selection checkboxes
- **Cover Photo Indicator**: Visual marker for gallery cover
- **Inline Editing**: Quick edit overlay for metadata
- **Drag & Drop Reordering**: Visual photo sequence management
- **Details Panel**: Expandable sidebar for metadata editing
- **Batch Operations**: Multi-select for bulk actions

### Wireframe: Photo Details Panel

```
┌─────────────────────────┐
│ Photo Details           │
├─────────────────────────┤
│ [Large Preview]         │
├─────────────────────────┤
│ Title: [____________]   │
│ Description:            │
│ [________________]      │
│ [________________]      │
│                         │
│ Alt Text: [________]    │
│ Caption: [_________]    │
│                         │
│ Tags: [tag1] [x] [tag2] │
│ [+ Add Tag]             │
│                         │
│ Visibility: [Visible ▼] │
│ Sort Order: [___]       │
│                         │
│ ┌─ EXIF Data ──────────┐│
│ │ Camera: Canon EOS R5  ││
│ │ Lens: 24-70mm f/2.8   ││
│ │ ISO: 400             ││
│ │ Aperture: f/4        ││
│ │ Shutter: 1/125s      ││
│ │ Date: Dec 15, 2024   ││
│ └──────────────────────┘│
│                         │
│ [Set as Cover]          │
│ [Download Original]     │
│ [Delete Photo]          │
└─────────────────────────┘
```

## 3. Gallery Operations

### Create/Edit Gallery Form

```
┌─────────────────────────────────────────────────────────┐
│ Create New Gallery                                      │
├─────────────────────────────────────────────────────────┤
│ Basic Information                                       │
│ Title: [________________________________]             │
│ Slug: [summer-events-2024] [Auto-generate ✓]          │
│ Description:                                            │
│ [_________________________________________________]     │
│ [_________________________________________________]     │
│                                                         │
│ Privacy & Visibility                                    │
│ Privacy Level: ( ) Public (•) Members Only ( ) Private │
│ Visibility: (•) Visible ( ) Hidden ( ) Archived        │
│                                                         │
│ Settings                                                │
│ Featured Gallery: [ ] Promote on homepage              │
│ Allow Downloads: [✓] Enable photo downloads            │
│ Allow Comments: [✓] Enable photo comments              │
│ Show Metadata: [✓] Display EXIF data                   │
│                                                         │
│ Tags: [event] [summer] [2024] [+ Add]                  │
│                                                         │
│ Owner (Admin Only)                                      │
│ Owner Type: [User ▼] Owner: [Select User ▼]            │
│                                                         │
│ [Cancel] [Save Draft] [Create Gallery]                 │
└─────────────────────────────────────────────────────────┘
```

### Bulk Upload Interface

```
┌─────────────────────────────────────────────────────────┐
│ Bulk Photo Upload - Gallery: "Summer Events 2024"     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │     Drag & Drop Files Here or Click to Browse      │ │
│ │              [📁 Choose Files]                      │ │
│ │     Supported: JPG, PNG, WEBP (Max 10MB each)      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Upload Queue (5 files)                                 │
│ ┌─ File 1 ────────────────────────────────────────────┐ │
│ │ event-001.jpg (2.1MB) [████████░░] 80% Processing   │ │
│ │ Title: [Event Photo 1] Tags: [event,summer]         │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─ File 2 ────────────────────────────────────────────┐ │
│ │ event-002.jpg (1.8MB) [██████████] ✓ Complete       │ │
│ │ Title: [Event Photo 2] Tags: [event,summer]         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Global Settings                                         │
│ Auto-generate Titles: [✓] Use filename                 │
│ Default Tags: [event] [summer] [2024]                  │
│ Visibility: [Visible ▼]                                │
│ Require Approval: [ ] Send to moderation queue         │
│                                                         │
│ Progress: 2/5 Complete [Cancel Upload] [Start Upload]  │
└─────────────────────────────────────────────────────────┘
```

## 4. Technical Architecture

### Component Structure

```typescript
// Core Admin Gallery Types
interface AdminGalleryView {
  id: string;
  title: string;
  description?: string;
  photoCount: number;
  coverPhotoUrl?: string;
  privacyLevel: 'public' | 'members_only' | 'private';
  visibility: 'visible' | 'hidden' | 'archived';
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    type: 'user' | 'group' | 'company';
  };
  stats: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  moderationStatus: 'approved' | 'pending' | 'rejected';
}

interface AdminPhotoView {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  thumbnailUrl: string;
  mediumUrl: string;
  originalUrl: string;
  visibility: 'visible' | 'hidden';
  sortOrder: number;
  isCover: boolean;
  tags: string[];
  metadata: PhotoMetadata;
  uploadedAt: string;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  stats: {
    viewCount: number;
    downloadCount: number;
  };
}

interface AdminGalleryFilters {
  search?: string;
  privacyLevel?: string[];
  visibility?: string[];
  ownerType?: string[];
  dateRange?: { start: string; end: string };
  moderationStatus?: string[];
  featured?: boolean;
  tags?: string[];
}

interface BulkOperation {
  type: 'delete' | 'privacy' | 'visibility' | 'move' | 'tag' | 'moderate';
  itemIds: string[];
  payload?: any;
}
```

### State Management Architecture

```typescript
// Redux Slice for Admin Gallery Management
interface AdminGalleryState {
  // Gallery Overview
  galleries: AdminGalleryView[];
  galleryFilters: AdminGalleryFilters;
  selectedGalleries: string[];
  
  // Photo Management
  currentGallery: AdminGalleryView | null;
  photos: AdminPhotoView[];
  photoFilters: AdminPhotoFilters;
  selectedPhotos: string[];
  
  // UI State
  view: 'grid' | 'list' | 'table';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pageSize: number;
  currentPage: number;
  
  // Modals & Panels
  showGalleryForm: boolean;
  showPhotoDetails: boolean;
  showBulkActions: boolean;
  showModerationQueue: boolean;
  
  // Loading States
  loading: {
    galleries: boolean;
    photos: boolean;
    operations: boolean;
  };
  
  // Error Handling
  errors: {
    galleries?: string;
    photos?: string;
    operations?: string;
  };
}
```

## 5. API Specifications

### Admin Gallery Endpoints

```typescript
// Gallery Management API
interface AdminGalleryApi {
  // Gallery CRUD
  getAdminGalleries(params: {
    page?: number;
    limit?: number;
    filters?: AdminGalleryFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    galleries: AdminGalleryView[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;

  getAdminGallery(id: string): Promise<AdminGalleryView>;
  createAdminGallery(data: CreateGalleryInput): Promise<AdminGalleryView>;
  updateAdminGallery(id: string, data: UpdateGalleryInput): Promise<AdminGalleryView>;
  deleteAdminGallery(id: string): Promise<boolean>;

  // Photo Management
  getAdminGalleryPhotos(galleryId: string, params?: {
    page?: number;
    limit?: number;
    filters?: AdminPhotoFilters;
  }): Promise<{
    photos: AdminPhotoView[];
    totalCount: number;
  }>;

  updateAdminPhoto(photoId: string, data: UpdatePhotoData): Promise<AdminPhotoView>;
  deleteAdminPhoto(photoId: string): Promise<boolean>;
  reorderAdminPhotos(galleryId: string, photoOrders: { id: string; order: number }[]): Promise<boolean>;
  setCoverPhoto(galleryId: string, photoId: string): Promise<boolean>;

  // Bulk Operations
  bulkUpdateGalleries(operation: BulkOperation): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }>;

  bulkUpdatePhotos(operation: BulkOperation): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }>;

  // Moderation
  getModerationQueue(params?: {
    entityType?: 'gallery' | 'photo';
    page?: number;
    limit?: number;
  }): Promise<{
    items: ModerationItem[];
    totalCount: number;
  }>;

  approveModeration(itemId: string, notes?: string): Promise<boolean>;
  rejectModeration(itemId: string, notes: string): Promise<boolean>;

  // Analytics & Stats
  getGalleryAnalytics(galleryId: string, timeframe: string): Promise<GalleryAnalytics>;
  getPhotoAnalytics(photoId: string, timeframe: string): Promise<PhotoAnalytics>;
  getAdminDashboardStats(): Promise<AdminGalleryStats>;
}
```

### Extended Database Schema

```sql
-- Additional admin-specific views and functions
CREATE OR REPLACE VIEW admin_galleries AS
SELECT 
  g.*,
  u.name as owner_name,
  u.email as owner_email,
  (SELECT COUNT(*) FROM gallery_photos WHERE gallery_id = g.id) as photo_count,
  (SELECT COUNT(*) FROM gallery_likes WHERE gallery_id = g.id) as like_count,
  (SELECT COUNT(*) FROM gallery_comments WHERE gallery_id = g.id) as comment_count,
  CASE 
    WHEN EXISTS(SELECT 1 FROM moderation_queue WHERE entity_type = 'gallery' AND entity_id = g.id AND status = 'pending') 
    THEN 'pending'
    ELSE 'approved'
  END as moderation_status
FROM user_galleries g
LEFT JOIN auth.users u ON g.user_id = u.id;

CREATE OR REPLACE VIEW admin_photos AS
SELECT 
  p.*,
  g.title as gallery_title,
  u.name as uploader_name,
  u.email as uploader_email,
  CASE 
    WHEN EXISTS(SELECT 1 FROM moderation_queue WHERE entity_type = 'photo' AND entity_id = p.id AND status = 'pending') 
    THEN 'pending'
    ELSE 'approved'
  END as moderation_status
FROM gallery_photos p
LEFT JOIN user_galleries g ON p.gallery_id = g.id
LEFT JOIN auth.users u ON p.user_id = u.id;

-- Admin functions for bulk operations
CREATE OR REPLACE FUNCTION admin_bulk_update_galleries(
  gallery_ids uuid[],
  update_data jsonb
) RETURNS TABLE (
  id uuid,
  success boolean,
  error_message text
) AS $$
BEGIN
  -- Implementation for bulk gallery updates
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 6. Permission & Security System

### Role-Based Access Control

```typescript
interface AdminPermissions {
  galleries: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    moderate: boolean;
    bulkOperations: boolean;
  };
  photos: {
    view: boolean;
    upload: boolean;
    edit: boolean;
    delete: boolean;
    moderate: boolean;
    downloadOriginal: boolean;
  };
  users: {
    viewProfiles: boolean;
    manageGalleries: boolean;
  };
  system: {
    viewAnalytics: boolean;
    manageSettings: boolean;
    auditLog: boolean;
  };
}

// Permission middleware
const checkAdminPermission = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;
    if (!hasAdminPermission(user, action, resource)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Security Features

1. **Audit Logging**: Track all admin actions with IP, timestamp, and changes
2. **Permission Validation**: Row-level security for data access
3. **File Security**: Secure storage access with signed URLs
4. **Rate Limiting**: Prevent abuse of bulk operations
5. **Input Validation**: Sanitize all user inputs and file uploads
6. **CSRF Protection**: Secure form submissions

## 7. Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load photos on-demand with intersection observer
2. **Image Optimization**: Multiple size variants with WebP support
3. **Caching**: Redis cache for frequently accessed galleries
4. **Database Indexing**: Optimized queries for large datasets
5. **CDN Integration**: Fast global image delivery
6. **Pagination**: Efficient large dataset handling
7. **Search Optimization**: Full-text search with PostgreSQL

### Monitoring & Analytics

1. **Performance Metrics**: Track load times and user interactions
2. **Error Tracking**: Comprehensive error logging and alerts
3. **Usage Analytics**: Admin action tracking and reporting
4. **Storage Monitoring**: Track storage usage and costs
5. **User Experience**: Monitor admin workflow efficiency

## 8. Implementation Phases

### Phase 1: Core Infrastructure
- Admin gallery overview with basic CRUD
- Photo grid view and management
- Permission system implementation

### Phase 2: Advanced Features
- Bulk operations and batch upload
- Photo reordering and cover selection
- Search and filtering enhancements

### Phase 3: Workflow & Moderation
- Approval workflows
- Moderation queue
- User management integration

### Phase 4: Analytics & Optimization
- Analytics dashboard
- Performance monitoring
- Advanced reporting

## Conclusion

This comprehensive admin gallery management system provides a robust, scalable solution for managing user-generated photo content. The architecture leverages existing infrastructure while adding powerful administrative capabilities through an intuitive, feature-rich interface.

The system prioritizes security, performance, and user experience while maintaining flexibility for future enhancements and integrations.