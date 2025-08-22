# User Dashboard API Documentation

## Overview

The User Dashboard API provides a comprehensive system for users to manage their content, view analytics, and engage with the platform across all features. It integrates seamlessly with existing APIs while providing unified access to user data and operations.

## Features

- **Content Management**: Unified view and management of all user content
- **Analytics & Insights**: Detailed analytics across all content types
- **Activity Feeds**: Real-time user activity tracking
- **Recommendations**: AI-powered content recommendations
- **Bulk Operations**: Efficient batch operations on multiple content items
- **Security & Permissions**: Role-based access control and content ownership verification
- **Integration**: Seamless integration with existing feature APIs

## API Structure

### Core APIs

1. **Dashboard API** (`dashboardApi`): Main dashboard functionality
2. **Content Management API** (`contentManagementApi`): Advanced content operations
3. **Integration API** (`integrationApi`): External service integrations
4. **Security API** (`dashboardSecurity`): Authentication and authorization

## Quick Start

```typescript
import { dashboardManager } from '@/features/dashboard/api';

// Get complete dashboard overview
const overview = await dashboardManager.getOverview();

// Get user's content with filtering
const content = await dashboardManager.getContent({
  type: ['photo', 'event'],
  status: ['published'],
  featured: true
}, 1, 20);

// Get activity feed
const activity = await dashboardManager.getActivity({}, 1, 10);

// Get recommendations
const recommendations = await dashboardManager.getRecommendations(['event', 'group'], 5);
```

## API Endpoints

### 1. Dashboard Overview

#### `GET /api/dashboard/overview`

Get comprehensive dashboard overview including analytics, activity, and recommendations.

**Response:**
```typescript
{
  data: {
    user_id: string;
    total_content: number;
    published_content: number;
    draft_content: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
    profile_completion: number;
    last_activity: string;
    content_analytics: ContentAnalytics[];
    recent_activity: ActivityItem[];
    recommendations: ContentRecommendation[];
    engagement_metrics: EngagementMetrics;
  };
  last_updated: string;
}
```

**Example:**
```typescript
const overview = await dashboardApi.getDashboardOverview();
console.log(`Profile completion: ${overview.data.profile_completion}%`);
```

### 2. Content Management

#### `GET /api/dashboard/content`

Get all user content with advanced filtering and pagination.

**Parameters:**
- `filters` (ContentFilters): Filter criteria
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `includeAnalytics` (boolean): Include analytics data

**Response:**
```typescript
{
  data: DashboardContent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
  filters_applied: ContentFilters;
}
```

**Example:**
```typescript
// Get featured photos from last month
const content = await contentManagementApi.getAllUserContent({
  filters: {
    type: ['photo'],
    featured: true,
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  },
  page: 1,
  limit: 10,
  includeAnalytics: true
});
```

#### `POST /api/dashboard/content/bulk`

Perform bulk operations on multiple content items.

**Body:**
```typescript
{
  content_ids: string[];
  operation: 'publish' | 'unpublish' | 'archive' | 'delete' | 'feature' | 'unfeature';
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  data: {
    success_count: number;
    error_count: number;
    errors: Array<{
      content_id: string;
      error: string;
    }>;
  };
  operation: string;
  total_processed: number;
}
```

**Example:**
```typescript
// Publish multiple photos
const result = await contentManagementApi.performBulkContentOperation({
  content_ids: ['photo1', 'photo2', 'photo3'],
  operation: 'publish'
});
```

#### `PUT /api/dashboard/content/:id`

Update a specific content item.

**Parameters:**
- `id` (string): Content ID
- `contentType` (string): Content type

**Body:**
```typescript
{
  title?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived' | 'pending';
  featured?: boolean;
}
```

**Example:**
```typescript
const updated = await contentManagementApi.updateContentItem(
  'photo123',
  'photo',
  {
    title: 'Updated Photo Title',
    featured: true
  }
);
```

### 3. Analytics

#### `GET /api/dashboard/analytics`

Get detailed content analytics and statistics.

**Parameters:**
- `period` (string): 'day' | 'week' | 'month' | 'year'
- `content_types` (string[]): Content types to analyze
- `start_date` (string): Start date (ISO format)
- `end_date` (string): End date (ISO format)

**Response:**
```typescript
{
  data: ContentAnalytics[];
  summary: {
    total_content: number;
    total_views: number;
    total_engagement: number;
    growth_percentage: number;
  };
}
```

**Example:**
```typescript
const analytics = await contentManagementApi.getContentStatistics({
  period: 'month',
  content_types: ['photo', 'event']
});
```

### 4. Activity Feed

#### `GET /api/dashboard/activity`

Get user activity stream with filtering.

**Parameters:**
- `filters` (ActivityFilters): Filter criteria
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```typescript
{
  data: ActivityItem[];
  pagination: PaginationInfo;
  filters_applied: ActivityFilters;
}
```

