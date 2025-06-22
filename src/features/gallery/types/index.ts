// Gallery Types
export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  tags?: string[];
  uploadedAt: string;
  updatedAt?: string;
  fileSize: number;
  width: number;
  height: number;
  mimeType: string;
  order?: number;
  metadata?: PhotoMetadata;
}

export interface PhotoMetadata {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  takenAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

export interface Gallery {
  id: string;
  title: string;
  description?: string;
  coverPhotoId?: string;
  photos: Photo[];
  privacy: 'public' | 'private' | 'unlisted';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  settings?: GallerySettings;
  stats?: GalleryStats;
}

export interface GallerySettings {
  allowDownload: boolean;
  allowComments: boolean;
  showMetadata: boolean;
  watermark?: boolean;
  watermarkText?: string;
  layout: 'grid' | 'masonry' | 'justified';
  photoSize: 'small' | 'medium' | 'large';
  autoplay?: boolean;
  autoplayInterval?: number;
}

export interface GalleryStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  downloadCount: number;
}

export interface UploadProgress {
  photoId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface PhotoUploadInput {
  file: File;
  title?: string;
  description?: string;
  tags?: string[];
  galleryId?: string;
}

export interface GalleryFilters {
  search?: string;
  tags?: string[];
  privacy?: Gallery['privacy'];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'date' | 'title' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface BatchOperation {
  type: 'delete' | 'move' | 'tag' | 'privacy';
  photoIds: string[];
  payload?: any;
}

export interface LightboxState {
  isOpen: boolean;
  currentPhotoIndex: number;
  photos: Photo[];
}