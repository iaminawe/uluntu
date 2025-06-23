# Opportunity Gallery Integration

## Overview

The opportunity gallery integration allows organizations to attach photo galleries to job postings, volunteer opportunities, funding applications, and community initiatives. This feature enables rich visual storytelling that helps potential applicants understand the work environment, project outcomes, and organizational culture.

## Features

### 🖼️ **Gallery Attachments**
- Attach multiple galleries to any opportunity
- Set display order and featured status
- Add contextual captions explaining relevance
- Support for all gallery privacy levels

### 🔐 **Permission-Based Access**
- Opportunity creators can attach any accessible gallery
- Gallery owners can attach their galleries to any opportunity
- Viewers see galleries based on their access permissions
- Automatic permission inheritance from gallery settings

### 📱 **Rich UI Components**
- **OpportunityGalleryManager**: Full management interface for editing
- **OpportunityGalleries**: Clean display component for viewing
- Responsive grid layouts with hover effects
- Modal dialogs for attachment management

### 🗃️ **Database Architecture**
- `opportunity_galleries` junction table with metadata
- RLS policies for secure access control
- Database functions for efficient queries
- Automatic timestamp tracking

## Usage Examples

### For Job Postings
```markdown
**Software Developer Position**
- Attach workspace galleries showing development environment
- Include team collaboration photos from design sessions
- Show completed project galleries demonstrating work quality
```

### For Volunteer Opportunities
```markdown
**Community Tech Support**
- Display previous volunteer project outcomes
- Show training session galleries
- Include testimonial photos from beneficiaries
```

### For Funding Applications
```markdown
**Startup Accelerator Program**
- Showcase success stories from previous cohorts
- Display mentorship and workshop session galleries
- Include facility and networking event photos
```

## Technical Implementation

### API Functions

```typescript
// Get galleries attached to an opportunity
const galleries = await opportunitiesApi.getOpportunityGalleries(opportunityId);

// Get galleries available for attachment
const available = await opportunitiesApi.getAttachableGalleries(opportunityId);

// Attach a gallery
await opportunitiesApi.attachGallery({
  opportunity_id: opportunityId,
  gallery_id: galleryId,
  featured: true,
  caption: "Our collaborative workspace design process"
});

// Update attachment metadata
await opportunitiesApi.updateGalleryAttachment(attachmentId, {
  display_order: 0,
  featured: true,
  caption: "Updated caption"
});

// Remove gallery attachment
await opportunitiesApi.detachGallery(attachmentId);
```

### React Components

#### OpportunityGalleryManager (Full Management)
```tsx
import { OpportunityGalleryManager } from '@/features/opportunities/components/OpportunityGalleryManager';

<OpportunityGalleryManager
  opportunityId="opportunity-uuid"
  canEdit={userCanEdit}
  onGalleryUpdate={() => refetchData()}
/>
```

#### OpportunityGalleries (Display Only)
```tsx
import { OpportunityGalleries } from '@/features/opportunities/components/OpportunityGalleries';

<OpportunityGalleries
  opportunityId="opportunity-uuid"
  limit={3}
  showViewAll={true}
/>
```

### Database Schema

```sql
-- Junction table for opportunity-gallery relationships
CREATE TABLE opportunity_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  caption TEXT,
  attached_by UUID REFERENCES members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT opportunity_galleries_unique UNIQUE (opportunity_id, gallery_id)
);
```

## User Workflows

### 📝 **Creating Opportunities with Galleries**

1. **Create the opportunity** with basic information
2. **Navigate to gallery section** in the opportunity editor
3. **Click "Attach Gallery"** to open the gallery browser
4. **Select galleries** from your own or public galleries
5. **Set display order** and featured status
6. **Add captions** to provide context
7. **Save changes** to publish the opportunity

### 👀 **Viewing Opportunities with Galleries**

1. **Browse opportunities** in the opportunities listing
2. **Click opportunity** to view details
3. **Scroll to galleries section** to see attached galleries
4. **Click gallery thumbnails** to view full galleries
5. **Read captions** for context about gallery relevance

### ✏️ **Managing Gallery Attachments**

