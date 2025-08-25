# Social Media Platform Specification

## Executive Summary

This document outlines the comprehensive specification for implementing a standalone social media platform within the Nelson Tech community system. The platform is designed to be fully functional independently, with optional federation capabilities through AT Protocol (Bluesky) and ActivityPub (Mastodon) that can be enabled as progressive enhancements.

## Core Design Principles

1. **Standalone First**: The system must be fully functional without any external protocol dependencies
2. **Progressive Enhancement**: Federation capabilities are optional add-ons that enhance but don't define the core functionality
3. **Existing Infrastructure Reuse**: Leverage current gallery, messaging, and member systems
4. **Privacy by Design**: Granular privacy controls at every level
5. **Community-Centric**: Features designed specifically for professional tech communities

## System Architecture

### Database Schema

```sql
-- Core social posts table
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_html TEXT, -- Sanitized HTML version
  reply_to_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  thread_root_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  media_attachments JSONB DEFAULT '[]'::jsonb,
  video_embeds JSONB DEFAULT '[]'::jsonb,
  visibility VARCHAR(20) DEFAULT 'public',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edit_history JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{"likes": 0, "reposts": 0, "replies": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_social_posts_author ON social_posts(author_id);
CREATE INDEX idx_social_posts_thread_root ON social_posts(thread_root_id);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX idx_social_posts_visibility ON social_posts(visibility);

-- Social interactions
CREATE TABLE social_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE social_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Following relationships
CREATE TABLE social_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES members(id) ON DELETE CASCADE,
  following_id UUID REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- active, pending, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Hashtags
CREATE TABLE social_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag VARCHAR(100) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_post_hashtags (
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  hashtag_id UUID REFERENCES social_hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

-- Mentions
CREATE TABLE social_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed caching
CREATE TABLE social_feed_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  feed_type VARCHAR(50) NOT NULL,
  post_ids UUID[] NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

-- Federation mapping (optional)
CREATE TABLE social_federation_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  protocol VARCHAR(50) NOT NULL, -- 'atprotocol', 'activitypub'
  external_id TEXT NOT NULL,
  handle TEXT,
  instance_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, protocol)
);
```

### API Structure

```typescript
// Core API endpoints
interface SocialAPI {
  // Posts
  createPost(data: CreatePostData): Promise<SocialPost>;
  updatePost(id: string, data: UpdatePostData): Promise<SocialPost>;
  deletePost(id: string): Promise<void>;
  getPost(id: string): Promise<SocialPost>;
  
  // Feeds
  getHomeFeed(options: FeedOptions): Promise<FeedResponse>;
  getCommunityFeed(options: FeedOptions): Promise<FeedResponse>;
  getTrendingFeed(options: FeedOptions): Promise<FeedResponse>;
  getUserTimeline(userId: string, options: FeedOptions): Promise<FeedResponse>;
  
  // Interactions
  likePost(postId: string): Promise<void>;
  unlikePost(postId: string): Promise<void>;
  repostPost(postId: string, comment?: string): Promise<void>;
  unrepostPost(postId: string): Promise<void>;
  
  // Social Graph
  followUser(userId: string): Promise<void>;
  unfollowUser(userId: string): Promise<void>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  
  // Search
  searchPosts(query: string, filters: SearchFilters): Promise<SocialPost[]>;
  searchHashtags(query: string): Promise<Hashtag[]>;
  searchUsers(query: string): Promise<User[]>;
}
```

## Feature Specifications

### 1. Post Creation and Management

#### 1.1 Post Composer
- **Rich Text Editor**: Utilize existing BlockNote editor
- **Character Limit**: Configurable (default 500 characters)
- **Media Attachments**: 
  - Up to 4 images per post
  - Images processed through existing gallery system
  - Automatic thumbnail generation
- **Video Embeds**:
  - YouTube and Vimeo URL detection
  - Automatic embed preview generation
  - Responsive player integration
- **Mentions**: @ symbol triggers user autocomplete
- **Hashtags**: # symbol creates/links hashtags
- **Visibility Options**:
  - Public: Visible to all
  - Members: Community members only
  - Followers: Only followers can see

