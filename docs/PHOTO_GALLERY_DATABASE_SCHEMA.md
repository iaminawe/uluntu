# Photo Gallery System Database Schema Documentation

## Overview

The Photo Gallery System provides a comprehensive platform for user-generated photo galleries with admin promotion workflows and page header management. The system supports multiple privacy levels, advanced metadata storage, engagement features, and sophisticated admin controls.

## Database Tables

### Core Gallery Tables

#### `user_galleries`
User-owned photo collections with privacy controls and organization features.

**Key Features:**
- User-specific photo collections
- Privacy levels: `public`, `members_only`, `private`
- Visibility controls: `visible`, `hidden`, `archived`
- Featured gallery support
- Automatic photo count tracking
- Tag-based categorization
- Unique slug generation for SEO-friendly URLs

**Important Fields:**
- `cover_photo_id`: Self-referencing to set gallery cover image
- `privacy_level`: Controls who can view the gallery
- `slug`: User-specific URL slug (unique per user)
- `photo_count`: Automatically maintained count
- `view_count`: Gallery engagement tracking

#### `gallery_photos`
Individual photos with comprehensive metadata and engagement features.

**Key Features:**
- Complete EXIF data storage
- Multiple image sizes (original, thumbnail, medium)
- Location data with GPS coordinates
- Advanced engagement metrics
- Moderation workflow
- Featured photo promotion
- Tag-based organization

**Technical Metadata:**
- Camera information (make, model, settings)
- Image dimensions and file size
- Processing status tracking
- Storage path management

**Engagement Features:**
- View, like, and comment counting
- Featured photo designation
- Admin moderation status

### Admin & Promotion Tables

#### `photo_promotions`
Admin workflow for promoting photos to featured positions.

**Promotion Types:**
- `featured`: General featured photos
- `homepage_hero`: Main homepage banner
- `gallery_cover`: Gallery cover images
- `event_banner`: Event-specific banners
- `news_image`: News article images

**Workflow Features:**
- Approval workflow with admin review
- Scheduling with start/end dates
- Priority ordering
- Context-specific promotions
- Metrics tracking (impressions, clicks)

#### `page_headers`
Dynamic page header assignment system with responsive support.

**Key Features:**
- Page-specific header images
- Overlay text with positioning
- Responsive image support (mobile, tablet variants)
- Scheduling and priority system
- Custom styling options
- Color and opacity controls

### Engagement Tables

#### `photo_likes`
User engagement through photo likes.

**Features:**
- One like per user per photo
- Automatic count updates
- Engagement tracking

#### `photo_comments`
Threaded comment system for photos.

**Features:**
- Nested comment support (replies)
- Content moderation
- Edit tracking
- Character limits (2000 max)

### Tagging System

#### `photo_tags` & `gallery_tags`
Junction tables connecting photos/galleries to the central tags system.

**Features:**
- Reusable tag system integration
- Tag usage tracking
- Contributor attribution
- Automatic tag count updates

## Key Relationships

```
members (users)
├── user_galleries (1:many)
│   ├── gallery_photos (1:many)
│   │   ├── photo_likes (1:many)
│   │   ├── photo_comments (1:many)
│   │   ├── photo_tags (many:many via tags)
│   │   └── photo_promotions (1:many)
│   └── gallery_tags (many:many via tags)
├── photo_promotions (admin actions)
└── page_headers (admin management)
```

## Privacy & Security Model

### Privacy Levels

1. **Public**: Visible to everyone
2. **Members Only**: Visible to authenticated users
3. **Private**: Visible only to owner and admins

### Row Level Security (RLS) Policies

**Gallery Access:**
- Public galleries visible to all
- Member galleries require authentication
- Private galleries restricted to owners/admins
- Users manage their own content

**Photo Access:**
- Inherits gallery privacy settings
- Additional moderation status check
- Approved content only for public viewing

**Admin Controls:**
- Full access to promotions and page headers
- Moderation capabilities
- User content management

**Engagement:**
- Authenticated users can like/comment
- Users manage their own interactions
- Public viewing of approved content

## Performance Optimizations

### Indexes

**Gallery Performance:**
- User-specific gallery lookups
- Privacy and visibility filtering
- Featured content queries
- Creation date ordering

**Photo Performance:**
- Gallery-specific photo queries
- Moderation status filtering
- Location-based searches
- Metadata searches (GIN indexes)

**Engagement Performance:**
- User-specific likes/comments
- Photo-specific engagement data

### Automated Counts

**Trigger-Based Updates:**
- Gallery photo counts
- Photo like/comment counts
- Tag usage statistics
- Automatic timestamp updates

## File Storage Strategy

