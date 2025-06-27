# Topics System Integration Guide

## Overview

The topics system provides a flexible way to categorize and organize content across all entities in the Nelson Tech platform. This guide covers the complete integration implementation.

## Database Schema

### Core Tables

#### `topics`
```sql
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Junction Tables
- `news_topics` - Links topics to news articles
- `event_topics` - Links topics to events
- `resource_topics` - Links topics to resources
- `group_topics` - Links topics to groups
- `marketplace_topics` - Links topics to marketplace listings
- `opportunity_topics` - Links topics to opportunities
- `company_topics` - Links topics to companies

### Views

#### `topic_analytics`
Provides aggregated content counts per topic across all entity types.

## API Integration

### Topic Management API (`/src/api/topics.ts`)

```typescript
import { topicsApi } from '@/api/topics';

// Basic CRUD operations
const topics = await topicsApi.getAll();
const topic = await topicsApi.getById(id);
const topic = await topicsApi.getBySlug(slug);
const newTopic = await topicsApi.create(data);
const updatedTopic = await topicsApi.update(id, data);
await topicsApi.delete(id);

// Analytics
const analytics = await topicsApi.getAnalytics();
```

### Entity-Specific APIs

```typescript
import { newsTopicsApi, eventTopicsApi } from '@/api/topics';

// Get topics for an entity
const topics = await newsTopicsApi.getTopics(newsId);

// Add topics to an entity
await newsTopicsApi.addTopics(newsId, [topicId1, topicId2]);

// Set topics for an entity (replaces all)
await newsTopicsApi.setTopics(newsId, [topicId1, topicId2]);

// Remove topics from an entity
await newsTopicsApi.removeTopics(newsId, [topicId1]);
```

## React Hooks

### Core Hooks (`/src/hooks/useTopics.ts`)

```typescript
import { useTopics, useEntityTopics } from '@/hooks/useTopics';

// Manage all topics
const { topics, loading, createTopic, updateTopic, deleteTopic } = useTopics();

// Manage topics for specific entity
const { 
  topics, 
  loading, 
  addTopics, 
  removeTopics, 
  setTopics 
} = useEntityTopics('news', newsId);
```

## UI Components

### TopicSelector

Multi-select component for choosing topics:

```tsx
import { TopicSelector } from '@/components/topics/TopicSelector';

<TopicSelector
  selectedTopics={selectedTopicIds}
  onChange={setSelectedTopicIds}
  maxSelections={5}
  placeholder="Choose topics..."
/>
```

### TopicBadges

Display topics as styled badges:

```tsx
import { TopicBadges } from '@/components/topics/TopicBadges';

<TopicBadges 
  topics={topics}
  size="sm"
  interactive={true}
  maxDisplay={3}
/>
```

## Integration Steps

### 1. Database Migration

```bash
# Run the topics migration
chmod +x database/migrations/apply_topics_migration.sh
./database/migrations/apply_topics_migration.sh
```

### 2. Validate Integration

```bash
# Run validation script
npx ts-node scripts/validate-topics-integration.ts
```

### 3. Update Entity Forms

Add topic selection to entity create/edit forms:

```tsx
import { TopicSelector } from '@/components/topics/TopicSelector';
import { useEntityTopics } from '@/hooks/useTopics';

function NewsEditForm({ newsId }) {
  const { topics, setTopics } = useEntityTopics('news', newsId);
  const [selectedTopicIds, setSelectedTopicIds] = useState(
    topics.map(t => t.id)
  );

  const handleSave = async () => {
    await setTopics(selectedTopicIds);
    // Save other form data...
  };

  return (
    <form>
      {/* Other form fields */}
      
      <div className="form-group">
        <label>Topics</label>
        <TopicSelector
          selectedTopics={selectedTopicIds}
          onChange={setSelectedTopicIds}
        />
      </div>
      
      <button onClick={handleSave}>Save</button>
    </form>
  );
}
```

### 4. Update Entity Displays

Show topics on entity cards and lists:

```tsx
import { TopicBadges } from '@/components/topics/TopicBadges';
import { useEntityTopics } from '@/hooks/useTopics';

