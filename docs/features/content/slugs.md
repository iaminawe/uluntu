# Slug System Implementation

This document describes the comprehensive slug system implemented for all content tables in the application.

## Overview

The slug system provides URL-friendly identifiers for all major content types:
- **Members** - Generated from member names
- **Events** - Generated from event titles  
- **Opportunities** - Generated from opportunity titles
- **Groups** - Generated from group names
- **News** - Generated from news article titles

## Migration Files

### Primary Migration: `20250819000030_add_content_table_slugs.sql`

This migration:
1. ✅ Adds `slug` columns to all content tables that don't have them
2. ✅ Creates utility functions for slug generation and uniqueness
3. ✅ Populates existing records with generated slugs
4. ✅ Adds unique constraints and indexes for performance
5. ✅ Creates automatic triggers for future record creation
6. ✅ Provides helper functions for management

### Test Migration: `20250819000031_test_slug_functionality.sql`

This migration:
1. ✅ Tests slug generation functions
2. ✅ Verifies all columns, indexes, and triggers exist
3. ✅ Checks for duplicate slugs
4. ✅ Generates a comprehensive status report

## Database Functions

### Core Functions

#### `generate_slug_from_text(input_text TEXT) → TEXT`
Converts any text into a URL-friendly slug:
- Removes special characters
- Converts to lowercase
- Replaces spaces with hyphens
- Trims leading/trailing hyphens

**Example:**
```sql
SELECT generate_slug_from_text('Hello World! This is a Test');
-- Returns: 'hello-world-this-is-a-test'
```

#### `ensure_unique_slug(table_name, slug_column, proposed_slug, exclude_id) → TEXT`
Ensures slug uniqueness by appending numbers if needed:
- Checks for existing slug in specified table
- Appends `-2`, `-3`, etc. for duplicates
- Excludes current record when updating

**Example:**
```sql
SELECT ensure_unique_slug('members', 'slug', 'john-doe', NULL);
-- Returns: 'john-doe' or 'john-doe-2' if 'john-doe' exists
```

### Management Functions

#### `regenerate_table_slugs(table_name TEXT) → INTEGER`
Regenerates all slugs for a table:
```sql
SELECT regenerate_table_slugs('members');
-- Returns: number of updated records
```

#### `check_duplicate_slugs() → TABLE(table_name, slug, count)`
Finds duplicate slugs across all tables:
```sql
SELECT * FROM check_duplicate_slugs();
```

## Automatic Triggers

Each content table has a trigger that automatically generates slugs:
- `auto_generate_members_slug`
- `auto_generate_events_slug`
- `auto_generate_opportunities_slug`
- `auto_generate_groups_slug`
- `auto_generate_news_slug`

**Trigger behavior:**
- Fires on `INSERT` and `UPDATE`
- Only generates slug if `slug` field is NULL or empty
- Uses appropriate source field (name/title) for each table
- Ensures uniqueness automatically

## Database Schema Changes

### Members Table
```sql
ALTER TABLE members ADD COLUMN slug TEXT;
ALTER TABLE members ADD CONSTRAINT members_slug_unique UNIQUE (slug);
ALTER TABLE members ALTER COLUMN slug SET NOT NULL;
CREATE INDEX idx_members_slug ON members(slug);
```

### Events Table
```sql
ALTER TABLE events ADD COLUMN slug TEXT;
ALTER TABLE events ADD CONSTRAINT events_slug_unique UNIQUE (slug);
ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
CREATE INDEX idx_events_slug ON events(slug);
```

### Opportunities Table
```sql
ALTER TABLE opportunities ADD COLUMN slug TEXT;
ALTER TABLE opportunities ADD CONSTRAINT opportunities_slug_unique UNIQUE (slug);
ALTER TABLE opportunities ALTER COLUMN slug SET NOT NULL;
CREATE INDEX idx_opportunities_slug ON opportunities(slug);
```

### Groups Table
```sql
ALTER TABLE groups ADD COLUMN slug TEXT;
ALTER TABLE groups ADD CONSTRAINT groups_slug_unique UNIQUE (slug);
ALTER TABLE groups ALTER COLUMN slug SET NOT NULL;
CREATE INDEX idx_groups_slug ON groups(slug);
```

