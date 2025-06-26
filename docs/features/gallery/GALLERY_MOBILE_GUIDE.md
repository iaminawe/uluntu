# Gallery Mobile Optimization Guide

## Overview

The Gallery System is fully optimized for mobile devices, providing a seamless experience for photo management on smartphones and tablets. This guide covers mobile-specific features, optimizations, and best practices.

## Table of Contents

- [Mobile Features](#mobile-features)
- [Responsive Design](#responsive-design)
- [Camera Integration](#camera-integration)
- [Touch Interactions](#touch-interactions)
- [Performance Optimizations](#performance-optimizations)
- [Network Considerations](#network-considerations)
- [Browser Support](#browser-support)
- [Implementation Guide](#implementation-guide)
- [Troubleshooting](#troubleshooting)

## Mobile Features

### Core Mobile Features

✅ **Camera Capture**
- Direct photo capture using device camera
- Support for front and rear cameras
- Multiple photo capture in succession

✅ **Touch-Optimized Interface**
- Large touch targets (minimum 44px)
- Gesture-friendly interactions
- Swipe navigation for photo galleries

✅ **Responsive Upload**
- Mobile-optimized batch upload component
- Reduced concurrent uploads for mobile networks
- Progress indicators optimized for small screens

✅ **Adaptive Quality**
- Automatic image compression for mobile
- Reduced initial image sizes
- Progressive loading with placeholders

✅ **Offline Capabilities**
- Basic offline functionality
- Queue uploads for when connection returns
- Local storage of upload progress

### Mobile-Specific Components

#### MobileBatchUpload
Specialized component designed specifically for mobile devices:

```tsx
import { MobileBatchUpload } from '@/features/gallery/components/BatchUpload';

<MobileBatchUpload
  galleryId="gallery-id"
  config={{
    maxFiles: 20,           // Reduced for mobile
    concurrent: 2,          // Lower concurrency
    maxFileSize: 5 * 1024 * 1024  // 5MB limit
  }}
  onUploadComplete={(photos) => {
    console.log('Mobile upload complete:', photos);
  }}
/>
```

#### Progressive Image Loading
Optimized for mobile networks:

```tsx
import { ProgressiveImage } from '@/features/gallery/components';

<ProgressiveImage
  src="photo-url"
  alt="Photo description"
  quality="small"          // Start with smaller images
  enableLazyLoading={true} // Essential for mobile
  className="w-full aspect-square object-cover"
/>
```

## Responsive Design

### Breakpoint Strategy

```css
/* Mobile First Approach */
.gallery-grid {
  /* Mobile: Single column */
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 640px) {
  .gallery-grid {
    /* Small tablets: 2 columns */
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    /* Desktop: 3+ columns */
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;
  }
}
```

### Touch Target Sizes

All interactive elements meet mobile accessibility standards:

```css
/* Minimum touch target size */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
}

/* Button sizing for mobile */
.mobile-button {
  padding: 12px 24px;
  font-size: 16px;       /* Prevents zoom on iOS */
  border-radius: 8px;
}
```

### Typography Scale

Mobile-optimized typography:

```css
.mobile-text {
  /* Base font size prevents zoom */
  font-size: 16px;
  line-height: 1.5;
}

.mobile-title {
  font-size: 1.25rem;     /* 20px */
  font-weight: 600;
}

.mobile-caption {
  font-size: 0.875rem;   /* 14px */
  color: #6b7280;
}
```

## Camera Integration

### Camera Access

The system provides seamless camera integration:

```tsx
// Camera capture input
<input
  type="file"
  accept="image/*"
  capture="environment"  // Rear camera
  multiple
  onChange={handleCameraCapture}
  className="sr-only"
/>

// Camera button
<label className="camera-button">
  <input {...cameraInputProps} />
  <Camera className="w-5 h-5" />
  Take Photos
</label>
```

### Camera Permissions

Handling camera permissions gracefully:

```typescript
const requestCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    // Permission granted
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    // Permission denied or camera unavailable
    showCameraPermissionError();
    return false;
  }
};
```

### Multiple Camera Support

Supporting different camera types:

```tsx
// Rear camera (default)
<input capture="environment" />

// Front camera
<input capture="user" />

// Any camera
<input capture />
```

## Touch Interactions

### Gesture Support

Touch gestures for enhanced mobile experience:

```typescript
// Swipe detection for image navigation
const useSwipeGesture = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) onSwipeLeft();
    if (isRightSwipe) onSwipeRight();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};
```

### Pull-to-Refresh

Native-like pull-to-refresh functionality:

```typescript
const usePullToRefresh = (onRefresh: () => void) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance, 100));
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 60) {
        setIsRefreshing(true);
        onRefresh();
      }
      setPullDistance(0);
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, onRefresh]);

  return { isRefreshing, pullDistance, setIsRefreshing };
};
```

## Performance Optimizations

### Image Optimization

Mobile-specific image optimizations:

```typescript
// Mobile image processing config
const mobileImageConfig = {
  variants: {
    thumbnail: { width: 150, height: 150, quality: 0.7 },
    small: { width: 400, height: 300, quality: 0.8 },
    medium: { width: 800, height: 600, quality: 0.85 }
  },
  enableWebP: true,
  smartCrop: true,
  maxOriginalSize: 1920 // Limit original size on mobile
};
```

### Lazy Loading Strategy

Efficient lazy loading for mobile:

```typescript
const useLazyLoading = () => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.1
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
};
```

### Memory Management

Optimized memory usage for mobile devices:

```typescript
// Automatic image cleanup
useEffect(() => {
  const imageUrls: string[] = [];

  const cleanupImages = () => {
    imageUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };

  // Cleanup on unmount or when images change
  return cleanupImages;
}, [images]);

// Limit concurrent image processing
const processImagesSequentially = async (files: File[]) => {
  const results = [];
  for (const file of files) {
    const processed = await processImage(file);
    results.push(processed);
    // Small delay to prevent overwhelming mobile devices
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return results;
};
```

## Network Considerations

### Adaptive Loading

Network-aware loading strategies:

```typescript
const useNetworkAware = () => {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    saveData: false
  });

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        saveData: connection.saveData
      });

      const updateConnection = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          saveData: connection.saveData
        });
      };

      connection.addEventListener('change', updateConnection);
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);

  // Adjust quality based on network
  const getImageQuality = () => {
    if (networkInfo.saveData || networkInfo.effectiveType === 'slow-2g') {
      return 'thumbnail';
    }
    if (networkInfo.effectiveType === '2g' || networkInfo.effectiveType === '3g') {
      return 'small';
    }
    return 'medium';
  };

  return { networkInfo, getImageQuality };
};
```

### Offline Support

Basic offline functionality:

```typescript
const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [uploadQueue, setUploadQueue] = useState<PhotoUploadInput[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueUpload = (input: PhotoUploadInput) => {
    if (isOnline) {
      uploadPhoto(input);
    } else {
      setUploadQueue(prev => [...prev, input]);
      showOfflineMessage();
    }
  };

  const processQueue = async () => {
    if (isOnline && uploadQueue.length > 0) {
      for (const input of uploadQueue) {
        try {
          await uploadPhoto(input);
        } catch (error) {
          console.error('Failed to upload queued photo:', error);
        }
      }
      setUploadQueue([]);
    }
  };

  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline]);

  return { isOnline, queueUpload, uploadQueue };
};
```

## Browser Support

### Mobile Browser Compatibility

| Feature | iOS Safari | Chrome Mobile | Firefox Mobile | Samsung Internet |
|---------|------------|---------------|----------------|------------------|
| Camera API | ✅ 11+ | ✅ 53+ | ✅ 79+ | ✅ 7.2+ |
| File API | ✅ 6+ | ✅ 53+ | ✅ 32+ | ✅ 4+ |
| Touch Events | ✅ 2+ | ✅ 18+ | ✅ 6+ | ✅ 1+ |
| WebP Support | ✅ 14+ | ✅ 23+ | ✅ 65+ | ✅ 4+ |
| Intersection Observer | ✅ 12.2+ | ✅ 58+ | ✅ 55+ | ✅ 7.2+ |

### Progressive Enhancement

Graceful degradation for older browsers:

```typescript
// Feature detection
const supportsCamera = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

const supportsWebP = () => {
  return new Promise<boolean>((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Conditional feature loading
const MobileGallery = () => {
  const [features, setFeatures] = useState({
    camera: false,
    webp: false
  });

  useEffect(() => {
    const checkFeatures = async () => {
      setFeatures({
        camera: supportsCamera(),
        webp: await supportsWebP()
      });
    };
    checkFeatures();
  }, []);

  return (
    <div>
      {features.camera ? (
        <CameraUploadButton />
      ) : (
        <FileUploadButton />
      )}
    </div>
  );
};
```

## Implementation Guide

### Setting Up Mobile Gallery

1. **Install Dependencies**
```bash
npm install react-hot-toast react-query
```

2. **Configure Mobile Component**
```tsx
import { MobileBatchUpload } from '@/features/gallery/components/BatchUpload';

function MobileGalleryPage() {
  const [showUpload, setShowUpload] = useState(false);
  
  return (
    <div className="mobile-gallery">
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </button>
      
      {showUpload && (
        <MobileBatchUpload
          galleryId="gallery-id"
          onUploadComplete={(photos) => {
            console.log('Uploaded:', photos);
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
```

3. **Add Responsive Styles**
```css
/* Mobile-first gallery grid */
.mobile-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  padding: 16px;
}

@media (min-width: 640px) {
  .mobile-gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    padding: 20px;
  }
}
```

4. **Configure Upload Settings**
```typescript
const mobileUploadConfig = {
  maxFiles: 20,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  concurrent: 2,
  enableImageResize: true,
  maxWidth: 1920,
  maxHeight: 1080,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
};
```

### Testing on Mobile Devices

1. **Chrome DevTools**
```javascript
// Enable device simulation
// Toggle device toolbar (Ctrl+Shift+M)
// Select mobile device preset
// Test touch interactions and camera
```

2. **Real Device Testing**
```javascript
// Use ngrok for local testing
npx ngrok http 3000

// Test on actual mobile devices
// Verify camera functionality
// Check touch interactions
// Test offline capabilities
```

3. **Performance Testing**
```javascript
// Monitor performance
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance:', entry);
  }
});

observer.observe({ entryTypes: ['measure', 'navigation'] });
```

## Troubleshooting

### Common Mobile Issues

#### Camera Not Working
```typescript
// Debug camera issues
const debugCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === 'videoinput');
    console.log('Available cameras:', cameras);
    
    if (cameras.length === 0) {
      console.error('No cameras found');
      return;
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: cameras[0].deviceId }
    });
    console.log('Camera access granted');
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error('Camera error:', error);
  }
};
```

#### Touch Events Not Working
```typescript
// Debug touch events
const debugTouch = () => {
  document.addEventListener('touchstart', (e) => {
    console.log('Touch start:', e.touches.length);
  });
  
  document.addEventListener('touchmove', (e) => {
    console.log('Touch move:', e.touches[0].clientX, e.touches[0].clientY);
  });
  
  document.addEventListener('touchend', (e) => {
    console.log('Touch end');
  });
};
```

#### Performance Issues
```typescript
// Monitor performance
const monitorPerformance = () => {
  // Memory usage
  if ('memory' in performance) {
    console.log('Memory:', (performance as any).memory);
  }
  
  // Frame rate
  let lastTime = performance.now();
  let frameCount = 0;
  
  const measureFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      console.log('FPS:', frameCount);
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(measureFPS);
  };
  
  measureFPS();
};
```

### Best Practices Summary

1. **Always test on real devices**
2. **Use mobile-first responsive design**
3. **Optimize images for mobile networks**
4. **Implement progressive loading**
5. **Provide offline capabilities**
6. **Use appropriate touch targets**
7. **Handle camera permissions gracefully**
8. **Monitor performance continuously**
9. **Test across different mobile browsers**
10. **Implement error handling for mobile-specific issues**