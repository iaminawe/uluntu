# Gallery System Documentation

## Overview

The Gallery System is a comprehensive photo management solution built for the Nelson Tech Community platform. It provides full-featured gallery management with batch uploading, image processing, mobile optimization, and robust error handling.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Components](#components)
- [API Reference](#api-reference)
- [Hooks](#hooks)
- [Services](#services)
- [Error Handling](#error-handling)
- [Mobile Support](#mobile-support)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Performance Considerations](#performance-considerations)

## Features

### Core Features
- ✅ **Gallery Management**: Create, read, update, delete galleries
- ✅ **Batch Photo Upload**: Upload multiple photos with progress tracking
- ✅ **Image Processing**: Automatic thumbnail generation and image optimization
- ✅ **Progressive Loading**: Lazy loading with placeholders and dominant colors
- ✅ **Mobile Optimization**: Touch-friendly interface with camera capture
- ✅ **Pagination**: Efficient handling of large photo collections
- ✅ **Error Handling**: Comprehensive error management with user-friendly messages
- ✅ **Real-time Progress**: Upload progress tracking with pause/resume functionality

### Advanced Features
- **Smart Cropping**: Intelligent image cropping for thumbnails
- **Multiple Image Variants**: Automatic generation of different image sizes
- **WebP Support**: Modern image format with fallback
- **Drag & Drop**: Intuitive file selection
- **Camera Integration**: Direct photo capture on mobile devices
- **Retry Mechanisms**: Automatic retry for failed uploads
- **Validation**: Client-side file validation with detailed error messages

## Architecture

```
src/features/gallery/
├── api/
│   └── galleryApi.ts              # Main API interface
├── components/
│   ├── BatchUpload/               # Batch upload components
│   │   ├── BatchUploadArea.tsx
│   │   ├── BatchUploadDialog.tsx
│   │   ├── BatchUploadFileList.tsx
│   │   ├── BatchUploadProgress.tsx
│   │   └── MobileBatchUpload.tsx
│   ├── ProgressiveImage.tsx       # Progressive image loading
│   └── PhotoLightbox.tsx          # Image viewer
├── hooks/
│   ├── useBatchUpload.ts          # Batch upload logic
│   ├── useGallery.ts              # Gallery operations
│   └── useGalleryQueries.ts       # React Query integration
├── services/
│   └── imageProcessingService.ts  # Image processing utilities
├── utils/
│   ├── errorHandler.ts            # Error handling system
│   └── fileValidation.ts          # File validation utilities
└── types/
    └── index.ts                   # TypeScript definitions
```

## Components

### BatchUploadDialog

Main component for batch uploading photos with full desktop functionality.

```tsx
import { BatchUploadDialog } from '@/features/gallery/components/BatchUpload';

<BatchUploadDialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  galleryId="gallery-id"
  config={{
    maxFiles: 50,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    concurrent: 3
  }}
  onUploadComplete={(photos) => {
    console.log('Uploaded:', photos);
  }}
/>
```

### MobileBatchUpload

Optimized component for mobile devices with camera capture.

```tsx
import { MobileBatchUpload } from '@/features/gallery/components/BatchUpload';

<MobileBatchUpload
  galleryId="gallery-id"
  config={{
    maxFiles: 20,
    concurrent: 2
  }}
  onUploadComplete={(photos) => {
    console.log('Uploaded:', photos);
  }}
  onClose={() => setShowUpload(false)}
/>
```

### ProgressiveImage

Enhanced image component with progressive loading and optimization.

```tsx
import { ProgressiveImage } from '@/features/gallery/components';

<ProgressiveImage
  src="https://example.com/image.jpg"
  alt="Photo description"
  placeholder="data:image/jpeg;base64,..."
  dominantColor="#3B82F6"
  quality="medium"
  enableLazyLoading={true}
  className="w-full h-64 object-cover"
/>
```

## API Reference

### GalleryApi

Main API interface for gallery operations.

#### Methods

```typescript
// Get all galleries with pagination
getAllGalleries(filters?: GalleryFilters & { page?: number; limit?: number }): Promise<GalleriesResponse>

// Get single gallery
getGallery(id: string): Promise<Gallery | null>

// Create gallery
createGallery(gallery: Partial<Gallery>): Promise<Gallery>

// Update gallery
updateGallery(id: string, updates: Partial<Gallery>): Promise<Gallery>

// Delete gallery
deleteGallery(id: string): Promise<boolean>

// Get gallery photos with pagination
getGalleryPhotos(galleryId: string, options?: { page?: number; limit?: number }): Promise<Photo[]>

// Upload single photo
uploadPhoto(input: PhotoUploadInput): Promise<Photo>

// Batch upload photos
batchUploadPhotos(inputs: PhotoUploadInput[]): Promise<{
  success: Photo[];
  failed: { input: PhotoUploadInput; error: string }[];
}>

// Delete photo
deletePhoto(id: string): Promise<boolean>

// Batch delete photos
batchDeletePhotos(photoIds: string[]): Promise<boolean>

// Reorder photos
reorderPhotos(galleryId: string, photoOrders: { id: string; order: number }[]): Promise<boolean>

// Gallery interactions
incrementViewCount(galleryId: string): Promise<void>
toggleLike(galleryId: string, userId: string): Promise<boolean>
likePhoto(photoId: string): Promise<boolean>
```

### Types

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
  photos?: Photo[];
  owner?: {
    id: string;
    name: string;
    image?: string;
  };
}

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

interface GalleriesResponse {
  galleries: Gallery[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
```

## Hooks

### useGalleries

React Query hook for fetching galleries with pagination.

```typescript
const { data, isLoading, error } = useGalleries({
  privacy: 'public',
  page: 1,
  limit: 12,
  search: 'nature',
  tags: ['landscape']
});

// data.galleries - Gallery[]
// data.totalCount - number
// data.totalPages - number
// data.currentPage - number
```

### useBatchUpload

Comprehensive hook for batch upload functionality.

```typescript
const {
  queue,
  addFiles,
  removeFile,
  startUpload,
  pauseUpload,
  resumeUpload,
  cancelUpload,
  retryFile,
  retryFailedFiles,
  isUploading,
  isPaused,
  canUpload
} = useBatchUpload({
  galleryId: 'gallery-id',
  config: {
    maxFiles: 50,
    maxFileSize: 10 * 1024 * 1024,
    concurrent: 3,
    enableImageResize: true
  },
  hooks: {
    onBatchComplete: (result) => {
      console.log('Upload complete:', result);
    },
    onFileProgress: (fileId, progress) => {
      console.log(`File ${fileId}: ${progress}%`);
    }
  }
});
```

## Services

### ImageProcessingService

Client-side image processing and optimization.

```typescript
import { imageProcessingService } from '@/features/gallery/services/imageProcessingService';

// Get image dimensions
const dimensions = await imageProcessingService.getImageDimensions(file);

// Generate placeholder
const placeholder = await imageProcessingService.generatePlaceholder(file);

// Extract dominant color
const color = await imageProcessingService.getDominantColor(file);

// Process image with variants
const processed = await imageProcessingService.processImage(file, {
  enableWebP: true,
  smartCrop: true,
  variants: {
    thumbnail: { width: 300, height: 300, quality: 0.8 },
    medium: { width: 1200, height: 800, quality: 0.9 }
  }
});

// Enhanced upload input
const uploadInput = await imageProcessingService.enhanceUploadInput(
  file,
  galleryId,
  { enableWebP: true, smartCrop: true }
);
```

## Error Handling

### GalleryErrorHandler

Comprehensive error handling with user-friendly notifications.

```typescript
import { GalleryErrorHandler } from '@/features/gallery/utils/errorHandler';

// Parse and handle errors
try {
  await uploadPhoto(file);
} catch (error) {
  const galleryError = GalleryErrorHandler.parseError(error, 'UPLOAD');
  GalleryErrorHandler.showError(galleryError);
}

// Show notifications
GalleryErrorHandler.showSuccess('Upload completed!');
GalleryErrorHandler.showWarning('Some files were skipped');
GalleryErrorHandler.showError('Upload failed', 'UPLOAD');

// Create retry handler
const retryUpload = GalleryErrorHandler.createRetryHandler(
  () => uploadPhoto(file),
  3, // max retries
  1000 // delay ms
);

// Handle batch errors
GalleryErrorHandler.handleBatchErrors({
  success: successfulUploads,
  failed: failedUploads
}, 'BATCH_UPLOAD');
```

### Error Codes

Common error codes and their meanings:

- `NETWORK_ERROR` - Connection issues
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file format
- `TOO_MANY_FILES` - File count limit exceeded
- `UPLOAD_FAILED` - Upload operation failed
- `GALLERY_NOT_FOUND` - Gallery doesn't exist
- `STORAGE_QUOTA_EXCEEDED` - Storage limit reached

## Mobile Support

### Features

- **Touch-friendly Interface**: Optimized for mobile interaction
- **Camera Capture**: Direct photo capture using device camera
- **Responsive Design**: Adapts to different screen sizes
- **Reduced Concurrency**: Lower concurrent uploads for mobile networks
- **Progressive Loading**: Efficient image loading for slower connections

### Mobile-specific Configuration

```typescript
const mobileConfig = {
  maxFiles: 20,        // Reduced for mobile
  concurrent: 2,       // Lower concurrency
  maxFileSize: 5 * 1024 * 1024,  // 5MB for mobile
  enableImageResize: true,        // Always resize on mobile
  maxWidth: 1920,      // Reasonable max width
  maxHeight: 1080      // Reasonable max height
};
```

## Configuration

### Feature Toggles

The gallery system integrates with the platform's feature toggle system:

```typescript
import { FeatureGate, useGalleryFeatures } from '@/utils/featureToggle';

// Component-level feature gating
<FeatureGate feature="photo_galleries">
  <BatchUploadDialog {...props} />
</FeatureGate>

// Hook-based feature checking
function GalleryComponent() {
  const { features, isGalleryEnabled, canInteract } = useGalleryFeatures();
  
  if (!isGalleryEnabled) return null;
  
  return (
    <div>
      <GalleryList />
      {features.likes && <LikeButton />}
      {features.comments && <CommentSection />}
      {features.sharing && <ShareButton />}
    </div>
  );
}
```

Available gallery-related feature toggles:
- `photo_galleries` - Main gallery functionality
- `content_likes` - Photo and gallery likes
- `content_comments` - Comments on photos
- `content_sharing` - Social media sharing
- `content_tagging` - Photo tagging system

### Default Configuration

```typescript
const DEFAULT_BATCH_CONFIG = {
  maxFiles: 50,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  maxWidth: 4000,
  maxHeight: 4000,
  enableImageResize: true,
  enableThumbnailGeneration: true,
  concurrent: 3
};
```

### Image Variants

```typescript
const DEFAULT_VARIANTS = {
  thumbnail: { width: 300, height: 300, quality: 0.8, format: 'jpeg' },
  small: { width: 600, height: 400, quality: 0.85, format: 'jpeg' },
  medium: { width: 1200, height: 800, quality: 0.9, format: 'jpeg' },
  large: { width: 2000, height: 1333, quality: 0.95, format: 'jpeg' }
};
```

## Usage Examples

### Basic Gallery Display

```tsx
import { useGalleries } from '@/features/gallery/hooks/useGalleryQueries';
import { ProgressiveImage } from '@/features/gallery/components';

function GalleriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useGalleries({
    privacy: 'public',
    page: currentPage,
    limit: 12
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data?.galleries.map(gallery => (
        <div key={gallery.id} className="bg-white rounded-lg shadow">
          <ProgressiveImage
            src={gallery.cover_photo_url || ''}
            alt={gallery.title}
            className="w-full h-48 object-cover"
            quality="medium"
          />
          <div className="p-4">
            <h3 className="font-semibold">{gallery.title}</h3>
            <p className="text-gray-600 text-sm">{gallery.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Batch Upload Integration

```tsx
import { useState } from 'react';
import { BatchUploadDialog, MobileBatchUpload } from '@/features/gallery/components/BatchUpload';

function GalleryUpload({ galleryId }: { galleryId: string }) {
  const [showUpload, setShowUpload] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleUploadComplete = (photos: Photo[]) => {
    console.log(`Uploaded ${photos.length} photos`);
    setShowUpload(false);
    // Refresh gallery or update state
  };

  return (
    <>
      <button
        onClick={() => setShowUpload(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Upload Photos
      </button>

      {isMobile ? (
        <MobileBatchUpload
          galleryId={galleryId}
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      ) : (
        <BatchUploadDialog
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          galleryId={galleryId}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  );
}
```

### Custom Error Handling

```tsx
import { GalleryErrorHandler } from '@/features/gallery/utils/errorHandler';

function CustomUpload() {
  const handleUpload = async (files: File[]) => {
    try {
      const results = await Promise.allSettled(
        files.map(file => uploadPhoto(file))
      );

      const successful = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<Photo>).value);
      
      const failed = results
        .filter(r => r.status === 'rejected')
        .map(r => ({ error: (r as PromiseRejectedResult).reason }));

      GalleryErrorHandler.handleBatchErrors({ 
        success: successful, 
        failed 
      });

    } catch (error) {
      GalleryErrorHandler.showError(error, 'UPLOAD');
    }
  };

  return (
    <input
      type="file"
      multiple
      onChange={(e) => handleUpload(Array.from(e.target.files || []))}
    />
  );
}
```

## Performance Considerations

### Image Optimization
- Automatic image resizing and compression
- Multiple image variants for different use cases
- WebP format support with JPEG fallback
- Progressive JPEG encoding

### Loading Performance
- Lazy loading for images outside viewport
- Placeholder images for immediate visual feedback
- Pagination to limit data transfer
- Concurrent upload limits to prevent overwhelming

### Memory Management
- Automatic cleanup of object URLs
- Image processing in web workers (future enhancement)
- Efficient thumbnail generation
- Garbage collection of processed images

### Network Efficiency
- Resumable uploads (future enhancement)
- Intelligent retry mechanisms
- Batch operations for multiple files
- Compression before upload

## Browser Support

- **Modern Browsers**: Full functionality including WebP support
- **Legacy Browsers**: Graceful degradation with JPEG fallback
- **Mobile Browsers**: Optimized experience with camera integration
- **Offline Support**: Basic offline functionality (future enhancement)

## Security Considerations

- File type validation on client and server
- File size limits to prevent abuse
- Content scanning integration ready
- User permission checks
- Secure file upload to Supabase Storage

## Future Enhancements

- [ ] Resumable uploads for large files
- [ ] Advanced image editing capabilities
- [ ] AI-powered image tagging
- [ ] Bulk operations (move, copy, etc.)
- [ ] Advanced search and filtering
- [ ] CDN integration for global delivery
- [ ] Video support
- [ ] Social sharing features
- [ ] Image analytics and insights
- [ ] Collaborative galleries