#### 1.2 Post Types
- **Standard Post**: Text with optional media
- **Reply**: Response to another post
- **Quote Post**: Repost with commentary
- **Thread**: Connected series of posts

### 2. Threading and Conversations

#### 2.1 Thread Structure
- **Root Post**: Original post that starts the thread
- **Parent Post**: Direct post being replied to
- **Thread View**: Hierarchical display of conversation
- **Thread Controls**: 
  - Limit who can reply
  - Lock threads
  - Pin important replies

#### 2.2 Conversation Features
- **Nested Replies**: Up to 5 levels deep
- **Conversation Muting**: Stop notifications from thread
- **Thread Bookmarking**: Save important conversations

### 3. Social Graph and Following

#### 3.1 Following System
- **Follow/Unfollow**: One-click following
- **Follow Requests**: For private accounts
- **Follow Suggestions**: Based on:
  - Mutual connections
  - Company associations
  - Shared interests/topics
  - Group memberships

#### 3.2 Privacy Controls
- **Private Accounts**: Approve followers
- **Block Users**: Prevent all interactions
- **Mute Users**: Hide posts without unfollowing

### 4. Activity Feeds

#### 4.1 Feed Types

**Home Feed**
- Posts from followed users
- Chronological with algorithmic boost for engagement
- Real-time updates via WebSocket

**Community Feed**
- All public posts from community members
- Filterable by topics/tags
- Highlights from verified members

**Trending Feed**
- Most engaged posts (24h/7d/30d windows)
- Weighted by likes, reposts, replies
- Decay algorithm prevents stale content

**Company Feed**
- Posts from company-associated members
- Company announcements
- Job opportunities integration

#### 4.2 Feed Algorithm

```typescript
interface FeedAlgorithm {
  // Base scoring
  calculateRelevance(post: SocialPost, user: User): number {
    let score = 0;
    
    // Recency (exponential decay)
    const ageHours = (Date.now() - post.createdAt) / (1000 * 60 * 60);
    score += Math.exp(-ageHours / 24) * 100;
    
    // Engagement metrics
    score += post.likes * 2;
    score += post.reposts * 3;
    score += post.replies * 1.5;
    
    // Relationship factors
    if (user.following.includes(post.authorId)) score += 50;
    if (user.company === post.authorCompany) score += 30;
    if (hasSharedGroups(user, post.author)) score += 20;
    
    // Content relevance
    if (matchesUserInterests(post, user)) score += 40;
    
    return score;
  }
}
```

### 5. Media Handling

#### 5.1 Photo Management
- **Upload Limits**: Max 10MB per image
- **Processing Pipeline**:
  - Resize to standard dimensions
  - Generate thumbnails
  - Apply compression
  - Store in existing gallery system
- **Supported Formats**: JPEG, PNG, WebP, GIF

#### 5.2 Video Embeds
- **Supported Platforms**:
  - YouTube (standard, shorts, live)
  - Vimeo (standard, showcases)
- **Embed Features**:
  - Automatic thumbnail extraction
  - Privacy-respecting embed (no cookies)
  - Responsive sizing
  - Lazy loading for performance

### 6. Notifications

#### 6.1 Notification Types
- **Social Interactions**:
  - New follower
  - Post liked
  - Post reposted
  - Reply to your post
  - Mentioned in post
- **System Notifications**:
  - Trending post
  - Follower milestone
  - Community achievements

#### 6.2 Delivery Channels
- **In-App**: Real-time badge updates
- **Email**: Digest options (instant/daily/weekly)
- **Push**: Mobile app notifications (future)

### 7. Search and Discovery

#### 7.1 Search Features
- **Full-Text Search**: Posts, comments
- **Hashtag Search**: Trending and historical
- **User Search**: By name, handle, bio
- **Advanced Filters**:
  - Date ranges
  - Media type
  - Engagement thresholds
  - Author filters

#### 7.2 Discovery Features
- **Trending Hashtags**: Real-time trending topics
- **Suggested Users**: AI-powered recommendations
- **Content Discovery**: Similar posts based on engagement

## Optional Federation Layer

### Federation Adapter Pattern

