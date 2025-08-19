// Newsletter API exports
export { newsletterSubscriptionApi } from './subscriptions';
export { newsletterCampaignApi } from './campaigns';
export { newsletterAnalyticsApi } from './analytics';
export { newsletterContentApi } from './content';
export { newsletterSegmentApi } from './segments';
export { newsletterTemplateApi } from './templates';
export { newsletterImportExportApi } from './import-export';

// Re-export types for convenience
export type {
  NewsletterSubscription,
  NewsletterCampaign,
  NewsletterAnalytics,
  NewsletterSegment,
  NewsletterTemplate,
  CreateSubscriptionRequest,
  CreateCampaignRequest,
  CreateSegmentRequest,
  CreateTemplateRequest,
  SegmentationCriteria,
  ABTest,
  ABTestResults,
  EngagementScore,
  CohortAnalysis,
  AdvancedAnalytics,
  ImportResult,
  ExportFormat,
  BulkOperation,
  BulkOperationResult
} from '@/types/newsletter';