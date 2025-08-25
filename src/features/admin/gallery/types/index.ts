// Admin Gallery Management Types
// Extends the existing gallery types with admin-specific functionality

import { Gallery, Photo, PhotoMetadata, GalleryFilters } from '@/features/gallery/types';

// Extended Admin Gallery Interface
export interface AdminGalleryView extends Gallery {
  owner: {
    id: string;
    name: string;
    email?: string;
    type: 'user' | 'group' | 'company';
    avatar?: string;
  };
  stats: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    downloadCount: number;
  };
  moderationStatus: 'approved' | 'pending' | 'rejected';
  lastActivity?: string;
  featured: boolean;
  allowDownload: boolean;
  allowComments: boolean;
  watermarkEnabled: boolean;
}

// Extended Admin Photo Interface
export interface AdminPhotoView extends Photo {
  galleryTitle: string;
  uploader: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  moderationStatus: 'approved' | 'pending' | 'rejected';
  stats: {
    viewCount: number;
    downloadCount: number;
    likeCount: number;
    commentCount: number;
  };
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  lastModified?: string;
  approvedBy?: string;
  approvedAt?: string;
}

// Admin-specific Filter Interfaces
export interface AdminGalleryFilters extends GalleryFilters {
  moderationStatus?: ('approved' | 'pending' | 'rejected')[];
  featured?: boolean;
  allowDownload?: boolean;
  allowComments?: boolean;
  lastActivityRange?: {
    start: string;
    end: string;
  };
  minPhotoCount?: number;
  maxPhotoCount?: number;
  viewCountRange?: {
    min: number;
    max: number;
  };
}

export interface AdminPhotoFilters {
  search?: string;
  tags?: string[];
  visibility?: ('visible' | 'hidden')[];
  moderationStatus?: ('approved' | 'pending' | 'rejected')[];
  processingStatus?: ('pending' | 'processing' | 'completed' | 'failed')[];
  uploadDateRange?: {
    start: string;
    end: string;
  };
  fileSizeRange?: {
    min: number; // bytes
    max: number; // bytes
  };
  dimensionsRange?: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  };
  sortBy?: 'uploadDate' | 'title' | 'fileSize' | 'views' | 'downloads' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

// Bulk Operation Types
export interface BulkGalleryOperation {
  type: 'delete' | 'privacy' | 'visibility' | 'feature' | 'moderate' | 'transfer';
  galleryIds: string[];
  payload?: {
    privacyLevel?: 'public' | 'members_only' | 'private';
    visibility?: 'visible' | 'hidden' | 'archived';
    featured?: boolean;
    moderationStatus?: 'approved' | 'rejected';
    moderationNotes?: string;
    transferToUserId?: string;
  };
}

export interface BulkPhotoOperation {
  type: 'delete' | 'visibility' | 'move' | 'tag' | 'moderate' | 'reprocess';
  photoIds: string[];
  payload?: {
    visibility?: 'visible' | 'hidden';
    targetGalleryId?: string;
    addTags?: string[];
    removeTags?: string[];
    moderationStatus?: 'approved' | 'rejected';
    moderationNotes?: string;
  };
}

