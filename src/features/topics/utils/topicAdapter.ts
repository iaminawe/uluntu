import type { Topic, TopicRow, TopicWithAnalytics, TopicAnalyticsRow } from '../types';

export function adaptTopicFromDatabase(row: TopicRow): Topic {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || undefined,
    icon: row.icon || 'tag',
    color: row.color || '#6366f1',
    sortOrder: row.sort_order || 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function adaptTopicToDatabase(topic: Partial<Topic>): Partial<TopicRow> {
  const dbTopic: Partial<TopicRow> = {};
  
  if (topic.name !== undefined) dbTopic.name = topic.name;
  if (topic.slug !== undefined) dbTopic.slug = topic.slug;
  if (topic.description !== undefined) dbTopic.description = topic.description || null;
  if (topic.icon !== undefined) dbTopic.icon = topic.icon;
  if (topic.color !== undefined) dbTopic.color = topic.color;
  if (topic.sortOrder !== undefined) dbTopic.sort_order = topic.sortOrder;
  if (topic.isActive !== undefined) dbTopic.is_active = topic.isActive;
  
  return dbTopic;
}

export function adaptTopicWithAnalyticsFromDatabase(row: TopicAnalyticsRow): TopicWithAnalytics {
  return {
    id: row.id || '',
    name: row.name || '',
    slug: row.slug || '',
    description: undefined, // Not available in the view
    icon: row.icon || 'tag',
    color: row.color || '#6366f1',
    sortOrder: 0, // Not available in the view
    isActive: true, // Not available in the view
    createdAt: new Date().toISOString(), // Not available in the view
    updatedAt: new Date().toISOString(), // Not available in the view
    totalContentCount: row.total_content_count || 0,
    eventCount: row.event_count || 0,
    newsCount: row.news_count || 0,
    resourceCount: row.resource_count || 0,
    marketplaceCount: row.marketplace_count || 0,
    opportunityCount: row.opportunity_count || 0,
    groupCount: row.group_count || 0,
    companyCount: row.company_count || 0,
    memberCount: row.member_count || 0,
    popularityPercentage: row.popularity_percentage || 0
  };
}

export function generateTopicSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateTopicData(topic: Partial<Topic>): string[] {
  const errors: string[] = [];
  
  if (topic.name !== undefined) {
    if (!topic.name || topic.name.trim().length === 0) {
      errors.push('Topic name is required');
    } else if (topic.name.length > 100) {
      errors.push('Topic name must be less than 100 characters');
    }
  }
  
  if (topic.description !== undefined && topic.description && topic.description.length > 500) {
    errors.push('Topic description must be less than 500 characters');
  }
  
  if (topic.color !== undefined && topic.color && !/^#[0-9A-Fa-f]{6}$/.test(topic.color)) {
    errors.push('Topic color must be a valid hex color code');
  }
  
  return errors;
}

export function getTopicDisplayColor(topic: Topic): string {
  return topic.color || '#6366f1';
}

export function getTopicDisplayIcon(topic: Topic): string {
  return topic.icon || 'tag';
}

export function sortTopics(topics: Topic[], sortBy: 'name' | 'sortOrder' = 'sortOrder'): Topic[] {
  return [...topics].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return a.sortOrder - b.sortOrder;
  });
}

export function filterTopics(topics: Topic[], search?: string): Topic[] {
  if (!search || search.trim().length === 0) {
    return topics;
  }
  
  const searchLower = search.toLowerCase();
  return topics.filter(topic => 
    topic.name.toLowerCase().includes(searchLower) ||
    (topic.description && topic.description.toLowerCase().includes(searchLower))
  );
}

export function getUniqueTopicColors(topics: Topic[]): string[] {
  const colors = new Set(topics.map(t => t.color));
  return Array.from(colors);
}

export function getTopicStats(topics: TopicWithAnalytics[]): {
  totalTopics: number;
  totalContent: number;
  topTopics: TopicWithAnalytics[];
  emptyTopics: TopicWithAnalytics[];
} {
  const totalContent = topics.reduce((sum, topic) => sum + topic.totalContentCount, 0);
  const topTopics = [...topics]
    .sort((a, b) => b.totalContentCount - a.totalContentCount)
    .slice(0, 10);
  const emptyTopics = topics.filter(topic => topic.totalContentCount === 0);
  
  return {
    totalTopics: topics.length,
    totalContent,
    topTopics,
    emptyTopics
  };
}