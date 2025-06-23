# Gallery API Reference

## Overview

This document provides detailed API reference for the Gallery System, including all endpoints, request/response formats, error codes, and usage examples.

## Table of Contents

- [Authentication](#authentication)
- [Gallery Operations](#gallery-operations)
- [Photo Operations](#photo-operations)
- [Batch Operations](#batch-operations)
- [Interaction Operations](#interaction-operations)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [File Upload Guidelines](#file-upload-guidelines)

## Authentication

All API requests require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Gallery Operations

### Get All Galleries

Retrieve galleries with pagination and filtering support.

**Endpoint:** `GET /api/galleries`

**Parameters:**
```typescript
interface GalleryFilters {
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 12, max: 100)
  search?: string;         // Search in title/description
  privacy?: 'public' | 'private' | 'unlisted';
  tags?: string[];         // Filter by tags
  ownerType?: string;      // Filter by owner type
  ownerId?: string;        // Filter by specific owner
  dateRange?: {            // Filter by creation date
    start: string;         // ISO date string
    end: string;           // ISO date string
  };
}
```

**Response:**
```typescript
interface GalleriesResponse {
  galleries: Gallery[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
```

**Example:**
```javascript
// Fetch public galleries, page 2, with search
const response = await fetch('/api/galleries?page=2&limit=12&privacy=public&search=nature');
const data = await response.json();
```

### Get Single Gallery

Retrieve a specific gallery with all photos.

**Endpoint:** `GET /api/galleries/:id`

**Parameters:**
- `id` (string): Gallery ID

**Response:**
```typescript
interface Gallery {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  slug: string;
  privacy_level: 'public' | 'private' | 'members_only';
  visibility: 'visible' | 'hidden';
  cover_photo_id?: string;
  cover_photo_url?: string;
  photo_count: number;
  view_count: number;
  is_featured: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
  photos: Photo[];
  owner: {
    id: string;
    name: string;
    image?: string;
  };
}
```

**Example:**
```javascript
const response = await fetch('/api/galleries/123e4567-e89b-12d3-a456-426614174000');
const gallery = await response.json();
```

### Create Gallery

Create a new gallery.

**Endpoint:** `POST /api/galleries`

**Request Body:**
```typescript
interface CreateGalleryInput {
  title: string;
  description?: string;
  privacy_level: 'public' | 'private' | 'members_only';
  visibility?: 'visible' | 'hidden';
  tags?: string[];
  is_featured?: boolean;
}
```

**Response:** `Gallery` object

**Example:**
```javascript
const response = await fetch('/api/galleries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    title: 'My Nature Gallery',
    description: 'Beautiful landscapes and wildlife',
    privacy_level: 'public',
    tags: ['nature', 'landscape']
  })
});
```

### Update Gallery

Update an existing gallery.

**Endpoint:** `PUT /api/galleries/:id`

**Parameters:**
- `id` (string): Gallery ID

**Request Body:** `Partial<Gallery>`

**Response:** `Gallery` object

**Example:**
```javascript
const response = await fetch('/api/galleries/123e4567-e89b-12d3-a456-426614174000', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    title: 'Updated Gallery Title',
    description: 'Updated description'
  })
});
```

### Delete Gallery

Delete a gallery and all its photos.

**Endpoint:** `DELETE /api/galleries/:id`

**Parameters:**
- `id` (string): Gallery ID

**Response:** `{ success: boolean }`

**Example:**
```javascript
const response = await fetch('/api/galleries/123e4567-e89b-12d3-a456-426614174000', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer <token>'
  }
});
```

## Photo Operations

### Get Gallery Photos

Retrieve photos for a specific gallery with pagination.

**Endpoint:** `GET /api/galleries/:galleryId/photos`

**Parameters:**
- `galleryId` (string): Gallery ID
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:** `Photo[]`

**Example:**
```javascript
const response = await fetch('/api/galleries/123e4567-e89b-12d3-a456-426614174000/photos?page=1&limit=20');
const photos = await response.json();
```

### Upload Photo

Upload a single photo to a gallery.

**Endpoint:** `POST /api/galleries/:galleryId/photos`

**Parameters:**
- `galleryId` (string): Gallery ID

**Request Body:** `FormData` with the following fields:
```typescript
interface PhotoUploadInput {
  file: File;                    // The image file
  title?: string;                // Photo title
  description?: string;          // Photo description
  tags?: string[];              // Photo tags
  dimensions?: {                // Image dimensions
    width: number;
    height: number;
    aspectRatio: number;
  };
  placeholder?: string;         // Base64 placeholder
  dominantColor?: string;       // Dominant color
  processedImages?: {           // Pre-processed variants
    original?: File;
    large?: File;
    medium?: File;
    small?: File;
    thumbnail?: File;
  };
}
```

**Response:**
```typescript
interface Photo {
  id: string;
  gallery_id: string;
  user_id: string;
  file_name: string;
  original_file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  // Image variants
  original_path?: string;
  large_path?: string;
  medium_path?: string;
  small_path?: string;
  thumbnail_path?: string;
  // URLs
  url?: string;
  original_url?: string;
  large_url?: string;
  medium_url?: string;
  small_url?: string;
  thumbnail_url?: string;
  // Metadata
  width: number;
  height: number;
  aspect_ratio?: number;
  placeholder_data?: string;
  dominant_color?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  // Content
  title?: string;
  description?: string;
  alt_text?: string;
  tags?: string[];
  sort_order: number;
  visibility: 'visible' | 'hidden';
  like_count?: number;
  is_liked?: boolean;
  created_at: string;
}
```

**Example:**
```javascript
const formData = new FormData();
formData.append('file', photoFile);
formData.append('title', 'Sunset at the Beach');
formData.append('description', 'Beautiful sunset captured at Malibu Beach');
formData.append('tags', JSON.stringify(['sunset', 'beach', 'nature']));

const response = await fetch('/api/galleries/123e4567-e89b-12d3-a456-426614174000/photos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

### Update Photo

Update photo metadata.

**Endpoint:** `PUT /api/photos/:id`

**Parameters:**
- `id` (string): Photo ID

**Request Body:** `Partial<Photo>`

**Response:** `Photo` object

**Example:**
```javascript
const response = await fetch('/api/photos/456e7890-e89b-12d3-a456-426614174001', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    title: 'Updated Photo Title',
    description: 'Updated description',
    tags: ['updated', 'tags']
  })
});
```

### Delete Photo

Delete a photo and its files.

**Endpoint:** `DELETE /api/photos/:id`

**Parameters:**
- `id` (string): Photo ID

**Response:** `{ success: boolean }`

**Example:**
```javascript
const response = await fetch('/api/photos/456e7890-e89b-12d3-a456-426614174001', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer <token>'
  }
});
```

## Batch Operations

### Batch Upload Photos

Upload multiple photos to a gallery.

**Endpoint:** `POST /api/galleries/:galleryId/photos/batch`

**Parameters:**
- `galleryId` (string): Gallery ID

**Request Body:** `FormData` with multiple files and metadata

**Response:**
```typescript
interface BatchUploadResult {
  success: Photo[];
  failed: Array<{
    input: PhotoUploadInput;
    error: string;
  }>;
}
```

**Example:**
```javascript
const formData = new FormData();
files.forEach((file, index) => {
  formData.append(`files`, file);
  formData.append(`metadata_${index}`, JSON.stringify({
    title: file.name,
    tags: ['batch', 'upload']
  }));
});

