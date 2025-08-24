# Comprehensive Photo Gallery System - Technical Specification

## Executive Summary

This document provides a comprehensive technical specification for implementing an advanced photo gallery system within the Nelson Tech platform. The system supports polymorphic relationships, allowing galleries to be attached to multiple entity types including groups, events, news articles, companies, marketplace items, and resources.

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Polymorphic Relationships](#polymorphic-relationships)
4. [API Architecture](#api-architecture)
5. [Admin Interface Structure](#admin-interface-structure)
6. [File Upload & Storage Strategy](#file-upload--storage-strategy)
7. [Integration Points](#integration-points)
8. [Component Architecture](#component-architecture)
9. [Security Considerations](#security-considerations)
10. [Performance Considerations](#performance-considerations)
11. [Migration Strategy](#migration-strategy)

## System Overview

### Core Features
- **Multi-entity Gallery Support**: Galleries can belong to users, groups, companies, events, news articles, marketplace items, and resources
- **Advanced Photo Management**: Batch upload, image processing, metadata extraction, and multiple size variants
- **Admin Promotion Workflows**: System for promoting user photos to featured content, homepage headers, and promotional materials
- **Dynamic Page Headers**: Advanced scheduling system for page header assignments
- **Social Features**: Likes, comments, sharing, and engagement tracking
- **Permission System**: Granular permissions based on entity ownership and user roles

### Key Technical Highlights
- Built on existing Supabase infrastructure
- Uses Row Level Security (RLS) for data access control
- Supports real-time updates through Supabase subscriptions
- Image processing pipeline with multiple size variants
- Progressive image loading with placeholders
- Comprehensive audit logging

## Database Schema

### Core Tables

#### 1. Enhanced Gallery Polymorphic System

```sql
-- Enhanced user_galleries table with polymorphic support
CREATE TABLE user_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership (polymorphic)
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  owner_type VARCHAR(20) DEFAULT 'user' CHECK (owner_type IN ('user', 'group', 'company', 'event', 'news', 'marketplace', 'resource')),
  owner_id UUID, -- References the actual entity ID
  
  -- Gallery metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) NOT NULL,
  cover_photo_id UUID, -- Self-referencing to gallery_photos
  
  -- Privacy and visibility
  privacy_level VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (privacy_level IN ('public', 'members_only', 'private')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden', 'archived')),
  
  -- Organization
  sort_order INTEGER DEFAULT 0,
  category VARCHAR(100), -- e.g., 'event-photos', 'product-images', 'team-photos'
  
  -- Statistics
  photo_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  tags TEXT[],
  settings JSONB DEFAULT '{}', -- Gallery-specific settings
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT user_galleries_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
  CONSTRAINT user_galleries_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  
  -- Unique constraint for entity-specific galleries
  CONSTRAINT user_galleries_entity_unique UNIQUE (owner_type, owner_id, slug)
);

-- Index for polymorphic queries
CREATE INDEX idx_user_galleries_owner ON user_galleries(owner_type, owner_id);
CREATE INDEX idx_user_galleries_entity_slug ON user_galleries(owner_type, owner_id, slug);
```

#### 2. Enhanced Gallery Photos Table

```sql
-- Enhanced gallery_photos table with comprehensive metadata
CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- File information
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  
  -- Storage paths for different sizes
  storage_path TEXT NOT NULL, -- Original/main path
  thumbnail_path TEXT,
  small_path TEXT,
  medium_path TEXT,
  large_path TEXT,
  
  -- Generated URLs (computed or cached)
  thumbnail_url TEXT,
  small_url TEXT,
  medium_url TEXT,
  large_url TEXT,
  
  -- Image dimensions and processing
  width INTEGER,
  height INTEGER,
  aspect_ratio DECIMAL(10,8),
  dominant_color VARCHAR(7), -- Hex color
  placeholder_data TEXT, -- Base64 LQIP (Low Quality Image Placeholder)
  
  -- Photo metadata
  title VARCHAR(255),
  description TEXT,
  alt_text VARCHAR(500),
  caption TEXT,
  
  -- Technical metadata (EXIF)
  exif_data JSONB DEFAULT '{}',
  camera_make VARCHAR(100),
  camera_model VARCHAR(100),
  focal_length VARCHAR(50),
  aperture VARCHAR(50),
  shutter_speed VARCHAR(50),
  iso_speed INTEGER,
  taken_at TIMESTAMP WITH TIME ZONE,
  
  -- Location data
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Organization and status
  sort_order INTEGER DEFAULT 0,
  visibility VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden', 'archived')),
  processing_status VARCHAR(20) DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Moderation and promotion
  moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  is_featured BOOLEAN DEFAULT false,
  featured_at TIMESTAMP WITH TIME ZONE,
  featured_by UUID REFERENCES members(id),
  
  -- Tags and categorization
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT gallery_photos_file_size_check CHECK (file_size > 0 AND file_size <= 100000000), -- 100MB max
  CONSTRAINT gallery_photos_dimensions_check CHECK (width > 0 AND height > 0),
  CONSTRAINT gallery_photos_coordinates_check CHECK (
    (latitude IS NULL AND longitude IS NULL) OR 
    (latitude IS NOT NULL AND longitude IS NOT NULL AND 
     latitude >= -90 AND latitude <= 90 AND 
     longitude >= -180 AND longitude <= 180)
  )
);
```

#### 3. Entity Gallery Relationships

```sql
-- Junction table for entity-gallery relationships
CREATE TABLE entity_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('group', 'company', 'event', 'news', 'marketplace', 'resource', 'opportunity')),
  entity_id UUID NOT NULL,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'primary' CHECK (relationship_type IN ('primary', 'secondary', 'featured', 'archive')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicate relationships
  CONSTRAINT entity_galleries_unique UNIQUE (entity_type, entity_id, gallery_id, relationship_type)
);

-- Indexes for efficient queries
CREATE INDEX idx_entity_galleries_entity ON entity_galleries(entity_type, entity_id);
CREATE INDEX idx_entity_galleries_gallery ON entity_galleries(gallery_id);
```

#### 4. Enhanced Photo Promotions

```sql
-- Enhanced photo promotions with comprehensive workflow
CREATE TABLE photo_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  promoted_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- Promotion details
  promotion_type VARCHAR(50) NOT NULL CHECK (promotion_type IN ('featured', 'homepage_hero', 'gallery_cover', 'event_banner', 'news_image', 'social_media', 'newsletter')),
  promotion_status VARCHAR(20) DEFAULT 'pending' CHECK (promotion_status IN ('pending', 'approved', 'rejected', 'active', 'expired', 'cancelled')),
  priority INTEGER DEFAULT 0,
  
  -- Targeting and context
  target_entity_type VARCHAR(20) CHECK (target_entity_type IN ('homepage', 'event', 'news', 'group', 'company', 'marketplace', 'resource')),
  target_entity_id UUID,
  context_data JSONB DEFAULT '{}',
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  auto_expire BOOLEAN DEFAULT true,
  max_impressions INTEGER,
  
  -- Admin workflow
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  rejection_reason TEXT,
  approval_metadata JSONB DEFAULT '{}',
  
  -- Performance metrics
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,3) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT photo_promotions_dates_check CHECK (
    (start_date IS NULL AND end_date IS NULL) OR
    (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date > start_date)
  )
);
```

#### 5. Dynamic Page Headers

```sql
-- Enhanced page headers with advanced scheduling
CREATE TABLE page_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(255) NOT NULL,
  photo_id UUID REFERENCES gallery_photos(id) ON DELETE SET NULL,
  
  -- Header configuration
  title VARCHAR(255),
  subtitle VARCHAR(255),
  overlay_text TEXT,
  overlay_position VARCHAR(20) DEFAULT 'center' CHECK (overlay_position IN ('top', 'center', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right')),
  overlay_opacity DECIMAL(3,2) DEFAULT 0.7 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 1),
  
  -- Styling options
  text_color VARCHAR(7) DEFAULT '#ffffff',
  background_color VARCHAR(7),
  blur_background BOOLEAN DEFAULT false,
  darken_image BOOLEAN DEFAULT true,
  custom_css TEXT,
  gradient_overlay VARCHAR(100), -- CSS gradient definition
  
  -- Priority and scheduling
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Responsive configuration
  mobile_photo_id UUID REFERENCES gallery_photos(id) ON DELETE SET NULL,
  tablet_photo_id UUID REFERENCES gallery_photos(id) ON DELETE SET NULL,
  mobile_overlay_text TEXT,
  responsive_settings JSONB DEFAULT '{}',
  
  -- A/B testing
  variant_name VARCHAR(100),
  test_group VARCHAR(50),
  conversion_tracking BOOLEAN DEFAULT false,
  
  -- Admin tracking
  created_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES members(id),
  approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected')),
  
  -- Performance metrics
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  ctr DECIMAL(5,3) DEFAULT 0, -- Click-through rate
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT page_headers_dates_check CHECK (
    (start_date IS NULL AND end_date IS NULL) OR
    (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date > start_date)
  ),
  CONSTRAINT page_headers_hex_color_format CHECK (
    text_color ~ '^#[0-9A-Fa-f]{6}$' AND
    (background_color IS NULL OR background_color ~ '^#[0-9A-Fa-f]{6}$')
  )
);

-- Index for active headers by page
CREATE INDEX idx_page_headers_active ON page_headers(page_slug, is_active, priority DESC, created_at DESC) WHERE is_active = true;
```

#### 6. Social Features

```sql
-- Photo likes (existing pattern)
CREATE TABLE photo_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'laugh', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT photo_likes_unique UNIQUE (photo_id, user_id)
);

-- Photo comments (enhanced from existing pattern)
CREATE TABLE photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES photo_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  -- Moderation
  moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_by UUID REFERENCES members(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderation_reason TEXT,
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT photo_comments_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);
```

#### 7. Gallery Analytics

```sql
-- Gallery analytics and insights
CREATE TABLE gallery_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES gallery_photos(id) ON DELETE SET NULL, -- NULL for gallery-level analytics
  
  -- Event tracking
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'like', 'comment', 'share', 'download', 'photo_view')),
  user_id UUID REFERENCES members(id) ON DELETE SET NULL, -- NULL for anonymous events
  session_id VARCHAR(255),
  
  -- Context
  referrer_url TEXT,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2), -- ISO country code
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  
  -- Additional metadata
  event_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Partitioned by date for performance
CREATE INDEX idx_gallery_analytics_gallery_date ON gallery_analytics(gallery_id, created_at);
CREATE INDEX idx_gallery_analytics_photo_date ON gallery_analytics(photo_id, created_at) WHERE photo_id IS NOT NULL;
```

## Polymorphic Relationships

### Entity Integration Strategy

The system uses a flexible polymorphic relationship pattern to attach galleries to multiple entity types:

#### 1. Direct Entity Ownership
```sql
-- Gallery directly owned by an entity
user_galleries.owner_type = 'group'
user_galleries.owner_id = group.id
```

#### 2. Junction Table Relationships
```sql
-- Multiple galleries per entity via junction table
entity_galleries.entity_type = 'event'
entity_galleries.entity_id = event.id
entity_galleries.gallery_id = gallery.id
```

### Supported Entity Types

| Entity Type | Primary Use Case | Gallery Types |
|-------------|-----------------|---------------|
| **Groups** | Community photos, event galleries | `primary`, `events`, `members` |
| **Events** | Event photos, speaker images | `primary`, `speakers`, `venue` |
| **News** | Article images, photo stories | `primary`, `featured`, `inline` |
| **Companies** | Team photos, office images, products | `team`, `office`, `products`, `events` |
| **Marketplace** | Product images, service portfolios | `primary`, `portfolio`, `before-after` |
| **Resources** | Tutorial images, diagrams | `primary`, `supporting`, `examples` |
| **Opportunities** | Project images, location photos | `primary`, `location`, `requirements` |

### Polymorphic Query Patterns

```typescript
// Get all galleries for an entity
const getEntityGalleries = async (entityType: string, entityId: string) => {
  return await supabase
    .from('user_galleries')
    .select(`
      *,
      gallery_photos(*)
    `)
    .eq('owner_type', entityType)
    .eq('owner_id', entityId);
};

// Get galleries via junction table
const getRelatedGalleries = async (entityType: string, entityId: string) => {
  return await supabase
    .from('entity_galleries')
    .select(`
      *,
      user_galleries(
        *,
        gallery_photos(*)
      )
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
};
```

## API Architecture

### Core API Structure

#### 1. Gallery Management API

```typescript
// /src/features/gallery/api/galleryApiPolymorphic.ts

interface PolymorphicGalleryApi {
  // Entity Gallery Management
  getEntityGalleries(entityType: EntityType, entityId: string, options?: GalleryFilters): Promise<Gallery[]>;
  createEntityGallery(entityType: EntityType, entityId: string, data: CreateGalleryInput): Promise<Gallery>;
  attachGalleryToEntity(galleryId: string, entityType: EntityType, entityId: string, relationshipType?: string): Promise<void>;
  detachGalleryFromEntity(galleryId: string, entityType: EntityType, entityId: string): Promise<void>;
  
  // Gallery Operations
  updateGallery(galleryId: string, updates: UpdateGalleryInput): Promise<Gallery>;
  deleteGallery(galleryId: string): Promise<void>;
  reorderEntityGalleries(entityType: EntityType, entityId: string, order: GalleryOrder[]): Promise<void>;
  
  // Photo Management
  uploadPhotosToEntityGallery(entityType: EntityType, entityId: string, galleryId: string, files: PhotoUploadInput[]): Promise<Photo[]>;
  movePhotosToGallery(photoIds: string[], targetGalleryId: string): Promise<void>;
  
  // Advanced Features
  bulkCreateGalleryFromPhotos(entityType: EntityType, entityId: string, photoIds: string[], galleryData: CreateGalleryInput): Promise<Gallery>;
  createGalleryTemplate(entityType: EntityType, templateData: GalleryTemplate): Promise<GalleryTemplate>;
}

// Entity-specific APIs
interface EntityGalleryApi {
  groups: {
    getGroupGalleries(groupId: string): Promise<Gallery[]>;
    createGroupEventGallery(groupId: string, eventId: string, data: CreateGalleryInput): Promise<Gallery>;
    getGroupMemberGalleries(groupId: string, memberId: string): Promise<Gallery[]>;
  };
  
  events: {
    getEventGalleries(eventId: string): Promise<Gallery[]>;
    createEventGallery(eventId: string, type: 'main' | 'speakers' | 'venue', data: CreateGalleryInput): Promise<Gallery>;
    assignEventSpeakerPhotos(eventId: string, speakerId: string, photoIds: string[]): Promise<void>;
  };
  
  companies: {
    getCompanyGalleries(companyId: string): Promise<Gallery[]>;
    createCompanyGallery(companyId: string, type: 'team' | 'office' | 'products', data: CreateGalleryInput): Promise<Gallery>;
    updateCompanyLogoFromPhoto(companyId: string, photoId: string): Promise<void>;
  };
  
  marketplace: {
    getListingGalleries(listingId: string): Promise<Gallery[]>;
    createProductGallery(listingId: string, data: CreateGalleryInput): Promise<Gallery>;
    setListingFeaturedPhoto(listingId: string, photoId: string): Promise<void>;
  };
}
```

#### 2. Admin API Endpoints

```typescript
// /src/features/gallery/api/adminGalleryApi.ts

interface AdminGalleryApi {
  // Promotion Management
  getPromotionRequests(filters?: PromotionFilters): Promise<PhotoPromotionRequest[]>;
  reviewPromotionRequest(requestId: string, action: 'approve' | 'reject', notes?: string): Promise<void>;
  createSystemPromotion(photoId: string, type: PromotionType, config: PromotionConfig): Promise<PhotoPromotion>;
  
  // Page Header Management
  getPageHeaders(pageSlug?: string): Promise<PageHeader[]>;
  createPageHeader(data: CreatePageHeaderInput): Promise<PageHeader>;
  updatePageHeader(headerId: string, updates: UpdatePageHeaderInput): Promise<PageHeader>;
  schedulePageHeader(headerId: string, schedule: HeaderSchedule): Promise<void>;
  
  // Moderation
  getModerationQueue(filters?: ModerationFilters): Promise<Photo[]>;
  moderatePhoto(photoId: string, action: 'approve' | 'reject' | 'flag', reason?: string): Promise<void>;
  bulkModeratePhotos(photoIds: string[], action: ModerationAction): Promise<BatchModerationResult>;
  
  // Analytics and Insights
  getGalleryAnalytics(galleryId: string, timeframe: TimeFrame): Promise<GalleryAnalytics>;
  getPhotoInsights(photoId: string): Promise<PhotoInsights>;
  getSystemGalleryStats(): Promise<SystemGalleryStats>;
  exportGalleryData(filters: ExportFilters): Promise<ExportResult>;
  
  // Bulk Operations
  bulkUpdatePhotos(photoIds: string[], updates: BulkPhotoUpdate): Promise<void>;
  bulkMovePhotos(photoIds: string[], targetGalleryId: string): Promise<void>;
  bulkDeletePhotos(photoIds: string[]): Promise<void>;
}
```

### RESTful API Endpoints

```typescript
// API Route Definitions

// Gallery Management
GET    /api/galleries                           // List all public galleries
GET    /api/galleries/:id                       // Get specific gallery
POST   /api/galleries                           // Create new gallery
PUT    /api/galleries/:id                       // Update gallery
DELETE /api/galleries/:id                       // Delete gallery

// Entity Gallery Management
GET    /api/:entityType/:entityId/galleries     // Get entity galleries (e.g., /api/groups/123/galleries)
POST   /api/:entityType/:entityId/galleries     // Create gallery for entity
PUT    /api/:entityType/:entityId/galleries/:galleryId  // Update entity gallery relationship
DELETE /api/:entityType/:entityId/galleries/:galleryId  // Remove gallery from entity

// Photo Management
GET    /api/galleries/:galleryId/photos         // Get gallery photos
POST   /api/galleries/:galleryId/photos         // Upload photos to gallery
PUT    /api/photos/:photoId                     // Update photo metadata
DELETE /api/photos/:photoId                     // Delete photo

// Batch Operations
POST   /api/galleries/:galleryId/photos/batch   // Batch photo upload
PUT    /api/photos/batch                        // Batch photo update
DELETE /api/photos/batch                        // Batch photo delete

// Admin Endpoints
GET    /api/admin/galleries/promotions          // Get promotion requests
POST   /api/admin/galleries/promotions/:id/review  // Review promotion
GET    /api/admin/galleries/moderation          // Get moderation queue
POST   /api/admin/galleries/moderation/:photoId  // Moderate photo

// Page Headers
GET    /api/admin/page-headers                  // Get page headers
POST   /api/admin/page-headers                  // Create page header
PUT    /api/admin/page-headers/:id              // Update page header
DELETE /api/admin/page-headers/:id              // Delete page header

// Analytics
GET    /api/analytics/galleries/:galleryId     // Gallery analytics
GET    /api/analytics/photos/:photoId          // Photo insights
GET    /api/analytics/system/galleries         // System-wide stats
```

## Admin Interface Structure

### 1. Gallery Management Dashboard

```typescript
// /src/features/admin/components/GalleryManagement/GalleryDashboard.tsx

interface GalleryDashboardProps {
  initialView?: 'overview' | 'galleries' | 'photos' | 'moderation' | 'promotions' | 'headers';
}

const GalleryDashboard: React.FC<GalleryDashboardProps> = ({ initialView = 'overview' }) => {
  return (
    <AdminLayout title="Gallery Management">
      <DashboardTabs activeTab={activeTab} onChange={setActiveTab}>
        <TabPanel value="overview">
          <GalleryOverviewPanel />
        </TabPanel>
        
        <TabPanel value="galleries">
          <GalleriesManagementPanel />
        </TabPanel>
        
        <TabPanel value="photos">
          <PhotosManagementPanel />
        </TabPanel>
        
        <TabPanel value="moderation">
          <ModerationPanel />
        </TabPanel>
        
        <TabPanel value="promotions">
          <PromotionManagementPanel />
        </TabPanel>
        
        <TabPanel value="headers">
          <PageHeaderManagementPanel />
        </TabPanel>
      </DashboardTabs>
    </AdminLayout>
  );
};
```

### 2. Component Specifications

#### Gallery Overview Panel
```typescript
// Key Metrics Cards
- Total Galleries Count
- Total Photos Count
- Storage Usage (GB)
- Monthly Upload Trends
- Top Performing Galleries
- Moderation Queue Size
- Active Promotions Count

// Quick Actions
- Bulk Photo Import
- Create Featured Gallery
- Schedule Promotion Campaign
- Export Gallery Data
```

#### Moderation Panel
```typescript
interface ModerationPanelFeatures {
  // Queue Management
  pendingReviews: Photo[];
  flaggedContent: Photo[];
  autoModerationResults: Photo[];
  
  // Bulk Actions
  bulkApprove: (photoIds: string[]) => void;
  bulkReject: (photoIds: string[], reason: string) => void;
  bulkFlag: (photoIds: string[], reason: string) => void;
  
  // Filtering
  filterByUser: (userId: string) => void;
  filterByDate: (dateRange: DateRange) => void;
  filterByEntity: (entityType: EntityType, entityId: string) => void;
  
  // AI Assistance
  aiContentAnalysis: boolean;
  autoModerationRules: ModerationRule[];
  suspiciousContentDetection: boolean;
}
```

#### Promotion Management Panel
```typescript
interface PromotionManagementFeatures {
  // Request Queue
  pendingRequests: PhotoPromotionRequest[];
  activePromotions: PhotoPromotion[];
  scheduledPromotions: PhotoPromotion[];
  
  // Promotion Types
  homepageHeroRotation: HeroRotationConfig;
  featuredGalleries: FeaturedGalleryConfig;
  socialMediaQueue: SocialMediaPromotion[];
  newsletterImages: NewsletterImageConfig;
  
  // Campaign Management
  createCampaign: (config: PromotionCampaignConfig) => void;
  scheduleCampaign: (campaignId: string, schedule: CampaignSchedule) => void;
  trackCampaignPerformance: (campaignId: string) => CampaignAnalytics;
  
  // A/B Testing
  createVariantTest: (basePromotionId: string, variants: PromotionVariant[]) => void;
  monitorTestResults: (testId: string) => ABTestResults;
}
```

#### Page Header Management
```typescript
interface PageHeaderManagementFeatures {
  // Header Configuration
  pages: PageConfig[];
  activeHeaders: PageHeader[];
  scheduledHeaders: PageHeader[];
  
  // Visual Editor
  headerPreview: React.ComponentType<{header: PageHeader}>;
  overlayEditor: OverlayEditorConfig;
  responsivePreview: ResponsivePreviewConfig;
  
  // Scheduling System
  scheduleHeader: (headerId: string, schedule: HeaderSchedule) => void;
  createRotation: (headers: PageHeader[], rotationConfig: RotationConfig) => void;
  seasonalScheduling: SeasonalScheduleConfig;
  
  // Performance Tracking
  headerAnalytics: HeaderAnalyticsConfig;
  conversionTracking: ConversionTrackingConfig;
  heatmapIntegration: HeatmapConfig;
}
```

## File Upload & Storage Strategy

### 1. Multi-Size Image Processing Pipeline

```typescript
// /src/features/gallery/services/imageProcessingServiceEnhanced.ts

interface ImageProcessingPipeline {
  // Size Variants
  generateSizeVariants(file: File): Promise<ProcessedImageSet>;
  
  // Processing Options
  sizes: {
    thumbnail: { width: 150, height: 150, crop: 'center' };
    small: { width: 400, maxHeight: 400, quality: 0.8 };
    medium: { width: 800, maxHeight: 800, quality: 0.85 };
    large: { width: 1200, maxHeight: 1200, quality: 0.9 };
    original: { preserve: true, maxWidth: 4000, quality: 0.95 };
  };
  
  // Advanced Features
  generatePlaceholder(file: File): Promise<string>; // LQIP (Low Quality Image Placeholder)
  extractDominantColor(file: File): Promise<string>;
  extractMetadata(file: File): Promise<PhotoMetadata>;
  detectContent(file: File): Promise<ContentAnalysis>;
  
  // Optimization
  optimizeForWeb(file: File, targetSize: number): Promise<File>;
  compressWithQuality(file: File, quality: number): Promise<File>;
  convertFormat(file: File, targetFormat: 'webp' | 'jpg' | 'png'): Promise<File>;
}

// Implementation
class EnhancedImageProcessingService implements ImageProcessingPipeline {
  async generateSizeVariants(file: File): Promise<ProcessedImageSet> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = await this.loadImage(file);
    
    const variants: ProcessedImageSet = {};
    
    // Generate each size variant
    for (const [sizeName, config] of Object.entries(this.sizes)) {
      const processedFile = await this.resizeImage(img, config);
      variants[sizeName] = processedFile;
    }
    
    return variants;
  }
  
  async generatePlaceholder(file: File): Promise<string> {
    // Create 20x20 low quality version for progressive loading
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    
    const ctx = canvas.getContext('2d')!;
    const img = await this.loadImage(file);
    
    ctx.drawImage(img, 0, 0, 20, 20);
    return canvas.toDataURL('image/jpeg', 0.1);
  }
  
  async extractDominantColor(file: File): Promise<string> {
    // Use canvas to analyze pixel data and find dominant color
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    
    const ctx = canvas.getContext('2d')!;
    const img = await this.loadImage(file);
    
    ctx.drawImage(img, 0, 0, 50, 50);
    const imageData = ctx.getImageData(0, 0, 50, 50);
    
    return this.calculateDominantColor(imageData.data);
  }
}
```

### 2. Storage Organization Strategy

```typescript
// Storage bucket structure
const STORAGE_STRUCTURE = {
  'gallery-photos': {
    original: 'gallery/original/{galleryId}/{timestamp}-{filename}',
    large: 'gallery/large/{galleryId}/{timestamp}-{filename}',
    medium: 'gallery/medium/{galleryId}/{timestamp}-{filename}',
    small: 'gallery/small/{galleryId}/{timestamp}-{filename}',
    thumbnail: 'gallery/thumbnail/{galleryId}/{timestamp}-{filename}',
  },
  
  'entity-galleries': {
    groups: 'entities/groups/{groupId}/galleries/{galleryId}/',
    events: 'entities/events/{eventId}/galleries/{galleryId}/',
    companies: 'entities/companies/{companyId}/galleries/{galleryId}/',
    news: 'entities/news/{newsId}/galleries/{galleryId}/',
    marketplace: 'entities/marketplace/{listingId}/galleries/{galleryId}/',
    resources: 'entities/resources/{resourceId}/galleries/{galleryId}/',
  },
  
  'system-assets': {
    placeholders: 'system/placeholders/{size}/',
    templates: 'system/templates/{templateId}/',
    watermarks: 'system/watermarks/{variant}/',
  }
};

// CDN Configuration
const CDN_CONFIG = {
  baseUrl: process.env.SUPABASE_URL + '/storage/v1/object/public/',
  transforms: {
    resize: '?width={width}&height={height}&resize={mode}',
    quality: '&quality={quality}',
    format: '&format={format}',
    blur: '&blur={radius}',
  },
  
  // URL generation helper
  generateUrl(path: string, transforms?: ImageTransforms): string {
    let url = this.baseUrl + path;
    
    if (transforms) {
      const params = new URLSearchParams();
      Object.entries(transforms).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }
    
    return url;
  }
};
```

### 3. Upload Flow Implementation

```typescript
// /src/features/gallery/hooks/useEnhancedUpload.ts

interface EnhancedUploadHook {
  // Core upload functionality
  uploadFiles: (files: File[], galleryId: string, options?: UploadOptions) => Promise<UploadResult>;
  
  // Progress tracking
  uploadProgress: UploadProgress[];
  overallProgress: number;
  
  // Queue management
  queueFiles: (files: File[]) => void;
  removeFromQueue: (fileId: string) => void;
  pauseUploads: () => void;
  resumeUploads: () => void;
  cancelUploads: () => void;
  
  // Advanced features
  validateFiles: (files: File[]) => ValidationResult[];
  processImages: (files: File[]) => Promise<ProcessedFile[]>;
  generatePreviews: (files: File[]) => Promise<PreviewData[]>;
  
  // Error handling
  retryFailedUploads: () => void;
  errors: UploadError[];
  clearErrors: () => void;
}

// Implementation with polymorphic entity support
const useEnhancedUpload = (
  entityType?: EntityType, 
  entityId?: string, 
  options?: UploadHookOptions
): EnhancedUploadHook => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [errors, setErrors] = useState<UploadError[]>([]);
  
  const uploadFiles = async (files: File[], galleryId: string, uploadOptions?: UploadOptions) => {
    // 1. Validate files
    const validationResults = await validateFiles(files);
    const validFiles = files.filter((_, index) => validationResults[index].isValid);
    
    // 2. Process images
    const processedFiles = await processImages(validFiles);
    
    // 3. Upload with progress tracking
    const uploadPromises = processedFiles.map(async (processedFile, index) => {
      try {
        // Upload all variants
        const uploadedPaths = await uploadImageVariants(processedFile);
        
        // Create photo record with entity relationship
        const photoData = {
          ...processedFile.metadata,
          gallery_id: galleryId,
          ...uploadedPaths
        };
        
        const photo = await createPhotoRecord(photoData);
        
        // Create entity relationship if specified
        if (entityType && entityId) {
          await createEntityPhotoRelationship(entityType, entityId, photo.id);
        }
        
        return photo;
      } catch (error) {
        setErrors(prev => [...prev, { fileIndex: index, error: error.message }]);
        throw error;
      }
    });
    
    return await Promise.allSettled(uploadPromises);
  };
  
  return {
    uploadFiles,
    uploadProgress,
    overallProgress: calculateOverallProgress(uploadProgress),
    // ... other methods
  };
};
```
```