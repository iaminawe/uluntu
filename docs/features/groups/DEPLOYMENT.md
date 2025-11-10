# Groups Feature Deployment Guide

## Quick Start

This guide walks you through deploying the new Groups functionality to your Nelson Tech application.

## Prerequisites

- [ ] Supabase project with admin access
- [ ] Node.js 18+ installed
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Database backup created
- [ ] Git repository up to date

## Step 1: Database Migration

### 1.1 Backup Your Database

```bash
# Create a backup before migration
npx supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 1.2 Review Migration File

The migration file is located at:
```
/supabase/migrations/20250820210000_fix_groups_complete_functionality.sql
```

This migration will:
- Add missing columns to `groups` and `group_members` tables
- Create new tables: `group_posts`, `group_invitations`, `group_activities`
- Fix RLS policies to prevent infinite recursion
- Add performance indexes
- Create utility functions for group management

### 1.3 Apply Migration

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Apply the migration
npx supabase db push

# Verify migration success
npx supabase db status
```

### 1.4 Verify Database Changes

Connect to your database and run:

```sql
-- Check new tables exist
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('group_posts', 'group_invitations', 'group_activities');
-- Should return 3

-- Check groups table updates
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'groups'
AND column_name IN ('created_by', 'updated_at', 'max_members', 'member_count');
-- Should return 4 rows

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('join_group', 'leave_group', 'change_member_role', 'accept_invitation');
-- Should return 4 rows
```

## Step 2: Frontend Deployment

### 2.1 Install Dependencies

```bash
# Install any new dependencies
npm install

# Clean install (if needed)
rm -rf node_modules package-lock.json
npm install
```

### 2.2 Build the Application

```bash
# Run type checking
npm run typecheck

# Run tests
npm run test

# Build for production
npm run build

# Check build output
ls -la dist/
```

### 2.3 Environment Variables

Ensure these are set in your production environment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Feature Configuration

### 3.1 Email Notifications (Optional)

To enable email notifications for group activities:

1. Configure SMTP in Supabase Dashboard:
   - Go to Settings → Email
   - Enable custom SMTP
   - Add your SMTP credentials

2. Create email templates in Supabase:
   ```sql
   -- Example: Group invitation email template
   INSERT INTO auth.email_templates (type, subject, body)
   VALUES (
     'group_invitation',
     'You''ve been invited to join {{group_name}}',
     'Click here to accept: {{invitation_link}}'
   );
   ```

### 3.2 Feature Flags (Optional)

Control feature rollout with flags:

```typescript
// In your app configuration
const FEATURE_FLAGS = {
  GROUPS_ENABLED: true,
  GROUPS_POSTS_ENABLED: true,
  GROUPS_INVITATIONS_ENABLED: true,
  GROUPS_ADMIN_PANEL_ENABLED: true
};
```

## Step 4: Testing

### 4.1 Run E2E Tests

```bash
# Run all group tests
npm run test:e2e -- --grep "groups"

# Run specific test suites
npm run test:e2e -- tests/e2e/groups-crud.spec.ts
npm run test:e2e -- tests/e2e/groups-membership.spec.ts
npm run test:e2e -- tests/e2e/groups-posts.spec.ts
```

### 4.2 Manual Testing Checklist

#### Basic Functionality
- [ ] Create a new group
- [ ] Edit group settings
- [ ] Delete a group
- [ ] View group list
- [ ] Search/filter groups

#### Membership
- [ ] Join an open group
- [ ] Leave a group
- [ ] Invite members
- [ ] Accept invitation
- [ ] Change member roles
- [ ] Remove members

#### Content
- [ ] Create a post
- [ ] Reply to posts
- [ ] Create announcement
- [ ] Pin/unpin posts
- [ ] Delete posts

#### Admin Panel
- [ ] Access admin panel as group admin
- [ ] View member list
- [ ] Manage invitations
- [ ] View activity log
- [ ] Update group settings

### 4.3 Performance Testing

```bash
# Check bundle size
npm run build -- --analyze

# Run lighthouse audit
npx lighthouse http://localhost:5173/groups --view

# Database query performance
# Check slow queries in Supabase Dashboard → Database → Query Performance
```

## Step 5: Production Deployment

### 5.1 Deploy Frontend

#### Vercel
```bash
vercel --prod
```

#### Netlify
```bash
netlify deploy --prod
```

#### Custom Server
```bash
# Copy dist files to server
scp -r dist/* user@server:/var/www/html/

# Or use CI/CD pipeline
git push origin main
```

### 5.2 Monitor Deployment

1. **Check Application Logs:**
   ```bash
   # View recent logs
   npm run logs:prod
   ```

2. **Monitor Database:**
   - Check Supabase Dashboard → Database → Performance
   - Monitor RLS policy execution times
   - Watch for any failed queries