```typescript
// Abstract federation interface
interface FederationAdapter {
  readonly protocol: 'atprotocol' | 'activitypub';
  readonly isEnabled: boolean;
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  
  // Content synchronization
  publishPost(post: SocialPost): Promise<string>;
  updatePost(post: SocialPost): Promise<void>;
  deletePost(postId: string): Promise<void>;
  
  // Social graph sync
  syncFollowers(): Promise<FederatedUser[]>;
  followUser(externalId: string): Promise<void>;
  unfollowUser(externalId: string): Promise<void>;
  
  // Incoming content
  subscribeToUpdates(callback: (update: FederatedUpdate) => void): void;
  fetchUserTimeline(externalId: string): Promise<FederatedPost[]>;
}

// AT Protocol implementation
class ATProtocolAdapter implements FederationAdapter {
  readonly protocol = 'atprotocol';
  
  async publishPost(post: SocialPost): Promise<string> {
    if (!this.isEnabled) return post.id;
    
    // Transform to AT Protocol format
    const atProtoPost = {
      $type: 'app.bsky.feed.post',
      text: post.content,
      createdAt: post.createdAt,
      reply: post.replyTo ? {
        root: { uri: post.threadRootId },
        parent: { uri: post.replyToId }
      } : undefined
    };
    
    // Publish to AT Protocol network
    const response = await this.client.createRecord(atProtoPost);
    return response.uri;
  }
}

// Mastodon/ActivityPub implementation
class MastodonAdapter implements FederationAdapter {
  readonly protocol = 'activitypub';
  
  async publishPost(post: SocialPost): Promise<string> {
    if (!this.isEnabled) return post.id;
    
    // Transform to ActivityPub format
    const activityPubNote = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'Note',
      content: post.contentHtml,
      published: post.createdAt,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${this.instanceUrl}/users/${post.authorId}/followers`]
    };
    
    // Publish to ActivityPub network
    const response = await this.client.createActivity(activityPubNote);
    return response.id;
  }
}
```

### Federation Configuration

```typescript
interface FederationConfig {
  enabled: boolean;
  protocols: {
    atprotocol?: {
      enabled: boolean;
      pdsUrl?: string;
      handle?: string;
      appPassword?: string;
    };
    activitypub?: {
      enabled: boolean;
      instanceUrl?: string;
      username?: string;
      accessToken?: string;
    };
  };
  syncOptions: {
    autoPublish: boolean;
    syncFollowers: boolean;
    importContent: boolean;
    crossPostByDefault: boolean;
  };
}
```

## Feature Toggle System

```typescript
const socialFeatureFlags = {
  // Master controls
  'social.enabled': false,
  'social.beta_access': false,
  
  // Core features
  'social.posts.create': true,
  'social.posts.edit': true,
  'social.posts.delete': true,
  'social.posts.max_length': 500,
  'social.posts.max_images': 4,
  
  // Interactions
  'social.likes.enabled': true,
  'social.reposts.enabled': true,
  'social.reposts.with_comment': true,
  
  // Threading
  'social.threads.enabled': true,
  'social.threads.max_depth': 5,
  'social.threads.controls': true,
  
  // Following
  'social.following.enabled': true,
  'social.following.private_accounts': true,
  'social.following.suggestions': true,
  
  // Feeds
  'social.feeds.home': true,
  'social.feeds.community': true,
  'social.feeds.trending': true,
  'social.feeds.company': true,
  'social.feeds.realtime': true,
  
  // Media
  'social.media.photos': true,
  'social.media.video_embeds': true,
  'social.media.youtube': true,
  'social.media.vimeo': true,
  
  // Discovery
  'social.hashtags.enabled': true,
  'social.mentions.enabled': true,
  'social.search.enabled': true,
  
  // Federation (optional)
  'social.federation.enabled': false,
  'social.federation.atprotocol': false,
  'social.federation.mastodon': false,
  'social.federation.auto_sync': false,
  
  // Moderation
  'social.moderation.user_reports': true,
  'social.moderation.auto_filter': true,
  'social.moderation.admin_tools': true
};
```

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- Database schema creation
- Basic post CRUD operations
- User authentication integration
- Simple chronological feed

### Phase 2: Core Features (Weeks 5-8)
- Threading and replies
- Likes and reposts
- Following system
- Home feed algorithm

### Phase 3: Media & Embeds (Weeks 9-11)
- Photo upload integration
- YouTube/Vimeo embed support
- Media gallery view
- Thumbnail generation

### Phase 4: Advanced Features (Weeks 12-15)
- Hashtags and mentions
- Search functionality
- Trending algorithms
- Notifications system

### Phase 5: Polish & Optimization (Weeks 16-18)
- Performance optimization
- Mobile responsiveness
- Accessibility improvements
- Admin tools

### Phase 6: Federation (Optional, Weeks 19-22)
- Federation adapter implementation
- AT Protocol integration
- Mastodon bridge
- Cross-platform testing

## Performance Considerations

### Caching Strategy
- **Redis Cache Layers**:
  - User timelines (5-minute TTL)
  - Trending posts (15-minute TTL)
  - Follow relationships (1-hour TTL)
  - Hashtag trends (30-minute TTL)

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried columns
- **Partitioning**: Monthly partitions for posts table
- **Read Replicas**: Separate read/write databases
- **Connection Pooling**: Optimize database connections

### Real-time Updates
- **WebSocket Management**:
  - Selective subscriptions
  - Debounced updates
  - Binary protocols for efficiency
  - Automatic reconnection

## Security Considerations

### Content Security
- **Input Sanitization**: XSS prevention
- **Rate Limiting**: API throttling per user
- **CORS Policy**: Strict origin validation
- **Content Moderation**: Automated and manual review

### Privacy Protection
- **Data Minimization**: Store only necessary data
- **Encryption**: At-rest and in-transit
- **Access Control**: Role-based permissions
- **Audit Logging**: Track all sensitive operations

### Federation Security
- **Signature Verification**: Validate federated content
- **Instance Blocking**: Blacklist malicious servers
- **Content Filtering**: Scan incoming federated content
- **Rate Limiting**: Per-instance limits

## Monitoring and Analytics

### Key Metrics
- **Engagement Metrics**:
  - Daily/Monthly Active Users
  - Posts per user
  - Engagement rate (likes + reposts + replies / impressions)
  - Follow graph growth

- **Performance Metrics**:
  - Feed load time
  - Post creation latency
  - Search response time
  - WebSocket connection stability

- **Content Metrics**:
  - Popular hashtags
  - Viral coefficient
  - Reply depth distribution
  - Media usage patterns

### Monitoring Tools
- **Application Monitoring**: Error tracking, performance monitoring
- **Infrastructure Monitoring**: Server health, database performance
- **User Analytics**: Behavior tracking, funnel analysis
- **Content Analytics**: Trending analysis, sentiment analysis

## Success Criteria

### Launch Metrics (First 30 Days)
- 25% of active members create at least one post
- Average of 3 posts per active social user
- 50% of social users follow at least 5 others
- < 2 second average feed load time

### Growth Metrics (First 90 Days)
- 50% member adoption rate
- 10% daily active user rate
- Average session duration > 5 minutes
- Network effect: average connections per user > 10

### Long-term Success (6 Months)
- Self-sustaining content creation
- Positive engagement trends
- Community-driven moderation
- Optional federation adoption > 10%

## Risk Mitigation

### Technical Risks
- **Scalability**: Start with conservative limits, scale gradually
- **Performance**: Implement caching early, monitor continuously
- **Federation Complexity**: Keep federation optional and modular

### Community Risks
- **Content Moderation**: Clear guidelines, automated tools, human review
- **User Adoption**: Phased rollout, incentives, training
- **Culture Change**: Preserve existing community values

### Operational Risks
- **Maintenance Burden**: Automated testing, monitoring, documentation
- **Feature Creep**: Strict scope management, user feedback loops
- **Technical Debt**: Regular refactoring sprints, code reviews

## Conclusion

This social media platform specification provides a comprehensive blueprint for building a standalone, community-centric social platform that can optionally integrate with the broader federated social web. The modular design ensures that the core functionality remains robust and independent while allowing for future enhancements and integrations as needed.

The focus on reusing existing infrastructure, implementing progressive enhancement, and maintaining clear separation between core and optional features ensures a sustainable and maintainable implementation that can grow with the community's needs.