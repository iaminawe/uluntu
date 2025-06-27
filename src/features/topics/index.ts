// API exports
export { topicsApi } from './api/topicsApi';
export type { TopicFormData } from './types';

// Entity-specific API exports
export {
  newsTopicsApi,
  eventTopicsApi,
  resourceTopicsApi,
  groupTopicsApi,
  marketplaceTopicsApi,
  opportunityTopicsApi,
  companyTopicsApi,
  memberTopicsApi
} from './api/topicsApi';

// Hook exports
export {
  useTopicsHybrid,
  useTopicById,
  useTopicBySlug,
  useEntityTopics,
  useTopicAnalytics,
  useTopicContentCounts,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
  useSetEntityTopics,
  topicsQueryKeys
} from './hooks/useTopicsHybrid';

// Adapter exports
export {
  adaptTopicFromDatabase,
  adaptTopicToDatabase,
  validateTopicData,
  getTopicDisplayColor,
  getTopicDisplayIcon,
  generateTopicSlug,
  sortTopics,
  filterTopics,
  getUniqueTopicColors,
  getTopicStats
} from './utils/topicAdapter';

// Type exports
export type {
  Topic,
  TopicWithAnalytics,
  TopicEntityType,
  TopicFilters,
  TopicRow,
  TopicAnalyticsRow,
  EventTopic,
  NewsTopic,
  ResourceTopic,
  GroupTopic,
  MarketplaceTopic,
  OpportunityTopic,
  CompanyTopic,
  MemberTopic
} from './types';

// Constants
export const DEFAULT_TOPIC_COLORS = [
  '#0EA5E9', // Technology (blue)
  '#10B981', // Business (green)
  '#F59E0B', // Art (orange)
  '#8B5CF6', // Photography (purple)
  '#EC4899', // Design (pink)
  '#EF4444', // Red
  '#F97316', // Orange
  '#84CC16', // Lime
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

export const DEFAULT_TOPIC_ICONS = [
  'code',
  'briefcase',
  'palette',
  'camera',
  'pencil',
  'tag',
  'bookmark',
  'hash',
  'flag',
  'star'
];

export const MAX_TOPICS_PER_ENTITY = 10;
export const MAX_TOPIC_NAME_LENGTH = 100;
export const MAX_TOPIC_DESCRIPTION_LENGTH = 500;