### Storage Paths
- `storage_path`: Original full-resolution image
- `thumbnail_path`: Small thumbnail (e.g., 200x200)
- `medium_path`: Medium-sized version (e.g., 800x600)

### File Organization
```
photos/
├── {user_id}/
│   ├── {gallery_id}/
│   │   ├── originals/
│   │   ├── thumbnails/
│   │   └── medium/
```

### Processing Pipeline
1. **Upload**: Original file stored
2. **Processing**: Generate thumbnails and medium sizes
3. **EXIF Extraction**: Metadata parsing and storage
4. **Moderation**: Admin review for public content
5. **Optimization**: Additional size generation as needed

## Data Constraints & Validation

### File Constraints
- Maximum file size: 50MB
- Supported formats: JPEG, PNG, WebP, TIFF
- Minimum dimensions: 1x1 pixel

### Content Constraints
- Gallery titles: 1-255 characters
- Photo descriptions: No limit
- Comments: 1-2000 characters
- Alt text: 500 characters max

### Geographic Constraints
- Latitude: -90 to 90 degrees
- Longitude: -180 to 180 degrees
- Coordinate validation for valid pairs

## Advanced Features

### EXIF Data Storage
Complete camera metadata stored as JSONB:
```json
{
  "camera": {
    "make": "Canon",
    "model": "EOS R5",
    "lens": "RF 24-70mm f/2.8L IS USM"
  },
  "settings": {
    "focal_length": "50mm",
    "aperture": "f/2.8",
    "shutter_speed": "1/125",
    "iso": 400
  },
  "location": {
    "altitude": 1234.5,
    "direction": 45.2
  }
}
```

### Promotion Context
Flexible promotion system supporting various contexts:
```json
{
  "context_type": "event",
  "context_id": "uuid-of-event",
  "context_data": {
    "event_name": "Tech Meetup 2024",
    "display_duration": 7200,
    "target_audience": "tech_professionals"
  }
}
```

### Page Header Styling
Comprehensive styling options:
```json
{
  "overlay": {
    "position": "bottom-left",
    "opacity": 0.8,
    "background": "#000000",
    "text_color": "#ffffff"
  },
  "effects": {
    "blur_background": false,
    "darken_image": true,
    "custom_css": "filter: sepia(0.3);"
  }
}
```

## Utility Functions

### `get_gallery_stats(gallery_uuid)`
Returns comprehensive gallery statistics:
```json
{
  "total_photos": 25,
  "total_views": 1250,
  "total_likes": 89,
  "total_comments": 34,
  "featured_photos": 3,
  "pending_moderation": 1
}
```

### `get_user_photo_stats(user_uuid)`
Returns user's photo activity statistics:
```json
{
  "total_galleries": 5,
  "total_photos": 127,
  "total_views": 5430,
  "total_likes": 312,
  "total_comments": 156,
  "featured_photos": 8,
  "public_galleries": 4
}
```

## Database Views

### `public_galleries`
Pre-filtered view of publicly accessible galleries with user information.

### `featured_photos`
Curated view of featured photos with gallery and user context.

### `active_page_headers`
Current active page headers with photo information and scheduling.

## Migration Considerations

### Existing Data
- Schema designed to coexist with current system
- No conflicts with existing tables
- Reuses established patterns (tags, members, user_roles)

### Performance Impact
- Indexes created for optimal query performance
- Trigger functions optimized for minimal overhead
- Views provide pre-computed common queries

### Storage Requirements
- Expect significant storage growth with image files
- Plan for CDN integration for optimal delivery
- Consider automatic archival of old content

## Security Considerations

### Data Protection
- All user content protected by RLS policies
- Admin actions logged for audit trails
- Sensitive metadata (location) respects privacy settings

### File Security
- Storage paths don't expose user information
- File access controlled through application layer
- Image processing validates file types

### Privacy Controls
- Users control their content visibility
- Location data optional and controllable
- EXIF data can be stripped on upload if desired

## Maintenance & Monitoring

### Regular Tasks
- Monitor storage usage and cleanup
- Review moderation queue
- Update featured content
- Analyze engagement metrics

### Performance Monitoring
- Track query performance on large datasets
- Monitor trigger execution times
- Review index usage and optimization

### Data Integrity
- Validate file references match storage
- Check constraint compliance
- Monitor automated count accuracy

## Future Enhancements

### Planned Features
- Automatic image optimization
- AI-powered content tagging
- Advanced search with ML
- Integration with external photo services

### Scalability Considerations
- Partition large tables by date
- Implement caching for popular content
- Consider read replicas for heavy query loads
- Plan for multi-region content distribution

This schema provides a robust foundation for a comprehensive photo gallery system with room for future growth and enhancement.