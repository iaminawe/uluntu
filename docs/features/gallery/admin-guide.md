# Photo Gallery Admin Management Guide

## Overview

The Photo Gallery Admin Interface provides comprehensive tools for managing photo galleries across the Uluntu. This guide covers all aspects of gallery administration, from basic CRUD operations to advanced entity attachments.

## Table of Contents

1. [Accessing the Admin Interface](#accessing-the-admin-interface)
2. [Gallery Management](#gallery-management)
3. [Photo Moderation](#photo-moderation)
4. [Storage Analytics](#storage-analytics)
5. [Entity Gallery Attachments](#entity-gallery-attachments)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Accessing the Admin Interface

Navigate to `/admin/media` in your browser or click "Media Management" from the admin dashboard.

### Required Permissions
- **Admin Role**: Full access to all features
- **Moderator Role**: Access to moderation queue and view-only for galleries
- **Editor Role**: Can manage galleries but cannot delete user content

## Gallery Management

### Creating a Gallery

1. Click the **"Create Gallery"** button in the top-right corner
2. Fill in the required fields:
   - **Title**: Gallery name (required)
   - **Description**: Gallery description (optional)
   - **Privacy Level**: 
     - Public: Visible to everyone
     - Members Only: Visible to authenticated users
     - Private: Visible only to owner and admins
   - **Visibility**: 
     - Visible: Gallery appears in listings
     - Hidden: Gallery accessible via direct link only
3. Click **"Create"** to save the gallery

### Viewing Galleries

The gallery list displays all galleries with:
- Thumbnail preview
- Title and description
- Owner information
- Photo count
- Privacy status
- Creation date

#### Filtering Options
- **Search**: Type to search by title or description
- **Privacy Level**: Filter by public/members/private
- **Owner Type**: Filter by user/group/company
- **Sort By**: Date created, date updated, title, photo count

### Editing a Gallery

1. Click the **"Edit"** button on any gallery card
2. Modify the desired fields
3. Click **"Save"** to apply changes

### Deleting Galleries

#### Single Gallery
1. Click the **"Delete"** button on the gallery card
2. Confirm the deletion in the modal
3. Associated photos will be permanently removed

#### Bulk Delete
1. Select multiple galleries using checkboxes
2. Click **"Delete Selected"** from the bulk actions menu
3. Confirm the bulk deletion

## Photo Moderation

### Moderation Queue

Access the moderation tab to review user-submitted photos.

#### Photo States
- **Pending**: Awaiting review
- **Approved**: Approved for display
- **Rejected**: Rejected with reason
- **Flagged**: Requires additional review

### Moderation Actions

#### Approve Photos
1. Review photo content and metadata
2. Click **"Approve"** to approve individual photos
3. Or select multiple and use **"Approve Selected"**

#### Reject Photos
1. Click **"Reject"** on inappropriate content
2. Select a rejection reason:
   - Inappropriate content
   - Copyright violation
   - Poor quality
   - Duplicate
   - Other (specify)
3. Optionally add a custom message

#### Bulk Moderation
1. Use checkboxes to select multiple photos
2. Choose action from bulk actions menu
3. Apply the same action to all selected photos

### Moderation Guidelines

- Review photos for inappropriate content
- Check for copyright violations
- Ensure photos meet quality standards
- Verify photos match gallery context

## Storage Analytics

### Dashboard Overview

The analytics tab provides insights into storage usage:

#### Key Metrics
- **Total Storage Used**: Overall storage consumption
- **Total Photos**: Number of photos in system
- **Total Galleries**: Number of galleries
- **Average Photos per Gallery**: System average

### Storage Charts

#### Storage Growth
- Daily upload trends
- Monthly storage increase
- Projected storage needs

#### File Type Distribution
- JPEG vs PNG vs WebP breakdown
- Average file sizes by type

#### Top Users by Storage
- Users consuming most storage
- Photo count per user
- Gallery count per user

### Optimization Recommendations

The system provides automatic recommendations:
- **Large Files**: Photos over 5MB that could be optimized
- **Duplicates**: Potential duplicate photos
- **Orphaned Files**: Photos without gallery associations
- **Unused Galleries**: Empty galleries that can be removed

## Entity Gallery Attachments

Galleries can be attached to various entities across the platform.

### Supported Entities

#### Groups
- Community photo albums
- Event documentation
- Member contributions

#### Events
- Event photos
- Speaker galleries
- Venue images
- Sponsor showcases

#### News Articles
- Article images
- Photo stories
- Infographics

#### Companies
- Company portfolios
- Team photos
- Product galleries
- Office tours

#### Marketplace Listings
- Product images
- Usage examples
- Customer photos

#### Resources
- Tutorial screenshots
- Documentation images
- Example galleries

#### Pages
- Hero banners
- Content galleries
- Background images
- Testimonial photos

#### User Profiles
- Portfolio galleries
- Personal albums
- Achievement showcases

### Attaching Galleries to Entities

1. Navigate to the **"Assignments"** tab
2. Select the entity type from the dropdown
3. Search or browse for the specific entity
4. Click **"Assign Gallery"** on the entity card
5. Select one or more galleries from the modal
6. Click **"Assign"** to create the attachment

### Managing Attachments

#### Set Featured Gallery
1. Click the star icon next to any attached gallery
2. The featured gallery will be highlighted on the entity's page

#### Reorder Galleries
1. Drag and drop galleries to reorder them
2. The order will be reflected on the entity's page

#### Remove Attachments
1. Click the **"X"** button on any attached gallery
2. Confirm the removal (gallery is not deleted, just unlinked)

### Gallery Types by Entity

Different entities support different gallery types:

#### Event Gallery Types
- `main`: Primary event gallery
- `promotional`: Marketing materials
- `behind_scenes`: Behind the scenes content
- `highlights`: Event highlights
- `sponsors`: Sponsor content
- `venue`: Venue photos

#### News Gallery Types
- `article`: Main article images
- `hero`: Hero/featured images
- `inline`: Inline content images
- `infographic`: Data visualizations
- `supporting`: Supporting materials

#### Page Gallery Types
- `content`: Main content galleries
- `hero`: Hero section images
- `carousel`: Carousel/slider images
- `banner`: Banner images
- `background`: Background images
- `testimonials`: Testimonial photos

## Best Practices

### Gallery Organization

1. **Use Descriptive Titles**: Make galleries easy to find
2. **Set Appropriate Privacy**: Consider audience for each gallery
3. **Add Descriptions**: Help users understand gallery content
4. **Use Cover Photos**: Set attractive cover images
5. **Regular Cleanup**: Remove empty or duplicate galleries

### Photo Management

1. **Moderate Promptly**: Review pending photos within 24 hours
2. **Provide Feedback**: Include reasons when rejecting photos
3. **Batch Operations**: Use bulk actions for efficiency
4. **Monitor Storage**: Keep track of storage usage trends

### Entity Attachments

1. **Relevant Content**: Only attach relevant galleries to entities
2. **Featured Galleries**: Always set a featured gallery for key entities
3. **Consistent Types**: Use appropriate gallery types for each entity
4. **Regular Updates**: Keep entity galleries current

### Performance Optimization

1. **Image Sizes**: Encourage optimized image uploads
2. **Cleanup Old Content**: Archive or remove outdated galleries
3. **Monitor Analytics**: Use analytics to identify optimization opportunities
4. **Use Pagination**: Navigate large lists efficiently

## Troubleshooting

### Common Issues

#### Gallery Won't Delete
- **Cause**: Gallery may have protected photos or be featured
- **Solution**: Remove featured status and check for protected content

#### Photos Not Appearing
- **Cause**: Photos may be pending moderation
- **Solution**: Check moderation queue for pending items

#### Upload Failures
- **Cause**: File size limits or unsupported formats
- **Solution**: Check file requirements (max 10MB, JPEG/PNG/WebP)

#### Attachment Not Working
- **Cause**: Permission issues or entity restrictions
- **Solution**: Verify admin permissions and entity status

### Storage Issues

#### Storage Quota Exceeded
1. Review storage analytics
2. Identify large files or heavy users
3. Run optimization recommendations
4. Consider increasing storage limits

#### Slow Loading
1. Check number of photos per gallery
2. Ensure image optimization is enabled
3. Review CDN configuration
4. Consider implementing pagination

### Permission Errors

#### Cannot Edit Gallery
- Verify admin role is active
- Check gallery ownership
- Ensure gallery isn't locked

#### Cannot Moderate Photos
- Confirm moderator permissions
- Check if moderation queue is enabled
- Verify photo status

## API Integration

For developers integrating with the gallery system:

### Key Endpoints
```typescript
// Gallery CRUD
GET    /api/galleries
POST   /api/galleries
PUT    /api/galleries/:id
DELETE /api/galleries/:id

// Photo Management
POST   /api/galleries/:id/photos
DELETE /api/photos/:id
POST   /api/photos/batch-delete

// Entity Attachments
POST   /api/entities/:type/:id/galleries
DELETE /api/entities/:type/:id/galleries/:galleryId
PUT    /api/entities/:type/:id/galleries/featured
```

### Authentication
All admin operations require authentication with admin role:
```typescript
headers: {
  'Authorization': 'Bearer [admin-token]'
}
```

## Support

For additional help:
- Check the [Developer Documentation](admin-api-reference.md)
- Contact the development team
- Submit a support ticket

## Changelog

### Version 2.0.0 (Current)
- Added entity gallery attachments
- Implemented photo moderation workflow
- Added storage analytics dashboard
- Support for pages and user profiles
- Bulk operations for efficiency
- Enhanced filtering and search

### Version 1.0.0
- Initial gallery CRUD operations
- Basic photo management
- User gallery support