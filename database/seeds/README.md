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

### 3. `validate_seeds.sql`
**Validation script** to verify:
- Table existence and structure
- Data counts and completeness
- Foreign key relationship integrity
- Data quality and required fields
- UUID format validation

## Usage

### Load Complete Demo Data
```bash
# Load primary demo content
psql -d your_database -f database/seeds/01_fresh_demo_content_final.sql

# Add relationship data
psql -d your_database -f database/seeds/02_additional_demo_relationships.sql
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

## Data Quality

### Consistency
- All UUIDs follow proper format
- Timestamps use Vancouver timezone
- Relationships maintain referential integrity
- Status fields use consistent enums

### Realism
- Professional photos from Unsplash
- Authentic company descriptions
- Realistic pricing for marketplace items
- Proper geographic coordinates for events

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
- **Feature Testing**: All platform features have supporting data
- **UI Testing**: Diverse content for visual testing
- **Integration Testing**: Realistic user workflows
- **Performance Testing**: Sufficient data volume for testing

## Privacy & Compliance

- All personal data is fictional
- No real contact information used
- Stock photos with proper licensing
- Generic company information only

---

**Last Updated**: June 2025  
**Compatible With**: PostgreSQL 12+, Supabase  
**Data Version**: 1.0.0