const response = await fetch('/api/galleries/123e4567-e89b-12d3-a456-426614174000/photos/batch', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

### Batch Delete Photos

Delete multiple photos.

**Endpoint:** `DELETE /api/photos/batch`

**Request Body:**
```json
{
  "photoIds": ["id1", "id2", "id3"],
  "galleryId": "gallery-id"
}
```

**Response:** `{ success: boolean }`

### Reorder Photos

Update the sort order of photos in a gallery.

**Endpoint:** `PUT /api/galleries/:galleryId/photos/reorder`

**Parameters:**
- `galleryId` (string): Gallery ID

**Request Body:**
```typescript
interface ReorderRequest {
  photoOrders: Array<{
    id: string;
    order: number;
  }>;
}
```

**Response:** `{ success: boolean }`

**Example:**
```javascript
const response = await fetch('/api/galleries/123e4567-e89b-12d3-a456-426614174000/photos/reorder', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    photoOrders: [
      { id: 'photo1', order: 0 },
      { id: 'photo2', order: 1 },
      { id: 'photo3', order: 2 }
    ]
  })
});
```

## Interaction Operations

### Increment View Count

Increment the view count for a gallery.

**Endpoint:** `POST /api/galleries/:id/view`

**Parameters:**
- `id` (string): Gallery ID

**Response:** `{ success: boolean }`

### Toggle Gallery Like

Like or unlike a gallery.

**Endpoint:** `POST /api/galleries/:id/like`

**Parameters:**
- `id` (string): Gallery ID

**Response:** `{ isLiked: boolean }`

### Toggle Photo Like

Like or unlike a photo.

**Endpoint:** `POST /api/photos/:id/like`

**Parameters:**
- `id` (string): Photo ID

**Response:** `{ isLiked: boolean }`

## Error Handling

### Error Response Format

All errors return a consistent format:

```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
  path: string;
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `413` - Payload Too Large (file size exceeded)
- `422` - Unprocessable Entity (invalid file type)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Codes

| Code | Description | Recoverable | Retry |
|------|-------------|-------------|-------|
| `NETWORK_ERROR` | Connection issues | Yes | Yes |
| `UNAUTHORIZED` | Authentication required | Yes | No |
| `FORBIDDEN` | Insufficient permissions | No | No |
| `FILE_TOO_LARGE` | File exceeds size limit | Yes | No |
| `INVALID_FILE_TYPE` | Unsupported file format | Yes | No |
| `TOO_MANY_FILES` | File count limit exceeded | Yes | No |
| `UPLOAD_FAILED` | Upload operation failed | Yes | Yes |
| `GALLERY_NOT_FOUND` | Gallery doesn't exist | No | No |
| `STORAGE_QUOTA_EXCEEDED` | Storage limit reached | No | No |

**Example Error Response:**
```json
{
  "code": "FILE_TOO_LARGE",
  "message": "File size exceeds maximum allowed size",
  "details": "File size: 15MB, Maximum allowed: 10MB",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/galleries/123/photos"
}
```

## Rate Limiting

API requests are rate limited to prevent abuse:

- **General API**: 1000 requests per hour per user
- **Upload Operations**: 100 uploads per hour per user
- **Batch Operations**: 10 batch operations per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
```

## File Upload Guidelines

### Supported File Types

- **Images**: JPEG, PNG, WebP, GIF
- **Maximum File Size**: 10MB per file
- **Maximum Batch Size**: 50 files per batch
- **Maximum Total Size**: 100MB per batch

### File Processing

1. **Validation**: File type, size, and format validation
2. **Image Processing**: Automatic resizing and optimization
3. **Variant Generation**: Multiple sizes (thumbnail, small, medium, large)
4. **Storage**: Secure upload to Supabase Storage
5. **Metadata Extraction**: Dimensions, dominant color, placeholder generation

### Storage Paths

Files are stored with the following structure:
```
/users/{userId}/galleries/{galleryId}/
├── original/
├── large/
├── medium/
├── small/
└── thumbnail/
```

### URL Structure

```
https://storage.supabase.com/v1/object/public/gallery-photos/users/{userId}/galleries/{galleryId}/{variant}/{filename}
```

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
import { galleryApi } from '@/features/gallery/api/galleryApi';

// Get galleries
const galleries = await galleryApi.getAllGalleries({
  page: 1,
  limit: 12,
  privacy: 'public'
});

// Upload photo
const uploadInput = {
  file: photoFile,
  galleryId: 'gallery-id',
  title: 'My Photo',
  tags: ['nature', 'landscape']
};
const photo = await galleryApi.uploadPhoto(uploadInput);

// Batch upload
const batchInputs = files.map(file => ({
  file,
  galleryId: 'gallery-id',
  title: file.name
}));
const result = await galleryApi.batchUploadPhotos(batchInputs);
```

### React Hooks

```typescript
import { useGalleries, useUploadPhoto } from '@/features/gallery/hooks/useGalleryQueries';

function GalleryComponent() {
  const { data, isLoading } = useGalleries({ privacy: 'public' });
  const uploadMutation = useUploadPhoto();

  const handleUpload = (file: File) => {
    uploadMutation.mutate({
      file,
      galleryId: 'gallery-id',
      title: file.name
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.galleries.map(gallery => (
        <div key={gallery.id}>{gallery.title}</div>
      ))}
    </div>
  );
}
```

## Webhooks

Gallery system supports webhooks for real-time notifications:

### Events

- `gallery.created` - New gallery created
- `gallery.updated` - Gallery updated
- `gallery.deleted` - Gallery deleted
- `photo.uploaded` - Photo uploaded
- `photo.updated` - Photo updated
- `photo.deleted` - Photo deleted
- `batch.completed` - Batch upload completed

### Webhook Payload

```typescript
interface WebhookPayload {
  event: string;
  timestamp: string;
  data: {
    gallery?: Gallery;
    photo?: Photo;
    user: {
      id: string;
      email: string;
    };
  };
}
```

### Configuration

Webhooks can be configured in the admin panel or via API:

```typescript
const webhook = await fetch('/api/webhooks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <admin_token>'
  },
  body: JSON.stringify({
    url: 'https://your-app.com/webhooks/gallery',
    events: ['photo.uploaded', 'batch.completed'],
    secret: 'your-webhook-secret'
  })
});
```