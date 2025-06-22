# Database Seed Files

This directory contains comprehensive demo data for the Nelson Tech Community Platform.

## Files Overview

### 1. `01_fresh_demo_content_final.sql`
**Primary seed file** containing complete demo data:
- 10 diverse tech professionals with realistic profiles
- 10 local tech companies across various sectors
- Member skills and expertise data
- Company-member relationships
- 5 events (workshops, summits, networking)
- 5 community groups with memberships
- 5 marketplace listings (products and services)
- 5 news articles with community topics
- 5 educational resources
- 5 job opportunities

### 2. `02_additional_demo_relationships.sql`
**Relationship enhancement file** that adds:
- Event registrations and attendance patterns
- Extended group memberships
- Marketplace bookmarks and interactions
- Resource bookmarks and engagement
- Job applications and career activity
- News article likes and community engagement

### 3. `03_photo_gallery_seed_data.sql`
**Photo gallery system data** featuring:
- 8 user galleries showcasing diverse tech disciplines
- 9 professional photos with realistic metadata and EXIF data
- Photo likes, comments, and engagement patterns
- Photo promotions and admin workflow examples
- Dynamic page headers with photo backgrounds
- Gallery privacy levels and moderation status

### 4. `04_newsletter_campaign_seed_data.sql`
**Newsletter and campaign system data** including:
- 13 newsletter subscriptions with diverse preferences
- 4 professional email templates (digest, event, welcome, roundup)
- 5 newsletter campaigns (sent, scheduled, draft, automated)
- 10 content automation rules for intelligent curation
- 18 analytics records with realistic engagement metrics
- Content caching for performance optimization

### 5. `05_gallery_newsletter_relationships.sql`
**Cross-platform integration data** that connects:
- Photo-tag relationships for better categorization
- Newsletter campaign photo usage and tracking
- Gallery photos in news articles and events
- Company and group photo showcases
- Resource thumbnail associations
- Engagement analytics across platforms

### 6. `validate_seeds.sql`
**Validation script** to verify:
- Table existence and structure
- Data counts and completeness
- Foreign key relationship integrity
- Data quality and required fields
- UUID format validation

## Usage

### Load Complete Demo Data
```bash
# Load all seed files in order
psql -d your_database -f database/seeds/01_fresh_demo_content_final.sql
psql -d your_database -f database/seeds/02_additional_demo_relationships.sql
psql -d your_database -f database/seeds/03_photo_gallery_seed_data.sql
psql -d your_database -f database/seeds/04_newsletter_campaign_seed_data.sql
psql -d your_database -f database/seeds/05_gallery_newsletter_relationships.sql
```

### Validate Data
```bash
# Run validation checks
psql -d your_database -f database/seeds/validate_seeds.sql
```

### Using with Supabase
```bash
# If using Supabase CLI
supabase db reset
supabase db seed database/seeds/01_fresh_demo_content_final.sql
supabase db seed database/seeds/02_additional_demo_relationships.sql
supabase db seed database/seeds/03_photo_gallery_seed_data.sql
supabase db seed database/seeds/04_newsletter_campaign_seed_data.sql
supabase db seed database/seeds/05_gallery_newsletter_relationships.sql
```

## Demo Data Features

### Realistic Community
- **10 Members**: Diverse tech professionals from various backgrounds
- **Skills**: 40+ technical skills across different experience levels
- **Companies**: Local Kootenay tech companies with authentic descriptions
- **Locations**: Nelson, Castlegar, Kaslo, Trail, Rossland

### Rich Interactions
- **Event Attendance**: Realistic registration patterns
- **Group Participation**: Cross-pollination between groups
- **Marketplace Activity**: Bookmarks and interest tracking
- **Learning Patterns**: Resource engagement and bookmarks
- **Career Mobility**: Job applications and opportunities

### Content Variety
- **Events**: In-person workshops, online webinars, networking events
- **News**: Tech growth, awards, mentorship programs, expansion
- **Resources**: Courses, documentation, articles, frameworks
- **Opportunities**: Full-time, part-time, contract, various experience levels
- **Photo Galleries**: Professional workspaces, tech setups, design processes
- **Newsletters**: Weekly digests, event announcements, welcome emails
- **Visual Content**: Dynamic page headers, photo promotions, cross-platform integration

## Data Quality

### Consistency
- All UUIDs follow proper format
- Timestamps use Vancouver timezone
- Relationships maintain referential integrity
- Status fields use consistent enums

### Realism
- Professional photos with realistic metadata and EXIF data
- Authentic company descriptions and portfolios
- Realistic pricing for marketplace items
- Proper geographic coordinates for events
- Gallery photos showcasing actual tech workspaces
- Newsletter engagement metrics based on industry standards
- Cross-platform photo usage demonstrating real workflows

### Completeness
- No orphaned records
- All required fields populated
- Balanced representation across demographics
- Cross-feature integration

## Customization

### Adding More Data
1. Follow existing UUID patterns
2. Maintain relationship integrity
3. Use realistic Canadian locations
4. Include proper timestamps

### Modifying Existing Data
1. Update references consistently
2. Maintain data quality standards
3. Test with validation script
4. Document changes

## Testing

The seed data is designed to support:
- **Feature Testing**: All platform features have supporting data including galleries and newsletters
- **UI Testing**: Diverse visual content for comprehensive interface testing
- **Integration Testing**: Realistic cross-platform workflows and data relationships
- **Performance Testing**: Sufficient data volume including photos and analytics
- **Admin Testing**: Photo promotions, newsletter campaigns, and moderation workflows
- **Analytics Testing**: Engagement metrics, click tracking, and performance data

## Privacy & Compliance

- All personal data is fictional
- No real contact information used
- Placeholder images with proper paths (not actual files)
- Generic company information only
- Newsletter analytics data is simulated
- Photo metadata includes realistic but non-personal technical details

---

**Last Updated**: June 2025  
**Compatible With**: PostgreSQL 12+, Supabase  
**Data Version**: 2.0.0 (includes galleries, newsletters, and cross-platform integration)