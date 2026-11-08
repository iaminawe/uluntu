# Gallery Storage Architecture

## Overview

This document outlines the comprehensive Supabase storage architecture implemented for the photo gallery system, featuring user-specific folder structures, automated thumbnail generation, and robust security policies.

## Storage Bucket Structure

### Buckets

1. **gallery-photos** (Public)
   - Main bucket for original images
   - 50MB file size limit
   - Supports: JPEG, PNG, WebP, GIF, BMP, TIFF

2. **gallery-thumbnails** (Public)
   - Optimized thumbnails and medium-sized images
   - 10MB file size limit
   - Supports: JPEG, PNG, WebP

3. **gallery-temp** (Private)
   - Temporary uploads during processing
   - 50MB file size limit
   - Auto-cleanup after 24 hours

## Folder Structure

### User-Specific Organization

```
users/{userId}/galleries/{galleryId}/
├── originals/          # Full-resolution images
│   └── filename_timestamp.ext
├── thumbs/             # Thumbnail versions (300x300)
│   └── filename_thumb.webp
└── medium/             # Medium versions (800x800)
    └── filename_medium.webp
```

### Example Path Structure

```
users/123e4567-e89b-12d3-a456-426614174000/galleries/987fcdeb-51a2-43d7-8f9e-123456789abc/
├── originals/
│   ├── sunset_beach_1640995200000.jpg
│   └── mountain_view_1640995300000.png
├── thumbs/
│   ├── sunset_beach_thumb.webp
│   └── mountain_view_thumb.webp
└── medium/
    ├── sunset_beach_medium.webp
    └── mountain_view_medium.webp
```

## Database Schema

### Gallery Photos Table

```sql
CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- File information
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  
  -- Storage paths
  storage_path TEXT NOT NULL,        -- Original file path
  thumbnail_path TEXT,               -- Thumbnail path
  medium_path TEXT,                  -- Medium-sized version path
  
  -- Image metadata
  width INTEGER,
  height INTEGER,
  
  -- Organization
  title VARCHAR(255),
  description TEXT,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'visible',
  
  -- Processing status
  processing_status VARCHAR(20) DEFAULT 'completed',
  moderation_status VARCHAR(20) DEFAULT 'approved',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Security Policies (RLS)

### Gallery Photos Access

1. **Public Viewing**
   ```sql
   CREATE POLICY "Users can view public gallery photos" ON storage.objects
   FOR SELECT USING (
     bucket_id = 'gallery-photos' AND
     EXISTS (
       SELECT 1 FROM user_galleries ug
       JOIN gallery_photos gp ON ug.id = gp.gallery_id
       WHERE ug.privacy_level = 'public' 
         AND ug.visibility = 'visible'
         AND gp.visibility = 'visible'
         AND gp.moderation_status = 'approved'
         AND storage.objects.name = gp.storage_path
     )
   );
   ```

2. **User Upload Permissions**
   ```sql
   CREATE POLICY "Users can upload to their own gallery folder" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'gallery-photos' AND
     auth.uid()::text = (string_to_array(name, '/'))[2] AND
     name ~ '^users/[0-9a-f-]+/galleries/[0-9a-f-]+/(originals|thumbnails|medium)/[^/]+\.(jpg|jpeg|png|webp|gif|bmp|tiff)$'
   );
   ```

3. **Ownership Verification**
   ```sql
   CREATE POLICY "Users can delete their own gallery photos" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'gallery-photos' AND
     auth.uid()::text = (string_to_array(name, '/'))[2]
   );
   ```

## API Integration

### Storage Service Class

The `StorageService` singleton provides comprehensive file management:

```typescript
class StorageService {
  // Upload with user folder structure
  async uploadGalleryPhoto(options: FileUploadOptions): Promise<UploadResult>
  
  // Generate user-specific paths
  generateStoragePath(userId: string, galleryId: string, filename: string): string
  
  // File validation
  validateFile(file: File): { valid: boolean; error?: string }
  
  // Thumbnail generation
  private async generateThumbnails(userId: string, galleryId: string, file: File): Promise<void>
  
  // Cleanup operations
  async cleanupOrphanedFiles(): Promise<number>
  async deleteGalleryFiles(userId: string, galleryId: string): Promise<boolean>
}
```

### Updated Gallery API

The new gallery API integrates seamlessly with the storage service:

```typescript
// Upload with automatic thumbnail generation
const uploadResult = await storageService.uploadGalleryPhoto({
  userId: user.id,
  galleryId: input.galleryId,
  file: input.file,
  generateThumbnails: true
});

