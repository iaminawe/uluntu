# Admin Gallery Management API Reference

This document provides comprehensive documentation for the admin gallery management API endpoints, including authentication, request/response formats, and usage examples.

## Table of Contents

1. [Authentication](#authentication)
2. [Photo Management APIs](#photo-management-apis)
3. [Gallery Management APIs](#gallery-management-apis)
4. [Admin Features](#admin-features)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Security Considerations](#security-considerations)

## Authentication

All admin gallery endpoints require authentication and proper admin roles:

- **Required Role**: `super_admin`, `admin`, or `moderator` (varies by endpoint)
- **Authentication**: Bearer token in Authorization header
- **Session**: Valid Supabase session required

```typescript
// Headers required for all requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Photo Management APIs

### GET /api/admin/galleries/{galleryId}/photos

List photos in a gallery with admin metadata and filtering options.

**Parameters:**
- `galleryId` (string, required): UUID of the gallery
- Query parameters for filtering and pagination

**Query Parameters:**
```typescript
{
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 20, max: 100)
  search?: string;         // Search in title, description, filename
  moderation_status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  visibility?: 'visible' | 'hidden';
  file_type?: string;      // MIME type prefix (e.g., 'image/jpeg')
  created_after?: string;  // ISO date string
  created_before?: string; // ISO date string
  min_file_size?: number;  // Bytes
  max_file_size?: number;  // Bytes
  has_reports?: boolean;   // Photos with user reports
  sort_by?: 'created_at' | 'updated_at' | 'file_size' | 'view_count' | 'like_count';
  sort_order?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  data: {
    photos: AdminPhotoStats[];
    total_count: number;
    current_page: number;
    total_pages: number;
    has_more: boolean;
    filters_applied: AdminPhotoFilters;
  };
  error: null;
  status: 200;
}
```

**Example Usage:**
```typescript
import { adminGalleryApi } from '@/features/admin/api/galleryAdmin';

const { data, error } = await adminGalleryApi.getGalleryPhotosAdmin(
  'gallery-uuid',
  {
    page: 1,
    limit: 20,
    moderation_status: 'pending',
    sort_by: 'created_at',
    sort_order: 'desc'
  }
);
```

### DELETE /api/admin/photos/{photoId}

Delete an individual photo with admin privileges.

**Parameters:**
- `photoId` (string, required): UUID of the photo to delete

**Request Body:**
```typescript
{
  reason?: string; // Optional deletion reason for audit log
}
```

**Response:**
```typescript
{
  data: { success: boolean };
  error: null;
  status: 200;
}
```

**Example:**
```typescript
await adminGalleryApi.deletePhotoAdmin(
  'photo-uuid',
  'Violates community guidelines'
);
```

### PATCH /api/admin/photos/{photoId}

Update photo metadata with admin privileges.

**Parameters:**
- `photoId` (string, required): UUID of the photo to update

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: 'visible' | 'hidden';
  moderation_status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderation_notes?: string;
}
```

**Response:**
```typescript
{
  data: AdminPhotoStats;
  error: null;
  status: 200;
}
```

### POST /api/admin/galleries/{galleryId}/photos/reorder

Reorder photos within a gallery.

**Parameters:**
- `galleryId` (string, required): UUID of the gallery

**Request Body:**
```typescript
{
  gallery_id: string;
  photo_orders: Array<{
    photo_id: string;
    sort_order: number;
  }>;
}
```

**Response:**
```typescript
{
  data: { success: boolean };
  error: null;
  status: 200;
}
```

### POST /api/admin/photos/bulk-delete

Delete multiple photos in a single operation.

**Request Body:**
```typescript
{
  photo_ids: string[];
  reason?: string; // Optional reason for audit log
}
```

**Response:**
```typescript
{
  data: {
    success_count: number;
    error_count: number;
    total_requested: number;
    successful_items: string[];
    failed_items: Array<{
      id: string;
      error: string;
    }>;
    operation_id: string;
    completed_at: string;
  };
  error: null;
  status: 200;
}
```

## Gallery Management APIs

### GET /api/admin/galleries

List all galleries with admin statistics and filtering.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  user_id?: string;
  privacy_level?: 'public' | 'members_only' | 'private';
  visibility?: 'visible' | 'hidden' | 'archived';
  moderation_status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_after?: string;
  created_before?: string;
  min_photos?: number;
  max_photos?: number;
  has_flagged_content?: boolean;
  storage_usage_min?: number;
  storage_usage_max?: number;
  sort_by?: 'created_at' | 'updated_at' | 'photo_count' | 'view_count' | 'storage_usage';
  sort_order?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  data: {
    galleries: AdminGalleryStats[];
    total_count: number;
    current_page: number;
    total_pages: number;
    has_more: boolean;
    filters_applied: AdminGalleryFilters;
  };
  error: null;
  status: 200;
}
```

### DELETE /api/admin/galleries/{galleryId}

Delete a gallery and all its photos.

**Parameters:**
- `galleryId` (string, required): UUID of the gallery

**Request Body:**
```typescript
{
  reason?: string; // Optional deletion reason
}
```

**Response:**
```typescript
{
  data: { success: boolean };
  error: null;
  status: 200;
}
```

### PATCH /api/admin/galleries/{galleryId}

Update gallery metadata with admin privileges.

**Parameters:**
- `galleryId` (string, required): UUID of the gallery

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
  privacy_level?: 'public' | 'members_only' | 'private';
  visibility?: 'visible' | 'hidden' | 'archived';
  tags?: string[];
  is_featured?: boolean;
}
```

**Response:**
```typescript
{
  data: AdminGalleryStats;
  error: null;
  status: 200;
}
```

### POST /api/admin/galleries/{galleryId}/photos/upload

Bulk upload photos to a gallery with admin validation.

**Parameters:**
- `galleryId` (string, required): UUID of the gallery

**Request Body:**
- Multipart form data with files

**Response:**
```typescript
{
  data: {
    success_count: number;
    error_count: number;
    total_requested: number;
    successful_items: string[];
    failed_items: Array<{
      id: string;
      error: string;
    }>;
    operation_id: string;
    completed_at: string;
  };
  error: null;
  status: 200;
}
```

## Admin Features

### GET /api/admin/analytics/storage

Get comprehensive storage analytics.

**Response:**
```typescript
{
  data: {
    total_storage_used: number;
    total_photos: number;
    total_galleries: number;
    average_file_size: number;
    storage_by_user: Array<{
      user_id: string;
      user_name: string;
      user_email: string;
      storage_used: number;
      photo_count: number;
      gallery_count: number;
    }>;
    storage_by_month: Array<{
      month: string;
      storage_added: number;
      photos_added: number;
    }>;
    largest_files: Array<{
      id: string;
      file_name: string;
      file_size: number;
      user_name: string;
      gallery_title: string;
    }>;
  };
  error: null;
  status: 200;
}
```

### GET /api/admin/moderation/photos

Get photo moderation queue.

**Query Parameters:**
```typescript
{
  status?: 'pending' | 'under_review' | 'resolved';
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  data: {
    queue_items: PhotoModerationQueue[];
    total_pending: number;
    total_under_review: number;
    current_page: number;
    total_pages: number;
  };
  error: null;
  status: 200;
}
```

### GET /api/admin/audit-logs

Get admin audit logs for gallery operations.

**Query Parameters:**
```typescript
{
  admin_id?: string;
  entity_type?: 'gallery' | 'photo' | 'user' | 'system';
  action?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  data: {
    logs: AdminAuditLog[];
    total: number;
  };
  error: null;
  status: 200;
}
```

## Error Handling

All endpoints follow a consistent error response format:

```typescript
{
  data: null;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  status: number;
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `FETCH_ERROR` | 500 | Database query failed |
| `UPLOAD_ERROR` | 500 | File upload failed |
| `DELETE_ERROR` | 500 | Deletion operation failed |
| `SERVER_ERROR` | 500 | Internal server error |

### Error Response Examples

```typescript
// Unauthorized access
{
  data: null,
  error: {
    message: "Admin access required",
    code: "UNAUTHORIZED"
  },
  status: 401
}

// Validation error
{
  data: null,
  error: {
    message: "Invalid file type",
    code: "VALIDATION_ERROR",
    details: {
      allowed_types: ["image/jpeg", "image/png"],
      received_type: "application/pdf"
    }
  },
  status: 400
}
```

## Rate Limiting

Admin API endpoints are subject to rate limiting to prevent abuse:

- **Standard endpoints**: 1000 requests per hour per admin user
- **Bulk operations**: 50 requests per hour per admin user
- **Analytics endpoints**: 200 requests per hour per admin user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Security Considerations

### Authentication & Authorization

1. **Multi-layer Security**: API endpoints implement both authentication checks and role-based authorization
2. **Supabase RLS**: Database operations are protected by Row Level Security policies
3. **Admin Role Verification**: Each endpoint verifies admin roles before processing

### Audit Logging

All admin operations are logged with:
- Admin user ID and details
- Action performed
- Entity affected
- Timestamp and IP address
- Request details and changes made

### Input Validation

1. **File Validation**: Uploaded files are validated for type, size, and content
2. **Data Sanitization**: All input data is sanitized and validated
3. **SQL Injection Prevention**: Parameterized queries prevent SQL injection
4. **XSS Protection**: Output is properly escaped

### Storage Security

1. **Secure Storage**: Files are stored in Supabase Storage with proper access controls
2. **Path Validation**: Storage paths are validated to prevent directory traversal
3. **File Cleanup**: Orphaned files are automatically cleaned up on deletion

## Usage Examples

### React Hook Usage

```typescript
import { useAdminGalleries, useDeletePhotoAdmin, useBulkDeletePhotos } from '@/features/admin/hooks/useAdminGallery';

function AdminGalleryManager() {
  // Fetch galleries with filtering
  const { data: galleries, isLoading } = useAdminGalleries({
    page: 1,
    limit: 20,
    has_flagged_content: true
  });

  // Delete single photo
  const deletePhoto = useDeletePhotoAdmin();
  
  // Bulk delete photos
  const { mutate: bulkDelete, progress } = useBulkDeletePhotos();

  const handleDeletePhoto = (photoId: string) => {
    deletePhoto.mutate({
      photoId,
      reason: 'Community guidelines violation'
    });
  };

  const handleBulkDelete = (photoIds: string[]) => {
    bulkDelete({
      photoIds,
      reason: 'Bulk cleanup operation'
    });
  };

  // ... component implementation
}
```

### Validation Usage

```typescript
import { adminGalleryValidation } from '@/features/admin/api/galleryValidation';

// Validate photo upload
const validation = await adminGalleryValidation.validatePhotoUpload(file, galleryId);
if (!validation.file_size_valid) {
  console.error('File too large:', validation.errors);
}

// Validate bulk operation
const bulkValidation = adminGalleryValidation.validateBulkOperation(
  selectedPhotos.length,
  'delete'
);
if (!bulkValidation.valid) {
  console.error('Bulk operation invalid:', bulkValidation.errors);
}
```

### Audit Logging Usage

```typescript
import { galleryAuditLogger } from '@/features/admin/api/galleryAuditLogger';

// Log photo deletion
await galleryAuditLogger.logPhotoAction({
  adminId: currentUser.id,
  action: 'DELETE_PHOTO',
  photoId: 'photo-uuid',
  details: {
    photo_name: 'example.jpg',
    gallery_title: 'My Gallery',
    reason: 'Policy violation'
  },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent']
});

// Get audit trail for specific photo
const auditTrail = await galleryAuditLogger.getEntityAuditTrail({
  entityType: 'photo',
  entityId: 'photo-uuid',
  limit: 50
});
```

## Testing

### Unit Testing

```typescript
describe('AdminGalleryAPI', () => {
  it('should delete photo with proper validation', async () => {
    const result = await adminGalleryApi.deletePhotoAdmin('photo-id', 'test reason');
    expect(result.data.success).toBe(true);
    expect(result.status).toBe(200);
  });

  it('should handle bulk operations correctly', async () => {
    const result = await adminGalleryApi.bulkDeletePhotos(['id1', 'id2']);
    expect(result.data.success_count).toBeGreaterThan(0);
  });
});
```

### Integration Testing

```typescript
describe('Admin Gallery Integration', () => {
  it('should enforce admin permissions', async () => {
    // Test with non-admin user
    const result = await adminGalleryApi.deletePhotoAdmin('photo-id');
    expect(result.status).toBe(401);
    expect(result.error?.code).toBe('UNAUTHORIZED');
  });
});
```

This API reference provides comprehensive documentation for implementing and using the admin gallery management system with proper security, validation, and audit logging.