**Example:**
```typescript
const activity = await dashboardApi.getUserActivity({
  filters: {
    activity_type: ['content_created', 'content_updated'],
    target_type: ['photo', 'event']
  },
  page: 1,
  limit: 20
});
```

### 5. Recommendations

#### `GET /api/dashboard/recommendations`

Get personalized content recommendations.

**Parameters:**
- `filters` (RecommendationFilters): Filter criteria
- `limit` (number): Number of recommendations

**Response:**
```typescript
{
  data: ContentRecommendation[];
  total_count: number;
  filters_applied: RecommendationFilters;
}
```

**Example:**
```typescript
const recommendations = await dashboardApi.getRecommendations({
  filters: {
    type: ['event', 'group'],
    min_relevance_score: 0.5
  },
  limit: 10
});
```

### 6. Integration Endpoints

#### `GET /api/dashboard/integration/photos`

Get photo gallery data optimized for dashboard.

**Example:**
```typescript
const photos = await integrationApi.getPhotoDashboardData({
  limit: 10,
  include_analytics: true
});
```

#### `GET /api/dashboard/integration/events`

Get events data optimized for dashboard.

**Example:**
```typescript
const events = await integrationApi.getEventDashboardData({
  limit: 10,
  include_past: false
});
```

#### `GET /api/dashboard/integration/profile-insights`

Get profile completion insights and suggestions.

**Example:**
```typescript
const insights = await integrationApi.getProfileInsights();
console.log(`Missing fields: ${insights.missing_fields.join(', ')}`);
```

## Security & Permissions

### Authentication

All dashboard endpoints require user authentication. The system automatically validates the user session and retrieves the associated member profile.

```typescript
// Authentication is handled automatically by withAuth middleware
const userContext = await dashboardSecurity.getUserContext();
```

### Role-Based Access Control

The system supports multiple user roles with different permission levels:

- **user**: Basic content creation and management
- **moderator**: Content moderation and publishing
- **admin**: Full content management and analytics
- **super_admin**: Unlimited access

### Content Ownership

Users can only access and modify content they own, unless they have elevated permissions:

```typescript
// Check content ownership
const ownership = await dashboardSecurity.verifyContentOwnership('content123', 'photo');
if (!ownership.is_owner) {
  throw new Error('Access denied');
}
```

### Permissions Check

Check specific permissions before performing operations:

```typescript
// Check if user can perform bulk operations
const permissions = await dashboardSecurity.getDashboardPermissions();
if (!permissions.can_bulk_edit) {
  throw new Error('Bulk edit not allowed');
}
```

### Rate Limiting

API calls are rate-limited to prevent abuse:

```typescript
// Rate limiting is applied automatically
const allowed = await dashboardSecurity.checkRateLimit('overview', 50, 3600000);
```

### Content Quotas

Users have quotas based on their role:

```typescript
// Check if user can create more content
const canCreate = await dashboardSecurity.checkContentQuota('photo');
```

## Error Handling

The API uses consistent error handling across all endpoints:

```typescript
try {
  const result = await dashboardApi.getDashboardOverview();
} catch (error) {
  if (error.message === 'User not authenticated') {
    // Handle authentication error
  } else if (error.message === 'Rate limit exceeded') {
    // Handle rate limiting
  } else {
    // Handle other errors
  }
}
```

## Data Types

### DashboardContent

```typescript
interface DashboardContent {
  id: string;
  type: 'photo' | 'event' | 'marketplace_listing' | 'opportunity' | 'group_post' | 'news_article';
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived' | 'pending';
  created_at: string;
  updated_at: string;
  user_id: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  featured?: boolean;
  thumbnail_url?: string;
  url?: string;
  slug?: string;
}
```

### ContentAnalytics

```typescript
interface ContentAnalytics {
  content_type: DashboardContent['type'];
  total_count: number;
  published_count: number;
  draft_count: number;
  archived_count: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  growth_percentage: number;
}
```

### ActivityItem

```typescript
interface ActivityItem {
  id: string;
  type: 'content_created' | 'content_updated' | 'content_liked' | 'content_commented' | 'profile_updated' | 'group_joined' | 'event_attended';
  title: string;
  description: string;
  actor_id: string;
  actor_name: string;
  actor_image?: string;
  target_type: 'photo' | 'event' | 'marketplace_listing' | 'opportunity' | 'group' | 'profile' | 'news_article';
  target_id: string;
  target_title?: string;
  target_url?: string;
  created_at: string;
  metadata?: Record<string, any>;
}
```

### ContentRecommendation

```typescript
interface ContentRecommendation {
  id: string;
  type: 'event' | 'group' | 'opportunity' | 'marketplace_listing' | 'member';
  title: string;
  description: string;
  image_url?: string;
  url: string;
  reason: string;
  relevance_score: number;
  created_at: string;
  metadata?: Record<string, any>;
}
```

## Best Practices