// Create database record with all paths
const photoData = {
  storage_path: uploadResult.data.path,
  thumbnail_path: storageService.generateThumbnailPath(uploadResult.data.path, 'thumb'),
  medium_path: storageService.generateThumbnailPath(uploadResult.data.path, 'medium'),
  // ... other fields
};
```

## File Validation

### Supported Formats

- **Images**: JPEG, PNG, WebP, GIF, BMP, TIFF
- **Max Size**: 50MB per file
- **Thumbnails**: Auto-generated in WebP format

### Validation Rules

```typescript
validateFile(file: File): {
  // Size check
  if (file.size > 52428800) return { valid: false, error: 'File too large' };
  
  // MIME type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', ...];
  if (!allowedTypes.includes(file.type)) return { valid: false, error: 'Invalid type' };
  
  // Extension check
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', ...];
  if (!allowedExtensions.includes(extension)) return { valid: false, error: 'Invalid extension' };
}
```

## Thumbnail Generation

### Automatic Processing

1. **Upload Flow**:
   - Original image uploaded to `originals/` folder
   - Thumbnails generated automatically
   - Saved to `thumbs/` and `medium/` folders
   - WebP format for optimization

2. **Size Configurations**:
   ```typescript
   thumbnailSizes: {
     thumb: { width: 300, height: 300 },
     medium: { width: 800, height: 800 }
   }
   ```

3. **Aspect Ratio Preservation**:
   - Maintains original aspect ratio
   - No cropping, only scaling
   - High-quality compression

## Storage Management

### Usage Tracking

```sql
-- Get user storage statistics
CREATE FUNCTION get_user_storage_usage(user_uuid UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_files', COUNT(*),
    'total_size_bytes', COALESCE(SUM(size), 0),
    'total_size_mb', ROUND(COALESCE(SUM(size), 0) / 1048576.0, 2),
    'photos_count', COUNT(*) FILTER (WHERE bucket_id = 'gallery-photos'),
    'thumbnails_count', COUNT(*) FILTER (WHERE bucket_id = 'gallery-thumbnails')
  ) FROM storage.objects
  WHERE (string_to_array(name, '/'))[2] = user_uuid::text;
$$;
```

### Cleanup Operations

1. **Orphaned Files**: Files without database records
2. **Temp Files**: Files older than 24 hours in temp bucket
3. **Automated Cleanup**: Runs daily via scheduled function

## Performance Optimizations

### CDN Integration

- Public buckets served via Supabase CDN
- Automatic caching with configurable TTL
- Global edge locations for fast delivery

### Image Optimization

- WebP format for thumbnails (smaller file sizes)
- Progressive JPEG for originals
- Responsive image serving

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_gallery_photos_storage_path ON gallery_photos(storage_path);
CREATE INDEX idx_gallery_photos_user_gallery ON gallery_photos(user_id, gallery_id);
CREATE INDEX idx_storage_objects_name_pattern ON storage.objects(name) 
  WHERE bucket_id IN ('gallery-photos', 'gallery-thumbnails');
```

## Error Handling

### Upload Failures

```typescript
// Automatic cleanup on failure
if (error) {
  await storageService.deleteFile('gallery-photos', storagePath);
  throw error;
}
```

### Storage Quota

- Monitor user storage usage
- Implement quotas per user/plan
- Graceful degradation when limits reached

## Monitoring and Analytics

### Storage Views

```sql
-- Storage usage by user
CREATE VIEW storage_usage_by_user AS
SELECT 
  user_id,
  COUNT(*) as total_files,
  SUM(size) as total_size_bytes,
  MAX(created_at) as last_upload
FROM storage.objects o
WHERE bucket_id IN ('gallery-photos', 'gallery-thumbnails')
GROUP BY user_id;

-- Orphaned files detection
CREATE VIEW orphaned_storage_files AS
SELECT name, size, created_at
FROM storage.objects 
WHERE bucket_id = 'gallery-photos'
AND NOT EXISTS (
  SELECT 1 FROM gallery_photos 
  WHERE storage_path = storage.objects.name
);
```

## Migration Guide

### From Legacy Structure

1. **Backup existing data**
2. **Run storage migration**: `20250622000009_create_gallery_storage_system.sql`
3. **Update application code** to use new API
4. **Migrate existing files** to new folder structure
5. **Test upload/download functionality**

### Code Migration

```typescript
// Old API
import { galleryApi } from '../api/galleryApi';

// New API with storage integration
import { galleryApiNew } from '../api/galleryApiNew';
import { storageService } from '@/services/storageService';
```

## Best Practices

### File Naming

- Include timestamp to avoid conflicts
- Sanitize user input filenames
- Use consistent naming conventions

### Security

- Always verify user ownership
- Validate file types and sizes
- Implement proper RLS policies

### Performance

- Generate thumbnails asynchronously
- Use progressive image loading
- Implement proper caching strategies

### Maintenance

- Regular cleanup of orphaned files
- Monitor storage usage trends
- Implement usage quotas

## Troubleshooting

### Common Issues

1. **Upload Failures**: Check file size/type validation
2. **Permission Denied**: Verify RLS policies and user authentication
3. **Missing Thumbnails**: Check thumbnail generation process
4. **Storage Full**: Implement cleanup procedures

### Debug Tools

```typescript
// Check storage usage
const usage = await storageService.getUserStorageUsage(userId);

// Validate file before upload
const validation = storageService.validateFile(file);

// Check if file exists
const exists = await storageService.fileExists(bucket, path);
```

This architecture provides a robust, scalable, and secure foundation for photo gallery storage with comprehensive user folder organization and automated optimization features.