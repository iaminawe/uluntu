/**
 * Type definitions for useGroupQueries hooks
 * Defines proper TypeScript interfaces for all group-related data structures
 */

/**
 * Member information included in activities and invitations
 */
export interface MemberInfo {
  id: string;
  name: string;
  title?: string;
  avatar_url?: string;
  image?: string;
}

/**
 * Group Activity - tracks actions within a group
 *
 * @example
 * ```typescript
 * const activity: GroupActivity = {
 *   id: '123',
 *   group_id: 'group-123',
 *   actor_id: 'member-456',
 *   action: 'post_created',
 *   target_type: 'group_posts',
 *   target_id: 'post-789',
 *   metadata: { post_title: 'Hello World' },
 *   created_at: '2024-01-15T10:00:00Z',
 *   actor: { id: 'member-456', name: 'John Doe', title: 'Developer' }
 * };
 * ```
 */
export interface GroupActivity {
  id: string;
  group_id: string;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  actor?: MemberInfo;
}

/**
 * Group Announcement - important messages for group members
 * Can be sourced from group_posts with type='announcement'
 *
 * @example
 * ```typescript
 * const announcement: GroupAnnouncement = {
 *   id: 'announce-123',
 *   group_id: 'group-123',
 *   title: 'Group Update',
 *   content: 'Important announcement content',
 *   priority: 'high',
 *   author_id: 'member-456',
 *   created_at: '2024-01-15T10:00:00Z',
 *   expires_at: '2024-02-15T10:00:00Z'
 * };
 * ```
 */
export interface GroupAnnouncement {
  id: string;
  group_id: string;
  title?: string | null;
  content: string;
  content_html?: string | null;
  priority?: 'normal' | 'high' | 'urgent';
  author_id: string;
  created_at: string;
  updated_at?: string | null;
  expires_at?: string | null;
  status?: 'published' | 'draft' | 'archived';
  is_pinned?: boolean;
  metadata?: Record<string, any> | null;
}

/**
 * Group Invitation - invites to join a group
 *
 * @example
 * ```typescript
 * const invitation: GroupInvitation = {
 *   id: 'inv-123',
 *   group_id: 'group-123',
 *   invited_email: 'user@example.com',
 *   role: 'member',
 *   status: 'pending',
 *   token: 'secure-token-123',
 *   created_at: '2024-01-15T10:00:00Z',
 *   invited_by: 'member-456',
 *   message: 'Welcome to our group!'
 * };
 * ```
 */
export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_email?: string | null;
  invited_member_id?: string | null;
  invited_by: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  message?: string | null;
  created_at: string;
  expires_at?: string | null;
  accepted_at?: string | null;
  // Populated from joins
  invited_by_member?: MemberInfo;
  invited_member?: MemberInfo;
  group?: {
    id: string;
    name: string;
    description?: string;
    visibility: string;
  };
}

/**
 * Group Resource - shared files, links, and materials
 *
 * @example
 * ```typescript
 * const resource: GroupResource = {
 *   id: 'res-123',
 *   group_id: 'group-123',
 *   title: 'Getting Started Guide',
 *   description: 'A comprehensive guide for new members',
 *   url: 'https://example.com/guide.pdf',
 *   type: 'document',
 *   category: 'onboarding',
 *   tags: ['guide', 'beginners'],
 *   created_at: '2024-01-15T10:00:00Z',
 *   status: 'published'
 * };
 * ```
 */
export interface GroupResource {
  id: string;
  group_id: string;
  title: string;
  description?: string | null;
  url: string;
  type: 'link' | 'document' | 'video' | 'image' | 'other';
  category?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at?: string | null;
  status?: 'published' | 'draft' | 'archived';
  featured?: boolean;
  author_id?: string;
}

/**
 * Group Post - discussions, updates, and content shared in a group
 *
 * @example
 * ```typescript
 * const post: GroupPost = {
 *   id: 'post-123',
 *   group_id: 'group-123',
 *   title: 'Welcome to the Group',
 *   content: 'Excited to be part of this community!',
 *   author_id: 'member-456',
 *   type: 'post',
 *   status: 'published',
 *   created_at: '2024-01-15T10:00:00Z',
 *   vote_count: 10,
 *   reply_count: 5
 * };
 * ```
 */
export interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  title?: string | null;
  content: string;
  content_html?: string | null;
  type: 'post' | 'announcement' | 'discussion' | 'poll' | 'event';
  status: 'published' | 'draft' | 'archived';
  parent_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  published_at?: string | null;
  edited_at?: string | null;
  is_pinned?: boolean;
  vote_count?: number;
  reply_count?: number;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  // Populated from joins
  author?: MemberInfo;
  replies?: GroupPost[];
  post?: {
    id: string;
    title?: string | null;
    content: string;
    author_id: string;
    created_at: string;
    updated_at?: string | null;
  };
}

/**
 * Activity Input for creating new activities
 */
export interface GroupActivityInput {
  group_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Announcement Input for creating new announcements
 */
export interface GroupAnnouncementInput {
  group_id: string;
  title?: string;
  content: string;
  content_html?: string;
  priority?: 'normal' | 'high' | 'urgent';
  expires_at?: string;
  metadata?: Record<string, any>;
}

/**
 * Invitation with extended details for display
 */
export interface GroupInvitationWithDetails extends GroupInvitation {
  group_name?: string;
  group_description?: string;
  inviter_name?: string;
  inviter_image?: string;
}

/**
 * Data for creating a new group invitation
 */
export interface CreateInvitationData {
  invited_email?: string;
  invited_member_id?: string;
  role?: 'admin' | 'moderator' | 'member';
  message?: string;
}