function NewsCard({ news }) {
  const { topics } = useEntityTopics('news', news.id);
  
  return (
    <div className="news-card">
      <h3>{news.title}</h3>
      <p>{news.excerpt}</p>
      <TopicBadges topics={topics} />
    </div>
  );
}
```

### 5. Update Admin Tables

Enhance admin entity tables to show topics:

```tsx
// See /src/pages/admin/entities/EnhancedNewsPage.tsx for full example
function NewsTopics({ newsId }) {
  const { topics, loading } = useEntityTopics('news', newsId);
  return <TopicBadges topics={topics} size="sm" maxDisplay={3} />;
}

const columns = [
  // ... other columns
  {
    key: 'topics',
    label: 'Topics',
    render: (value: any, item: NewsItem) => (
      <NewsTopics newsId={item.id} />
    ),
    sortable: false
  }
];
```

## Testing

### Integration Tests

```bash
# Run the comprehensive test suite
npm run test src/tests/topics-integration.test.tsx
```

Test coverage includes:
- Topic CRUD operations
- Entity-topic associations
- GraphQL schema validation
- UI component rendering
- Permission checks
- Analytics accuracy

### Manual Testing Checklist

- [ ] Create topics via admin interface
- [ ] Assign topics to entities
- [ ] View topic badges on entity cards
- [ ] Filter entities by topics
- [ ] Verify topic analytics
- [ ] Test topic search and selection
- [ ] Validate RLS policies

## Performance Considerations

### Database Indexes

All junction tables have indexes on both foreign keys:
```sql
CREATE INDEX idx_news_topics_news_id ON news_topics(news_id);
CREATE INDEX idx_news_topics_topic_id ON news_topics(topic_id);
```

### Query Optimization

When fetching entities with topics, use the appropriate join strategy:

```typescript
// Efficient: Single query with join
const { data } = await supabase
  .from('news')
  .select(`
    *,
    news_topics (
      topic_id,
      topics (*)
    )
  `);

// Less efficient: Multiple queries
const news = await supabase.from('news').select('*');
for (const item of news) {
  const topics = await newsTopicsApi.getTopics(item.id);
}
```

## Security

### Row Level Security (RLS)

- **Topics**: Read access for all users, write access for admins only
- **Junction Tables**: Read access for all, write access based on entity permissions

### Permission Checks

```typescript
// Admin-only operations
const canManageTopics = user.role === 'admin' || user.role === 'super_admin';

// Entity-specific permissions
const canEditNewsTopics = news.author_id === user.id || canManageTopics;
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Check database permissions and connection
2. **Topics not appearing**: Verify RLS policies and user permissions
3. **Slow queries**: Ensure indexes are created on junction tables
4. **Duplicate topic assignments**: Junction tables have unique constraints

### Debug Queries

```sql
-- Check topic assignments
SELECT t.name, COUNT(*) as content_count
FROM topics t
LEFT JOIN news_topics nt ON t.id = nt.topic_id
GROUP BY t.id, t.name;

-- Verify RLS policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename LIKE '%topic%';
```

## Future Enhancements

### Planned Features

- [ ] Topic hierarchies (parent-child relationships)
- [ ] Topic trending scores based on engagement
- [ ] Automated topic suggestions using content analysis
- [ ] Topic-based content recommendations
- [ ] Topic usage analytics dashboard
- [ ] Bulk topic management operations

### Extension Points

- Custom topic colors and icons
- Topic-specific permissions
- Integration with search and filtering
- Topic-based notification preferences
- Multi-language topic names

## Memory Storage

Integration test results and findings are stored in the memory system:

```bash
# Store integration results
./claude-flow memory store "swarm-auto-centralized-1750983182275/integration-lead/results" "Topics integration completed successfully. All entities now support topic associations. Performance optimized with proper indexing."

# Query integration status
./claude-flow memory query "topics integration"
```

## Conclusion

The topics system provides a robust foundation for content categorization across the Nelson Tech platform. The integration is designed to be:

- **Scalable**: Efficient database design with proper indexing
- **Flexible**: Support for all entity types with consistent API
- **User-friendly**: Intuitive UI components for selection and display
- **Maintainable**: Comprehensive test coverage and validation tools

For questions or issues, refer to the troubleshooting section or run the validation script to diagnose problems.