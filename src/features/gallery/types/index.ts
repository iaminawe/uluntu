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
  thumbnail_path?: string;
  medium_path?: string;
  url?: string; // For backward compatibility
  title?: string;
  description?: string;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  width?: number;
  height?: number;
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

export interface PhotoUploadInput {
  file: File;
  title?: string;
  description?: string;
  tags?: string[];
  galleryId?: string;
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