// API Response Types
export interface AdminGalleriesResponse {
  galleries: AdminGalleryView[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  filters: AdminGalleryFilters;
  aggregations: {
    byPrivacyLevel: Record<string, number>;
    byModerationStatus: Record<string, number>;
    byOwnerType: Record<string, number>;
    totalPhotos: number;
    totalViews: number;
  };
}

export interface AdminPhotosResponse {
  photos: AdminPhotoView[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  filters: AdminPhotoFilters;
  aggregations: {
    byModerationStatus: Record<string, number>;
    byProcessingStatus: Record<string, number>;
    totalFileSize: number;
    averageFileSize: number;
  };
}

// Moderation Types
export interface ModerationQueueItem {
  id: string;
  entityType: 'gallery' | 'photo';
  entityId: string;
  action: 'create' | 'update' | 'report';
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: {
    id: string;
    name: string;
    email?: string;
  };
  submittedAt: string;
  reviewedBy?: {
    id: string;
    name: string;
    email?: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  autoFlags: string[]; // AI-detected issues
  reportReason?: string;
  content: AdminGalleryView | AdminPhotoView;
}

export interface ModerationDecision {
  itemId: string;
  action: 'approve' | 'reject';
  notes?: string;
  additionalActions?: {
    flagUser?: boolean;
    deleteContent?: boolean;
    sendNotification?: boolean;
    escalate?: boolean;
  };
}

// Analytics Types
export interface GalleryAnalytics {
  galleryId: string;
  timeframe: '24h' | '7d' | '30d' | '90d' | '1y';
  metrics: {
    views: {
      total: number;
      unique: number;
      trend: number; // percentage change
    };
    photos: {
      total: number;
      uploaded: number;
      deleted: number;
    };
    engagement: {
      likes: number;
      comments: number;
      downloads: number;
      shares: number;
    };
    performance: {
      loadTime: number;
      errorRate: number;
    };
  };
  topPhotos: Array<{
    photoId: string;
    title: string;
    views: number;
    thumbnail: string;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
}

export interface AdminDashboardStats {
  overview: {
    totalGalleries: number;
    totalPhotos: number;
    totalUsers: number;
    storageUsed: number; // bytes
    storageLimit: number; // bytes
  };
  recentActivity: {
    galleriesCreated: number;
    photosUploaded: number;
    moderationItems: number;
    reportedContent: number;
  };
  topGalleries: Array<{
    id: string;
    title: string;
    views: number;
    photoCount: number;
    thumbnail?: string;
  }>;
  moderationQueue: {
    pending: number;
    urgent: number;
    avgResolutionTime: number; // hours
  };
  systemHealth: {
    uploadSuccess: number; // percentage
    processingSuccess: number; // percentage
    averageUploadTime: number; // seconds
    averageProcessingTime: number; // seconds
  };
  trends: {
    uploadsPerDay: Array<{ date: string; count: number }>;
    moderationPerDay: Array<{ date: string; pending: number; resolved: number }>;
    storageGrowth: Array<{ date: string; size: number }>;
  };
}

// UI State Types
export interface AdminGalleryUIState {
  // View Configuration
  viewMode: 'grid' | 'list' | 'table';
  gridSize: 'small' | 'medium' | 'large';
  showFilters: boolean;
  showBulkActions: boolean;
  
  // Selection State
  selectedGalleries: Set<string>;
  selectedPhotos: Set<string>;
  allSelected: boolean;
  
  // Modal States
  modals: {
    galleryForm: {
      open: boolean;
      mode: 'create' | 'edit';
      galleryId?: string;
    };
    photoDetails: {
      open: boolean;
      photoId?: string;
    };
    bulkOperations: {
      open: boolean;
      type: 'galleries' | 'photos';
      operation?: string;
    };
    moderationReview: {
      open: boolean;
      itemId?: string;
    };
  };
  
  // Loading States
  loading: {
    galleries: boolean;
    photos: boolean;
    bulkOperation: boolean;
    moderation: boolean;
    analytics: boolean;
  };
  
  // Error States
  errors: {
    galleries?: string;
    photos?: string;
    bulkOperation?: string;
    moderation?: string;
  };
}

// Form Types
export interface AdminGalleryFormData {
  title: string;
  description?: string;
  slug: string;
  privacyLevel: 'public' | 'members_only' | 'private';
  visibility: 'visible' | 'hidden' | 'archived';
  featured: boolean;
  allowDownload: boolean;
  allowComments: boolean;
  showMetadata: boolean;
  watermarkEnabled: boolean;
  watermarkText?: string;
  tags: string[];
  ownerId?: string;
  ownerType: 'user' | 'group' | 'company';
  settings: {
    layout: 'grid' | 'masonry' | 'justified';
    photoSize: 'small' | 'medium' | 'large';
    autoplay?: boolean;
    autoplayInterval?: number;
  };
}

export interface AdminPhotoFormData {
  title?: string;
  description?: string;
  altText?: string;
  caption?: string;
  tags: string[];
  visibility: 'visible' | 'hidden';
  sortOrder?: number;
  metadata?: Partial<PhotoMetadata>;
}

// Search and Filter UI Types
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  selected?: boolean;
}

export interface FilterGroup {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'toggle';
  options?: FilterOption[];
  value?: any;
  min?: number;
  max?: number;
}

export interface SearchSuggestion {
  type: 'gallery' | 'photo' | 'tag' | 'user';
  value: string;
  label: string;
  meta?: string;
  thumbnail?: string;
}

// Validation Types
export interface ValidationRule {
  field: string;
  rules: Array<'required' | 'minLength' | 'maxLength' | 'email' | 'url' | 'numeric'>;
  message: string;
  params?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

// Export utility type helpers
export type AdminGalleryKeys = keyof AdminGalleryView;
export type AdminPhotoKeys = keyof AdminPhotoView;
export type BulkOperationType = BulkGalleryOperation['type'] | BulkPhotoOperation['type'];
export type ModerationStatus = ModerationQueueItem['status'];
export type ViewMode = AdminGalleryUIState['viewMode'];