# Groups API Documentation

## Overview

The Groups feature provides comprehensive functionality for creating and managing community groups with members, posts, discussions, and activities. This documentation covers all available APIs, database schema, and integration guidelines.

## Table of Contents

1. [Database Schema](#database-schema)
2. [API Endpoints](#api-endpoints)
3. [Authentication & Permissions](#authentication--permissions)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)
6. [Migration Guide](#migration-guide)

## Database Schema

### Core Tables

#### `groups`
Primary table for group information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Group name |
| slug | TEXT | URL-friendly identifier |
| description | TEXT | Short description |
| long_description | TEXT | Detailed description |
| image_url | TEXT | Group avatar/logo |
| hero_image | TEXT | Banner image |
| cover_image | TEXT | Cover image |
| visibility | TEXT | `open`, `closed`, `secret` |
| status | TEXT | `published`, `draft`, `archived` |
| created_by | UUID | Reference to members.id |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| max_members | INTEGER | Maximum member limit |
| member_count | INTEGER | Current member count |
| settings | JSONB | Group configuration |
| tags | TEXT[] | Group tags |
| is_featured | BOOLEAN | Featured group flag |

#### `group_members`
Manages group membership relationships.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Reference to groups.id |
| member_id | UUID | Reference to members.id |
| role | TEXT | `admin`, `moderator`, `member` |
| status | TEXT | `active`, `inactive`, `pending`, `banned` |
| created_at | TIMESTAMPTZ | Membership creation |
| joined_at | TIMESTAMPTZ | When member joined |
| left_at | TIMESTAMPTZ | When member left |
| invited_by | UUID | Who invited this member |
| ban_reason | TEXT | Reason for ban (if applicable) |
| permissions | JSONB | Custom permissions |

#### `group_posts`
Group discussions and announcements.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Reference to groups.id |
| author_id | UUID | Reference to members.id |
| parent_id | UUID | Reference to parent post (replies) |
| title | TEXT | Post title |
| content | TEXT | Post content |
| content_html | TEXT | Formatted content |
| type | TEXT | `post`, `announcement`, `discussion`, `poll`, `event` |
| status | TEXT | `published`, `draft`, `archived`, `deleted` |
| is_pinned | BOOLEAN | Pinned to top |
| is_locked | BOOLEAN | Locked for replies |
| vote_count | INTEGER | Upvotes/downvotes |
| reply_count | INTEGER | Number of replies |
| view_count | INTEGER | View counter |
| tags | TEXT[] | Post tags |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMPTZ | Creation timestamp |
| published_at | TIMESTAMPTZ | Publication timestamp |

#### `group_invitations`
Invitation management system.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Reference to groups.id |
| invited_by | UUID | Who created invitation |
| invited_email | TEXT | Email address |
| invited_member_id | UUID | Specific member (optional) |
| token | TEXT | Unique invitation token |
| role | TEXT | Role upon acceptance |
| status | TEXT | `pending`, `accepted`, `declined`, `expired`, `cancelled` |
| message | TEXT | Personal message |
| expires_at | TIMESTAMPTZ | Expiration date |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `group_activities`
Activity feed and audit log.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Reference to groups.id |
| actor_id | UUID | Who performed action |
| action | TEXT | Action type (see below) |
| target_type | TEXT | Type of target |
| target_id | UUID | ID of target |
| metadata | JSONB | Additional context |
| created_at | TIMESTAMPTZ | When action occurred |

**Action Types:**
- `member_joined`, `member_left`, `member_invited`, `member_removed`, `member_banned`
- `role_changed`, `post_created`, `post_deleted`, `announcement_created`
- `event_created`, `event_updated`, `resource_added`, `settings_updated`
- `group_created`, `group_updated`, `group_archived`

## API Endpoints

### Groups API (`/src/features/groups/api/groupsApi.ts`)

#### Core CRUD Operations

```typescript
// Get all groups
await groupsApi.getAll(filters?: {
  search?: string;
  visibility?: string | string[];
  featured?: boolean;
  userGroups?: boolean;
  userId?: string;
  limit?: number;
});

// Get single group by ID or slug
await groupsApi.getById(identifier: string);

// Create new group
await groupsApi.create({
  name: string;
  slug?: string;
  description: string;
  longDescription?: string;
  heroImage?: string;
  coverImage?: string;
  visibility: 'open' | 'closed' | 'secret';
  status?: string;
  featured?: boolean;
});

// Update group
await groupsApi.update(id: string, groupData: Partial<GroupInput>);

// Delete group
await groupsApi.delete(id: string);
```

#### Membership Management

```typescript
// Join a group
await groupsApi.joinGroup(groupId: string, userId: string);

// Leave a group
await groupsApi.leaveGroup(groupId: string, userId: string);

// Check membership
await groupsApi.isMember(groupId: string, userId: string);

// Get member role
await groupsApi.getMemberRole(groupId: string, userId: string);

// Update member role
await groupsApi.updateMemberRole(
  groupId: string,
  memberId: string,
  role: 'admin' | 'moderator' | 'member'
);

// Remove member
await groupsApi.removeMember(groupId: string, memberId: string);

// Get group members with pagination
await groupsApi.getGroupMembers(groupId: string);
```

#### Invitations

```typescript
// Create invitation
await groupsApi.createInvitation(groupId: string, {
  invited_email?: string;
  invited_member_id?: string;
  role?: 'admin' | 'moderator' | 'member';
  message?: string;
});

// Accept invitation
await groupsApi.acceptInvitation(token: string);

// Get user's invitations
await groupsApi.getUserInvitations(userId: string);
```

#### Content Management

```typescript
// Get group posts
await groupsApi.getGroupPosts(groupId: string);

// Create post
await groupsApi.createPost(groupId: string, {
  title?: string;
  content: string;
  content_html?: string;
  type?: 'post' | 'announcement' | 'discussion';
  tags?: string[];
});

// Get group activities
await groupsApi.getGroupActivities(groupId: string);

// Get group events
await groupsApi.getGroupEvents(groupId: string);

// Get group resources
await groupsApi.getGroupResources(groupId: string);
```

### Member Management API (`/src/lib/api/groups/memberManagement.ts`)

```typescript
import { groupMemberManagementApi } from '@/lib/api/groups/memberManagement';

// Get members with advanced filtering
const { members, total } = await groupMemberManagementApi.getGroupMembers(
  groupId,
  {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }
);

// Ban a member
await groupMemberManagementApi.banMember(
  groupId: string,
  memberId: string,
  reason?: string
);

// Get group invitations
await groupMemberManagementApi.getGroupInvitations(groupId: string);

// Cancel invitation
await groupMemberManagementApi.cancelInvitation(invitationId: string);

// Transfer ownership
await groupMemberManagementApi.transferOwnership(
  groupId: string,
  newOwnerId: string
);
```

### Posts API (`/src/lib/api/groups/postsApi.ts`)

```typescript
import { groupPostsApi } from '@/lib/api/groups/postsApi';

// Get posts with filtering
const { posts, total } = await groupPostsApi.getGroupPosts(groupId, {
  type?: string;
  status?: string;
  author_id?: string;
  parent_id?: string | null;
  is_pinned?: boolean;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'updated_at' | 'vote_count' | 'reply_count';
  order?: 'asc' | 'desc';
});

// Get single post with replies
await groupPostsApi.getPost(postId: string);

// Update post
await groupPostsApi.updatePost(postId: string, {
  title?: string;
  content?: string;
  content_html?: string;
  tags?: string[];
});

// Delete post (soft delete)
await groupPostsApi.deletePost(postId: string);

// Pin/unpin post
await groupPostsApi.togglePinPost(postId: string, isPinned: boolean);

// Lock/unlock post
await groupPostsApi.toggleLockPost(postId: string, isLocked: boolean);

// Vote on post
await groupPostsApi.votePost(postId: string, voteType: 'up' | 'down');

// Create announcement
await groupPostsApi.createAnnouncement(
  groupId: string,
  title: string,
  content: string,
  isPinned?: boolean
);

// Search posts across groups
const { posts, total } = await groupPostsApi.searchPosts(query: string, {
  group_ids?: string[];
  type?: string;
  page?: number;
  limit?: number;
});
```

## Authentication & Permissions

### RLS Policies

The system implements Row Level Security (RLS) policies for all tables:

1. **Groups Visibility:**
   - Public groups: Viewable by everyone
   - Secret groups: Only visible to members
   - Group creators can update/delete their groups

2. **Member Management:**
   - Anyone can view members of public groups
   - Only members can view members of secret groups
   - Users can join open groups
   - Group admins can manage all members

3. **Posts Permissions:**
   - Public group posts visible to all
   - Members can create posts in their groups
   - Authors can update their posts
   - Authors and admins can delete posts

### Role Hierarchy

1. **Admin:** Full control over group
   - Manage settings
   - Manage members
   - Delete any content
   - Create announcements

2. **Moderator:** Content management
   - Moderate posts
   - Pin/lock posts
   - Remove inappropriate content

3. **Member:** Basic participation
   - Create posts
   - Reply to discussions
   - View group content

## Usage Examples

### Creating a Group with Initial Members

```typescript
// Create the group
const group = await groupsApi.create({
  name: 'Tech Innovators',
  slug: 'tech-innovators',
  description: 'A community for tech enthusiasts',
  visibility: 'open',
  status: 'published'
});

// Invite initial members
if (group) {
  const inviteToken = await groupsApi.createInvitation(group.id, {
    invited_email: 'member@example.com',
    role: 'moderator',
    message: 'Join us as a moderator!'
  });
  
  // Share invitation link
  const inviteUrl = `${window.location.origin}/groups/invite/${inviteToken}`;
}
```

### Managing Group Posts

```typescript
// Create an announcement
const announcement = await groupPostsApi.createAnnouncement(
  groupId,
  'Important Update',
  'We have exciting news to share...',
  true // Pin to top
);

// Create a discussion thread
const discussion = await groupPostsApi.createPost({
  group_id: groupId,
  title: 'What are your thoughts on AI?',
  content: 'Let\'s discuss the future of AI...',
  type: 'discussion',
  tags: ['ai', 'technology', 'future']
});

// Reply to the discussion
if (discussion) {
  await groupPostsApi.createPost({
    group_id: groupId,
    parent_id: discussion.id,
    content: 'I think AI will revolutionize...',
    type: 'post'
  });
}
```

### Admin Panel Integration

```typescript
import GroupAdminPanel from '@/components/Groups/GroupAdminPanel';

// In your component
<GroupAdminPanel
  groupId={group.id}
  groupName={group.name}
  currentUserId={currentUser.id}
/>
```

## Error Handling

All API methods include comprehensive error handling:

```typescript
try {
  const result = await groupsApi.joinGroup(groupId, userId);
  if (result) {
    // Success
  } else {
    // Handle failure
  }
} catch (error) {
  console.error('Error joining group:', error);
  // Show user-friendly error message
}
```

Common error scenarios:
- Group not found
- Insufficient permissions
- Member limit reached
- Invalid invitation token
- Network failures

## Migration Guide

### Applying the Database Migration

1. **Prerequisites:**
   - Supabase CLI installed
   - Valid Supabase credentials
   - Database backup created

2. **Apply Migration:**
   ```bash
   # Set up environment
   export SUPABASE_URL=your-project-url
   export SUPABASE_ANON_KEY=your-anon-key
   
   # Apply the migration
   npx supabase db push
   ```

3. **Verify Migration:**
   ```sql
   -- Check new tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('group_posts', 'group_invitations', 'group_activities');
   
   -- Check updated columns
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = 'groups'
   AND column_name IN ('created_by', 'updated_at', 'max_members');
   ```

### Frontend Integration

1. **Update imports:**
   ```typescript
   import { groupsApi } from '@/features/groups/api/groupsApi';
   import { groupMemberManagementApi } from '@/lib/api/groups/memberManagement';
   import { groupPostsApi } from '@/lib/api/groups/postsApi';
   ```

2. **Add admin panel to group pages:**
   ```typescript
   import GroupAdminPanel from '@/components/Groups/GroupAdminPanel';
   import GroupMemberInvite from '@/components/Groups/GroupMemberInvite';
   ```

3. **Update TypeScript types:**
   - All IDs should be `string` (UUID)
   - Visibility: `'open' | 'closed' | 'secret'`
   - Roles: `'admin' | 'moderator' | 'member'`

## Testing

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
# Run all group tests
npm run test:e2e -- groups

# Specific test suites
npm run test:e2e -- groups-crud
npm run test:e2e -- groups-membership
npm run test:e2e -- groups-posts
```

### Manual Testing Checklist

- [ ] Create group with all visibility types
- [ ] Join/leave groups
- [ ] Invite members via email
- [ ] Accept/decline invitations
- [ ] Change member roles
- [ ] Create posts and announcements
- [ ] Reply to discussions
- [ ] Pin/lock posts
- [ ] View activity feed
- [ ] Admin panel functionality
- [ ] Search across groups

## Performance Considerations

1. **Indexes:** All foreign keys and commonly queried fields are indexed
2. **Pagination:** Use pagination for member lists and posts
3. **Caching:** Consider implementing React Query for caching
4. **Batch Operations:** Use database functions for complex operations
5. **Lazy Loading:** Load group content on demand

## Security Best Practices

1. **Always validate permissions server-side**
2. **Use RLS policies for data access control**
3. **Sanitize user input, especially HTML content**
4. **Rate limit API calls to prevent abuse**
5. **Log all administrative actions**
6. **Validate invitation tokens before acceptance**
7. **Implement proper CSRF protection**

## Support & Troubleshooting

### Common Issues

1. **"Infinite recursion" error:**
   - Check RLS policies
   - Ensure migration was applied correctly

2. **"Member not found" error:**
   - Verify user has a member profile
   - Check user_id vs member_id mapping

3. **"Cannot join group" error:**
   - Check group visibility settings
   - Verify member limits
   - Check existing membership

### Debug Mode

Enable debug logging:
```typescript
// In development
localStorage.setItem('DEBUG_GROUPS', 'true');
```

### Contact

For issues or questions:
- GitHub Issues: [Project Repository]
- Documentation: This document
- Migration Support: Check migration logs

---

## Appendix

### Database Functions

The migration includes several utility functions:

- `join_group(group_id, member_id, role)` - Safely join a group
- `leave_group(group_id, member_id)` - Leave a group
- `change_member_role(group_id, member_id, new_role, changed_by)` - Update role
- `accept_invitation(token, member_id)` - Accept invitation
- `update_updated_at_column()` - Trigger function for timestamps

### Future Enhancements

Planned features for future releases:

1. **Group Categories** - Organize groups by type
2. **Private Messaging** - Direct messages between members
3. **File Sharing** - Upload and share documents
4. **Event Calendar** - Integrated event management
5. **Notification System** - Email and push notifications
6. **Analytics Dashboard** - Group insights and metrics
7. **Moderation Queue** - Content review workflow
8. **Integration APIs** - Third-party service connections

---

*Last Updated: December 2024*
*Version: 1.0.0*