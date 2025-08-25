// Admin Gallery Management Types
export interface AdminPhotoStats {
  id: string;
  file_name: string;
  file_size: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  download_count: number;
  storage_usage: number;
  created_at: string;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  user: {
    id: string;
    name: string;
    email: string;
  };
  gallery: {
    id: string;
    title: string;
    privacy_level: string;
  };
}

export interface AdminGalleryStats {
  id: string;
  title: string;
  photo_count: number;
  view_count: number;
  total_file_size: number;
  storage_usage: number;
  privacy_level: 'public' | 'members_only' | 'private';
  visibility: 'visible' | 'hidden' | 'archived';
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  recent_activity: string;
  flagged_photos_count: number;
}

export interface PhotoModerationQueue {
  id: string;
  photo_id: string;
  gallery_id: string;
  file_name: string;
  thumbnail_url?: string;
  reported_reason?: string;
  reported_by?: string;
  reported_at: string;
  status: 'pending' | 'under_review' | 'resolved';
  reviewer_notes?: string;
  photo: {
    id: string;
    file_name: string;
    title?: string;
    description?: string;
    tags?: string[];
    storage_path: string;
    thumbnail_url?: string;
    medium_url?: string;
    created_at: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  gallery: {
    id: string;
    title: string;
  };
}

export interface StorageAnalytics {
  total_storage_used: number;
  total_photos: number;
  total_galleries: number;
  average_file_size: number;
  storage_by_user: Array<{
    user_id: string;
    user_name: string;
    user_email: string;
    storage_used: number;
    photo_count: number;
    gallery_count: number;
  }>;
  storage_by_month: Array<{
    month: string;
    storage_added: number;
    photos_added: number;
  }>;
  largest_files: Array<{
    id: string;
    file_name: string;
    file_size: number;
    user_name: string;
    gallery_title: string;
  }>;
}

export interface AdminGalleryFilters {
  search?: string;
  user_id?: string;
  privacy_level?: 'public' | 'members_only' | 'private';
  visibility?: 'visible' | 'hidden' | 'archived';
  moderation_status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_after?: string;
  created_before?: string;
  min_photos?: number;
  max_photos?: number;
  has_flagged_content?: boolean;
  storage_usage_min?: number;
  storage_usage_max?: number;
  sort_by?: 'created_at' | 'updated_at' | 'photo_count' | 'view_count' | 'storage_usage';
  sort_order?: 'asc' | 'desc';
}

export interface AdminPhotoFilters {
  search?: string;
  gallery_id?: string;
  user_id?: string;
  moderation_status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  visibility?: 'visible' | 'hidden';
  file_type?: string;
  created_after?: string;
  created_before?: string;
  min_file_size?: number;
  max_file_size?: number;
  has_reports?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'file_size' | 'view_count' | 'like_count';
  sort_order?: 'asc' | 'desc';
}

export interface BulkPhotoAction {
  action: 'delete' | 'moderate' | 'change_visibility' | 'move_gallery' | 'update_tags';
  photo_ids: string[];
  params?: {
    moderation_status?: 'approved' | 'rejected' | 'flagged';
    visibility?: 'visible' | 'hidden';
    target_gallery_id?: string;
    tags?: string[];
    reason?: string;
  };
}

export interface BulkGalleryAction {
  action: 'delete' | 'change_privacy' | 'change_visibility' | 'moderate';
  gallery_ids: string[];
  params?: {
    privacy_level?: 'public' | 'members_only' | 'private';
    visibility?: 'visible' | 'hidden' | 'archived';
    reason?: string;
  };
}

export interface PhotoReorderRequest {
  gallery_id: string;
  photo_orders: Array<{
    photo_id: string;
    sort_order: number;
  }>;
}

export interface GalleryAccessControl {
  gallery_id: string;
  user_permissions: Array<{
    user_id: string;
    permission: 'view' | 'edit' | 'admin';
    granted_by: string;
    granted_at: string;
  }>;
  role_permissions: Array<{
    role: string;
    permission: 'view' | 'edit' | 'admin';
  }>;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  entity_type: 'gallery' | 'photo' | 'user' | 'system';
  entity_id?: string;
  entity_name?: string;
  details: {
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    affected_items?: string[];
    reason?: string;
  };
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface BatchOperationResult {
  success_count: number;
  error_count: number;
  total_requested: number;
  successful_items: string[];
  failed_items: Array<{
    id: string;
    error: string;
  }>;
  operation_id: string;
  completed_at: string;
}

// Response interfaces
export interface AdminGalleriesResponse {
  galleries: AdminGalleryStats[];
  total_count: number;
  current_page: number;
  total_pages: number;
  has_more: boolean;
  filters_applied: AdminGalleryFilters;
}

export interface AdminPhotosResponse {
  photos: AdminPhotoStats[];
  total_count: number;
  current_page: number;
  total_pages: number;
  has_more: boolean;
  filters_applied: AdminPhotoFilters;
}

export interface ModerationQueueResponse {
  queue_items: PhotoModerationQueue[];
  total_pending: number;
  total_under_review: number;
  current_page: number;
  total_pages: number;
}

// Admin settings for gallery system
export interface GallerySystemSettings {
  max_photos_per_gallery: number;
  max_file_size: number;
  allowed_file_types: string[];
  auto_moderation_enabled: boolean;
  require_approval_for_public: boolean;
  storage_quota_per_user: number;
  enable_storage_analytics: boolean;
  default_gallery_privacy: 'public' | 'members_only' | 'private';
  enable_photo_downloads: boolean;
  watermark_enabled: boolean;
  watermark_text?: string;
  compression_enabled: boolean;
  compression_quality: number;
}

export interface PhotoUploadValidation {
  file_size_valid: boolean;
  file_type_valid: boolean;
  dimensions_valid: boolean;
  content_safe: boolean;
  errors: string[];
  warnings: string[];
}