1. **Edit opportunity** if you have permission
2. **Use gallery manager** to add/remove/reorder galleries
3. **Update captions** to improve context
4. **Set featured galleries** to highlight most important content
5. **Reorder galleries** by dragging or setting display order

## Permission Model

### 🔒 **Access Control Rules**

| User Type | Can View | Can Attach | Can Edit |
|-----------|----------|------------|----------|
| **Opportunity Creator** | All attached galleries | Any accessible gallery | All attachments |
| **Gallery Owner** | Own galleries | Own galleries to any opportunity | Own gallery attachments |
| **Public User** | Public galleries only | - | - |
| **Community Member** | Public + member galleries | - | - |

### 🛡️ **Security Features**

- **Row Level Security (RLS)** on all gallery operations
- **Automatic permission inheritance** from opportunity and gallery settings
- **Cascade deletion** when opportunities or galleries are deleted
- **Audit logging** of attachment/detachment actions

## Best Practices

### 📸 **Gallery Selection**
- **Choose relevant galleries** that directly relate to the opportunity
- **Use high-quality images** that represent your organization well
- **Include diverse perspectives** showing different aspects of the work
- **Keep galleries current** and remove outdated content

### 📝 **Caption Writing**
- **Explain the connection** between gallery and opportunity
- **Provide context** about what viewers are seeing
- **Use engaging language** that tells a story
- **Keep captions concise** but informative

### 🎯 **Strategic Usage**
- **Feature your best content** to make strong first impressions
- **Show work environment** to help candidates envision themselves there
- **Demonstrate outcomes** to prove the impact of your work
- **Include team photos** to showcase culture and collaboration

## Performance Considerations

### ⚡ **Optimization Features**
- **Lazy loading** of gallery thumbnails
- **Efficient database queries** using stored functions
- **Cached gallery metadata** to reduce API calls
- **Responsive image sizing** for different screen sizes

### 📊 **Monitoring**
- **Track gallery view counts** on opportunities
- **Monitor attachment success rates** 
- **Analyze which galleries drive engagement**
- **Optimize based on user behavior patterns**

## Future Enhancements

### 🚀 **Planned Features**
- **Drag-and-drop reordering** for gallery attachments
- **Bulk gallery operations** for managing multiple attachments
- **Gallery preview cards** with hover effects and metadata
- **Integration with social media** for expanded reach
- **Analytics dashboard** for gallery performance metrics

### 🔮 **Advanced Integrations**
- **AI-powered gallery suggestions** based on opportunity content
- **Automatic caption generation** using image analysis
- **Gallery template system** for common opportunity types
- **Integration with external portfolio platforms**

## Troubleshooting

### ❓ **Common Issues**

**"Gallery not appearing in attachment list"**
- Check gallery privacy settings (must be public or members-only)
- Verify gallery visibility (cannot be hidden or archived)
- Ensure user has permission to view the gallery

**"Cannot attach gallery to opportunity"**
- Verify user is opportunity creator or gallery owner
- Check if gallery is already attached (no duplicates allowed)
- Ensure opportunity is in draft or published status

**"Gallery thumbnails not loading"**
- Check if gallery has a cover photo set
- Verify image URLs are accessible
- Clear browser cache and reload page

### 🔧 **Database Maintenance**

**Cleaning up orphaned attachments:**
```sql
-- Remove attachments where opportunity or gallery no longer exists
DELETE FROM opportunity_galleries 
WHERE opportunity_id NOT IN (SELECT id FROM opportunities)
   OR gallery_id NOT IN (SELECT id FROM user_galleries);
```

**Updating display orders:**
```sql
-- Reset display orders to be sequential
WITH ordered_galleries AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY opportunity_id ORDER BY created_at) - 1 as new_order
  FROM opportunity_galleries
)
UPDATE opportunity_galleries 
SET display_order = ordered_galleries.new_order
FROM ordered_galleries 
WHERE opportunity_galleries.id = ordered_galleries.id;
```

This integration creates a powerful storytelling platform that helps opportunities stand out and gives applicants a much richer understanding of what they're applying for.