### News Table
```sql
-- Already existed, enhanced with constraints
ALTER TABLE news ADD CONSTRAINT news_slug_unique UNIQUE (slug);
ALTER TABLE news ALTER COLUMN slug SET NOT NULL;
```

## Management Script

Use `/scripts/manage-slugs.sh` for slug management:

### Commands

```bash
# Check slug status across all tables
./scripts/manage-slugs.sh check

# Regenerate slugs for a specific table
./scripts/manage-slugs.sh regenerate --table members

# Find duplicate slugs
./scripts/manage-slugs.sh duplicates

# Run slug generation tests
./scripts/manage-slugs.sh test

# Run the full migration
./scripts/manage-slugs.sh migrate

# Show help
./scripts/manage-slugs.sh help
```

### Options

```bash
--table TABLE    Specify table (members, events, opportunities, groups, news)
--dry-run        Show what would be done without executing
--url URL        Database URL (default: $DATABASE_URL or local)
```

## Usage in Application Code

### TypeScript Types

Update your TypeScript interfaces to include slugs:

```typescript
interface Member {
  id: string;
  name: string;
  slug: string;  // New field
  // ... other fields
}

interface Event {
  id: string;
  title: string;
  slug: string;  // New field
  // ... other fields
}

// Similar for Opportunity, Group, News
```

### API Endpoints

Create new slug-based endpoints:

```typescript
// Before: /api/members/:id
// After: /api/members/by-slug/:slug

// Example route
app.get('/api/members/by-slug/:slug', async (req, res) => {
  const { slug } = req.params;
  const member = await supabase
    .from('members')
    .select('*')
    .eq('slug', slug)
    .single();
  res.json(member);
});
```

### Frontend Routing

Update your React routes to use slugs:

```typescript
// Before: /members/:id
// After: /members/:slug

// React Router
<Route path="/members/:slug" component={MemberProfile} />

// Link generation
<Link to={`/members/${member.slug}`}>
  {member.name}
</Link>
```

## Benefits

1. **SEO-Friendly URLs**: `/members/john-doe` vs `/members/uuid`
2. **Human-Readable**: Users can understand the URL structure
3. **Bookmarkable**: URLs are meaningful and memorable
4. **Automatic**: No manual intervention required
5. **Consistent**: Same pattern across all content types
6. **Performance**: Indexed for fast lookups
7. **Unique**: Guaranteed uniqueness with automatic numbering

## Migration Safety

The migration is designed to be:
- **Idempotent**: Safe to run multiple times
- **Non-destructive**: Doesn't modify existing data
- **Backwards-compatible**: Existing functionality continues to work
- **Gradual**: Can be adopted incrementally

## Troubleshooting

### Common Issues

1. **Duplicate slugs after migration**
   ```bash
   ./scripts/manage-slugs.sh duplicates
   ./scripts/manage-slugs.sh regenerate --table affected_table
   ```

2. **Missing slugs for new records**
   - Check that triggers are active
   - Verify source fields (name/title) are not empty

3. **Performance issues**
   - Ensure indexes exist: `\d+ table_name` in psql
   - Check query plans for slug-based lookups

### Verification

After migration, verify everything works:

```bash
# Check migration status
./scripts/manage-slugs.sh check

# Run tests
./scripts/manage-slugs.sh test

# Check for duplicates
./scripts/manage-slugs.sh duplicates
```

## Future Enhancements

Potential improvements:
1. **Slug history**: Track old slugs for redirects
2. **Custom slugs**: Allow manual slug override
3. **Slug validation**: Additional format restrictions
4. **Bulk operations**: Mass slug updates via admin interface
5. **Analytics**: Track slug usage and performance

## Maintenance

Regular maintenance tasks:
1. **Monitor duplicates**: Run duplicate check monthly
2. **Performance review**: Check slug query performance
3. **Data integrity**: Verify all records have valid slugs
4. **Index maintenance**: Reindex if necessary