3. **User Feedback:**
   - Monitor error reporting service
   - Check user feedback channels
   - Watch for support tickets

## Step 6: Post-Deployment

### 6.1 Data Migration (If Needed)

If you have existing groups data to migrate:

```sql
-- Update existing groups with new required fields
UPDATE groups 
SET 
  created_by = (SELECT id FROM members LIMIT 1),
  member_count = (SELECT COUNT(*) FROM group_members WHERE group_id = groups.id),
  max_members = 100
WHERE created_by IS NULL;

-- Set joined_at for existing members
UPDATE group_members 
SET joined_at = created_at 
WHERE joined_at IS NULL;
```

### 6.2 Enable Features Gradually

```typescript
// Progressive rollout
const ROLLOUT_PERCENTAGE = 10; // Start with 10% of users

function isFeatureEnabled(userId: string): boolean {
  const hash = hashCode(userId);
  return (hash % 100) < ROLLOUT_PERCENTAGE;
}
```

### 6.3 Monitor Metrics

Key metrics to track:
- Group creation rate
- Member join/leave rate
- Post creation rate
- Error rates
- Page load times
- Database query times

## Rollback Plan

If issues arise, follow this rollback procedure:

### 1. Immediate Rollback

```bash
# Revert frontend
git revert HEAD
npm run build
npm run deploy

# Disable features via flags
UPDATE app_config 
SET value = 'false' 
WHERE key = 'groups_enabled';
```

### 2. Database Rollback

```sql
-- Save current data
CREATE TABLE groups_backup AS SELECT * FROM groups;
CREATE TABLE group_members_backup AS SELECT * FROM group_members;

-- Restore from backup
psql -U postgres -d your_database < backup_20241220_120000.sql

-- Or selectively revert changes
ALTER TABLE groups DROP COLUMN IF EXISTS created_by;
ALTER TABLE groups DROP COLUMN IF EXISTS updated_at;
-- etc...
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Migration Fails

**Error:** "Invalid access token format"
```bash
# Solution: Re-authenticate
npx supabase login
npx supabase link --project-ref your-project-ref
```

**Error:** "Column already exists"
```sql
-- Solution: Migration already partially applied
-- Check existing structure and apply only missing parts
```

#### 2. Build Errors

**Error:** "Cannot find module '@/lib/api/groups/memberManagement'"
```bash
# Solution: Ensure files are in correct location
ls -la src/lib/api/groups/
# Files should be there
```

#### 3. Runtime Errors

**Error:** "RLS policy violation"
```sql
-- Solution: Check user authentication
SELECT auth.uid();
-- Ensure user has proper member record
SELECT * FROM members WHERE user_id = auth.uid();
```

#### 4. Performance Issues

**Slow group queries:**
```sql
-- Check indexes
EXPLAIN ANALYZE SELECT * FROM groups WHERE visibility = 'open';
-- Add missing indexes if needed
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON groups(visibility);
```

## Support Resources

- **Documentation:** `/docs/GROUPS_API_DOCUMENTATION.md`
- **API Reference:** Check TypeScript interfaces in `/src/features/groups/types`
- **Database Schema:** `/supabase/migrations/20250820210000_fix_groups_complete_functionality.sql`
- **Test Examples:** `/tests/e2e/groups-*.spec.ts`

## Monitoring Checklist

Post-deployment monitoring for the first 24-48 hours:

- [ ] No increase in error rates
- [ ] Database performance stable
- [ ] No RLS policy errors
- [ ] User engagement metrics positive
- [ ] No critical bug reports
- [ ] API response times normal
- [ ] Database connections stable
- [ ] No memory leaks detected

## Success Criteria

The deployment is considered successful when:

1. ✅ All tests pass
2. ✅ No critical errors in production
3. ✅ Performance metrics within acceptable range
4. ✅ Users can successfully:
   - Create and manage groups
   - Join and leave groups
   - Post and interact with content
   - Use admin features
5. ✅ Database queries perform efficiently
6. ✅ No security vulnerabilities detected

## Next Steps

After successful deployment:

1. **Gather Feedback:** Survey early adopters
2. **Monitor Analytics:** Track feature usage
3. **Iterate:** Plan improvements based on feedback
4. **Document:** Update user guides
5. **Scale:** Optimize for increased usage

---

**Deployment Checklist Summary:**

- [ ] Database backed up
- [ ] Migration applied successfully
- [ ] Frontend built without errors
- [ ] Tests passing
- [ ] Environment variables configured
- [ ] Deployed to production
- [ ] Features verified working
- [ ] Monitoring enabled
- [ ] Rollback plan ready
- [ ] Team notified

---

*Last Updated: December 2024*
*Version: 1.0.0*