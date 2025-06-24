// Gallery Types
export interface Photo {
  id: string;
  gallery_id: string;
  user_id: string;
  file_name: string;
  original_file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  // Image size variants
  thumbnail_path?: string;
  small_path?: string;
  medium_path?: string;
  large_path?: string;
  original_path?: string;
  // URLs for different sizes
  thumbnail_url?: string;
  small_url?: string;
  medium_url?: string;
  large_url?: string;
  original_url?: string;
  url?: string; // For backward compatibility - defaults to medium_url
  // Image dimensions for different sizes
  thumbnail_width?: number;
  thumbnail_height?: number;
  small_width?: number;
  small_height?: number;
  medium_width?: number;
  medium_height?: number;
  large_width?: number;
  large_height?: number;
  width?: number; // Original width
  height?: number; // Original height
  // Processing info
  aspect_ratio?: number;
  dominant_color?: string;
  placeholder_data?: string; // Low quality placeholder for progressive loading
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  // Metadata
  title?: string;
  description?: string;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  sort_order: number;
  is_cover?: boolean;
  visibility: 'visible' | 'hidden';
  metadata?: PhotoMetadata;
  created_at: string;
  updated_at?: string;
  uploaded_at?: string; // Alias for created_at
  order?: number; // Alias for sort_order
}

export interface PhotoMetadata {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  takenAt?: string;
  capturedAt?: string; // Alias for takenAt
  keywords?: string[];
  copyright?: string;
  artist?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

export interface Gallery {
  id: string;
  user_id: string;
  owner_type?: 'user' | 'group' | 'company';
  owner_id?: string;
  title: string;
  description?: string;
  slug: string;
  cover_photo_id?: string;
  cover_photo_url?: string; // Computed cover photo URL
  coverImage?: string; // For compatibility
  privacy_level: 'public' | 'members_only' | 'private';
  privacy?: 'public' | 'private' | 'unlisted'; // For backward compatibility
  visibility: 'visible' | 'hidden' | 'archived';
  sort_order: number;
  photo_count: number;
  view_count: number;
  is_featured: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
  createdAt?: string; // Alias for created_at
  updatedAt?: string; // Alias for updated_at  
  ownerId?: string; // Alias for user_id
  owner?: {
    id: string;
    name: string;
    image?: string;
  };
  // Group owner info (when owner_type is 'group')
  group?: {
    id: string;
    name: string;
    slug: string;
    hero_image?: string;
  };
  // Company owner info (when owner_type is 'company')
  company?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  gallery_photos?: Photo[]; // From join
  photos?: Photo[]; // Alias for gallery_photos
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

export interface SingleUploadProgress extends UploadProgress {
  file?: File;
  preview?: string;
}

export interface PhotoUploadInput {
  file: File;
  title?: string;
  description?: string;
  tags?: string[];
  galleryId?: string;
  // Processed image variants
  processedImages?: {
    thumbnail?: File;
    small?: File;
    medium?: File;
    large?: File;
    original?: File;
  };
  // Metadata from processing
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  placeholder?: string; // Low quality placeholder data
  dominantColor?: string;
}

export interface CreateGalleryInput {
  title: string;
  description?: string;
  privacy_level: 'public' | 'members_only' | 'private';
  visibility: 'visible' | 'hidden';
  tags?: string[];
  owner_type?: 'user' | 'group' | 'company';
  owner_id?: string;
}

export interface UpdateGalleryInput {
  title?: string;
  description?: string;
  privacy_level?: 'public' | 'members_only' | 'private';
  visibility?: 'visible' | 'hidden';
  tags?: string[];
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
  visibility?: Gallery['visibility'];
  ownerType?: 'user' | 'group' | 'company';
  ownerId?: string;
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

// Batch Upload Types
export interface BatchUploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'pending' | 'validating' | 'uploading' | 'processing' | 'completed' | 'error' | 'cancelled';
  progress: number;
  error?: string;
  uploadedPhoto?: Photo;
  metadata?: {
    width: number;
    height: number;
    duration?: number; // for videos
  };
}

export interface BatchUploadConfig {
  maxFiles: number;
  maxFileSize: number; // in bytes
  acceptedTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
  enableImageResize: boolean;
  enableThumbnailGeneration: boolean;
  concurrent: number; // max concurrent uploads
}

export interface BatchUploadProgress {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  overallProgress: number;
  currentlyUploading: number;
  isComplete: boolean;
  hasErrors: boolean;
}

export interface BatchUploadQueue {
  files: BatchUploadFile[];
  progress: BatchUploadProgress;
  config: BatchUploadConfig;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BatchUploadHooks {
  onFileAdd?: (file: BatchUploadFile) => void;
  onFileRemove?: (fileId: string) => void;
  onFileProgress?: (fileId: string, progress: number) => void;
  onFileComplete?: (fileId: string, photo: Photo) => void;
  onFileError?: (fileId: string, error: string) => void;
  onBatchStart?: () => void;
  onBatchComplete?: (results: BatchUploadResult) => void;
  onBatchProgress?: (progress: BatchUploadProgress) => void;
}

export interface BatchUploadResult {
  totalFiles: number;
  successCount: number;
  errorCount: number;
  uploadedPhotos: Photo[];
  errors: { fileId: string; fileName: string; error: string }[];
}

// Additional types for photo API
export interface PhotoFilters {
  search?: string;
  tags?: string[];
  gallery?: string;
  galleryId?: string; // Alias for gallery
  status?: string;
  uploadedBy?: string;
  featured?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'date' | 'title' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface PhotosResponse {
  photos: Photo[];
  totalCount: number;
  hasMore: boolean;
  data?: any; // For compatibility
  page?: any; // For pagination compatibility
  total?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreatePhotoData {
  gallery_id: string;
  galleryId?: string; // Compatibility alias
  file_name: string;
  original_file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  url?: string; // For image URLs
  title?: string;
  description?: string;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  sort_order?: number;
  visibility?: 'visible' | 'hidden';
  metadata?: PhotoMetadata;
  isPublic?: boolean;
  featured?: boolean;
}

export interface UpdatePhotoData {
  id?: string; // For compatibility
  title?: string;
  description?: string;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  sort_order?: number;
  visibility?: 'visible' | 'hidden';
  metadata?: PhotoMetadata;
  status?: string; // For compatibility
}

export interface PhotoAnalytics {
  photoId: string;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  shareCount: number;
  lastViewed?: string;
}

export interface SearchResult<T = Photo> {
  photos: T[];
  totalCount: number;
  facets?: {
    tags: Array<{ name: string; count: number }>;
    galleries: Array<{ name: string; count: number }>;
  };
}

export interface PhotoSearch {
  query: string;
  filters?: PhotoFilters;
  page?: number;
  limit?: number;
  facets?: boolean;
  highlight?: boolean;
}

// Promotion types
export type PromotionStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type PromotionType = 'featured' | 'homepage' | 'newsletter' | 'social';

export interface PhotoPromotionRequest {
  id: string;
  photo_id: string;
  promotion_type: PromotionType;
  status: PromotionStatus;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
}

export interface CreatePromotionRequestData {
  photo_id: string;
  promotion_type: PromotionType;
  notes?: string;
}

export interface PromotionRequestsResponse {
  requests: PhotoPromotionRequest[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data?: PhotoPromotionRequest[]; // Compatibility
}


export interface PageHeaderAssignmentsResponse {
  assignments: any[];
  total: number;
  page?: number;
  limit?: number;
}