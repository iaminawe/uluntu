import { Photo } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const generateThumbnail = (file: File, maxWidth: number = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const ratio = img.width / img.height;
        const width = Math.min(maxWidth, img.width);
        const height = width / ratio;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Could not generate thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const sortPhotos = (photos: Photo[], sortBy: string = 'date', order: 'asc' | 'desc' = 'desc'): Photo[] => {
  const sorted = [...photos].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'size':
        return a.file_size - b.file_size;
      case 'date':
      default:
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
  });

  return order === 'desc' ? sorted.reverse() : sorted;
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit.' };
  }

  return { valid: true };
};

export const extractExifData = async (file: File): Promise<any> => {
  // This is a placeholder - in a real implementation, you'd use a library like exif-js
  // to extract EXIF data from the image
  return {
    camera: null,
    lens: null,
    iso: null,
    aperture: null,
    shutterSpeed: null,
    focalLength: null,
    takenAt: null,
    location: null
  };
};

export const calculateGridLayout = (
  photos: Photo[],
  containerWidth: number,
  targetHeight: number = 200,
  margin: number = 4
): { photo: Photo; width: number; height: number; x: number; y: number }[] => {
  const rows: { photos: Photo[]; height: number }[] = [];
  let currentRow: Photo[] = [];
  let currentRowWidth = 0;

  photos.forEach(photo => {
    const aspectRatio = (photo.width || 1) / (photo.height || 1);
    const scaledWidth = targetHeight * aspectRatio;

    if (currentRowWidth + scaledWidth + margin * currentRow.length > containerWidth && currentRow.length > 0) {
      // Finalize current row
      const rowHeight = (containerWidth - margin * (currentRow.length - 1)) / currentRowWidth * targetHeight;
      rows.push({ photos: currentRow, height: rowHeight });
      currentRow = [photo];
      currentRowWidth = scaledWidth;
    } else {
      currentRow.push(photo);
      currentRowWidth += scaledWidth;
    }
  });

  // Add last row
  if (currentRow.length > 0) {
    rows.push({ photos: currentRow, height: targetHeight });
  }

  // Calculate positions
  const layout: { photo: Photo; width: number; height: number; x: number; y: number }[] = [];
  let y = 0;

  rows.forEach(row => {
    let x = 0;
    row.photos.forEach((photo, index) => {
      const aspectRatio = (photo.width || 1) / (photo.height || 1);
      const width = row.height * aspectRatio;
      
      layout.push({
        photo,
        width,
        height: row.height,
        x,
        y
      });

      x += width + (index < row.photos.length - 1 ? margin : 0);
    });
    y += row.height + margin;
  });

  return layout;
};

export const getPhotoUrl = (photo: Photo, size: 'thumbnail' | 'medium' | 'large' | 'original' = 'original'): string => {
  // In a real implementation, this would return different sized images
  // based on your image processing service
  switch (size) {
    case 'thumbnail':
      return photo.thumbnail_path || photo.storage_path;
    case 'medium':
      return photo.medium_path || photo.storage_path;
    case 'large':
      return photo.storage_path;
    case 'original':
    default:
      return photo.storage_path;
  }
};