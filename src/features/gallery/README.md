# Gallery System

## Overview

A comprehensive photo gallery system for the Nelson Tech Community platform, featuring batch uploading, image processing, mobile optimization, and robust error handling.

## Quick Start

```tsx
import { BatchUploadDialog } from '@/features/gallery/components/BatchUpload';
import { useGalleries } from '@/features/gallery/hooks/useGalleryQueries';

function MyGallery() {
  const { data, isLoading } = useGalleries({ privacy: 'public' });
  
  return (
    <div>
      {data?.galleries.map(gallery => (
        <div key={gallery.id}>{gallery.title}</div>
      ))}
    </div>
  );
}
```

## Features

- ✅ **Gallery Management**: Full CRUD operations
- ✅ **Batch Upload**: Multiple file upload with progress tracking
- ✅ **Image Processing**: Automatic thumbnail generation and optimization
- ✅ **Mobile Support**: Touch-friendly interface with camera capture
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Pagination**: Efficient data loading
- ✅ **Progressive Loading**: Lazy loading with placeholders

## Architecture

```
src/features/gallery/
├── api/
│   └── galleryApi.ts              # Main API interface
├── components/
│   ├── BatchUpload/               # Upload components
│   ├── ProgressiveImage.tsx       # Image component
│   └── PhotoLightbox.tsx          # Image viewer
├── hooks/
│   ├── useBatchUpload.ts          # Upload logic
│   └── useGalleryQueries.ts       # Data fetching
├── services/
│   └── imageProcessingService.ts  # Image processing
├── utils/
│   ├── errorHandler.ts            # Error handling
│   └── fileValidation.ts          # File validation
└── types/
    └── index.ts                   # TypeScript definitions
```

## Installation

1. Install dependencies:
```bash
npm install react-hot-toast @tanstack/react-query
```

2. Configure environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GALLERY_MAX_FILE_SIZE=10485760
```

3. Run database migrations:
```bash
supabase migration up 20250622000009_create_gallery_storage_system
```

## Usage Examples

### Basic Gallery Display

```tsx
import { useGalleries } from '@/features/gallery/hooks/useGalleryQueries';
import { ProgressiveImage } from '@/features/gallery/components';

function GalleriesPage() {
  const { data, isLoading } = useGalleries({
    privacy: 'public',
    page: 1,
    limit: 12
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data?.galleries.map(gallery => (
        <div key={gallery.id}>
          <ProgressiveImage
            src={gallery.cover_photo_url || ''}
            alt={gallery.title}
            className="w-full h-48 object-cover"
          />
          <h3>{gallery.title}</h3>
        </div>
      ))}
    </div>
  );
}
```

### Batch Upload

```tsx
import { BatchUploadDialog } from '@/features/gallery/components/BatchUpload';

function UploadComponent({ galleryId }: { galleryId: string }) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <button onClick={() => setShowUpload(true)}>
        Upload Photos
      </button>
      
      <BatchUploadDialog
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        galleryId={galleryId}
        onUploadComplete={(photos) => {
          console.log('Uploaded:', photos);
        }}
      />
    </>
  );
}
```

### Mobile Upload

```tsx
import { MobileBatchUpload } from '@/features/gallery/components/BatchUpload';

function MobileGallery({ galleryId }: { galleryId: string }) {
  return (
    <MobileBatchUpload
      galleryId={galleryId}
      config={{
        maxFiles: 20,
        concurrent: 2
      }}
      onUploadComplete={(photos) => {
        console.log('Mobile upload complete:', photos);
      }}
    />
  );
}
```

### Error Handling

```tsx
import { GalleryErrorHandler } from '@/features/gallery/utils/errorHandler';

function CustomUpload() {
  const handleUpload = async (files: File[]) => {
    try {
      await uploadPhotos(files);
      GalleryErrorHandler.showSuccess('Upload completed!');
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

## API Reference

### galleryApi

```typescript
// Get galleries with pagination
const { galleries, totalCount } = await galleryApi.getAllGalleries({
  page: 1,
  limit: 12,
  privacy: 'public'
});

// Upload single photo
const photo = await galleryApi.uploadPhoto({
  file: photoFile,
  galleryId: 'gallery-id',
  title: 'My Photo'
});

// Batch upload
const result = await galleryApi.batchUploadPhotos(inputs);
```

### Hooks

```typescript
// Gallery queries
const { data, isLoading } = useGalleries(filters);
const { data: gallery } = useGallery(galleryId);

// Mutations
const createMutation = useCreateGallery();
const uploadMutation = useUploadPhoto();
```

## Configuration

### Default Settings

```typescript
const DEFAULT_CONFIG = {
  maxFiles: 50,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  concurrent: 3,
  enableImageResize: true
};
```

### Mobile Configuration

```typescript
const mobileConfig = {
  maxFiles: 20,
  concurrent: 2,
  maxFileSize: 5 * 1024 * 1024 // 5MB
};
```

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Manual Testing

1. Upload single photo
2. Upload multiple photos
3. Test error scenarios
4. Test mobile camera capture
5. Verify progressive loading

## Performance

### Image Optimization

- Automatic thumbnail generation
- WebP format support
- Progressive JPEG encoding
- Multiple size variants

### Loading Performance

- Lazy loading for images
- Pagination for large datasets
- Concurrent upload limits
- Progressive enhancement

## Browser Support

- **Modern Browsers**: Full functionality
- **Mobile Browsers**: Optimized experience
- **Legacy Browsers**: Graceful degradation

## Security

- File type validation
- Size limitations
- Permission checks
- Secure storage with RLS

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## Documentation

- [Gallery System Documentation](../../../docs/GALLERY_SYSTEM.md)
- [API Reference](../../../docs/GALLERY_API_REFERENCE.md)
- [Mobile Guide](../../../docs/GALLERY_MOBILE_GUIDE.md)
- [Deployment Guide](../../../docs/GALLERY_DEPLOYMENT_GUIDE.md)

## License

MIT License - see LICENSE file for details.