### 1. Pagination

Always use pagination for large datasets:

```typescript
const content = await dashboardManager.getContent({}, 1, 20);
```

### 2. Filtering

Use specific filters to reduce payload size:

```typescript
const photos = await dashboardManager.getContent({
  type: ['photo'],
  status: ['published'],
  featured: true
});
```

### 3. Error Handling

Always handle errors gracefully:

```typescript
try {
  const result = await dashboardManager.getOverview();
} catch (error) {
  console.error('Dashboard error:', error);
  // Show user-friendly error message
}
```

### 4. Rate Limiting

Be mindful of rate limits:

```typescript
// Cache results when possible
const cachedOverview = localStorage.getItem('dashboard_overview');
if (!cachedOverview || isExpired(cachedOverview)) {
  const overview = await dashboardManager.getOverview();
  localStorage.setItem('dashboard_overview', JSON.stringify(overview));
}
```

### 5. Security

Always validate permissions:

```typescript
const permissions = await dashboardManager.getPermissions();
if (permissions.can_bulk_edit) {
  // Show bulk edit UI
}
```

## Configuration

### Rate Limits

```typescript
const RATE_LIMITS = {
  OVERVIEW: { limit: 50, window: 3600000 }, // 50 per hour
  CONTENT: { limit: 200, window: 3600000 }, // 200 per hour  
  BULK_OPERATIONS: { limit: 10, window: 3600000 }, // 10 per hour
  ANALYTICS: { limit: 100, window: 3600000 } // 100 per hour
};
```

### Content Quotas

```typescript
const CONTENT_QUOTAS = {
  user: {
    photo: 100,
    event: 10,
    marketplace_listing: 20,
    opportunity: 5,
    group_post: 50,
    news_article: 5
  },
  // ... other roles
};
```

### Cache Settings

```typescript
const CACHE_TTL = {
  OVERVIEW: 300, // 5 minutes
  ANALYTICS: 600, // 10 minutes
  RECOMMENDATIONS: 1800, // 30 minutes
  PROFILE_INSIGHTS: 3600 // 1 hour
};
```

## Integration Examples

### React Component

```typescript
import React, { useEffect, useState } from 'react';
import { dashboardManager } from '@/features/dashboard/api';

const DashboardOverview: React.FC = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await dashboardManager.getOverview();
        setOverview(data.data);
      } catch (error) {
        console.error('Failed to load overview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard Overview</h1>
      <p>Total Content: {overview?.total_content}</p>
      <p>Profile Completion: {overview?.profile_completion}%</p>
      {/* ... rest of component */}
    </div>
  );
};
```

### Bulk Operations

```typescript
const handleBulkPublish = async (selectedIds: string[]) => {
  try {
    const result = await dashboardManager.bulkOperation({
      content_ids: selectedIds,
      operation: 'publish'
    });

    console.log(`Published ${result.data.success_count} items`);
    if (result.data.error_count > 0) {
      console.error('Some items failed:', result.data.errors);
    }
  } catch (error) {
    console.error('Bulk operation failed:', error);
  }
};
```

### Analytics Dashboard

```typescript
const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await dashboardManager.getAnalytics('month', ['photo', 'event']);
      setAnalytics(data.data);
    };

    loadAnalytics();
  }, []);

  return (
    <div>
      {analytics.map(item => (
        <div key={item.content_type}>
          <h3>{item.content_type}</h3>
          <p>Total: {item.total_count}</p>
          <p>Views: {item.view_count}</p>
          <p>Growth: {item.growth_percentage}%</p>
        </div>
      ))}
    </div>
  );
};
```

## Database Schema Requirements

The dashboard API integrates with existing tables and requires some additional tables for full functionality:

### Required Tables

1. **user_activity** - For activity tracking
2. **rate_limits** - For rate limiting
3. **security_logs** - For security event logging
4. **content_recommendations** - For recommendation engine

### Recommended Database Functions

1. **get_user_recommendations(user_id, limit, types)** - Generate recommendations
2. **get_user_content_analytics(user_id, period)** - Calculate analytics
3. **get_user_engagement_metrics(user_id, period)** - Calculate engagement
4. **mark_conversation_as_read(conversation_id)** - Message management

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure user is logged in
   - Check session validity
   - Verify member profile exists

2. **Permission Denied**
   - Check user role and permissions
   - Verify content ownership
   - Review rate limits

3. **Performance Issues**
   - Use pagination
   - Implement caching
   - Filter data appropriately

4. **Integration Problems**
   - Verify API imports
   - Check database schema
   - Review error logs

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Enable debug logging
console.log('Dashboard API Debug Mode Enabled');

const overview = await dashboardApi.getDashboardOverview();
console.log('Overview response:', overview);
```

This documentation provides a comprehensive guide to using the User Dashboard API system. The API is designed to be secure, performant, and easy to integrate with existing applications while providing powerful content management and analytics capabilities.