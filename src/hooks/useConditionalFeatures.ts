import { useMemo } from 'react';
import { useFeatureToggles } from '@/utils/featureToggle';
import type { FeatureKey } from '@/types/settings';

/**
 * Hook for managing feature-dependent UI elements and navigation
 */

// Define feature groupings for easier management
export const CORE_FEATURES: FeatureKey[] = [
  'members_directory',
  'companies_listing',
  'events_system',
  'news_blog',
  'groups_communities',
  'resources_library',
  'marketplace',
  'opportunities_board',
  'photo_galleries'
];

export const SOCIAL_FEATURES: FeatureKey[] = [
  'user_messaging',
  'social_feeds',
  'user_following',
  'content_likes',
  'content_comments',
  'content_sharing'
];

export const ADVANCED_FEATURES: FeatureKey[] = [
  'advanced_search',
  'content_tagging',
  'notification_system',
  'calendar_integration',
  'payment_processing',
  'analytics_dashboard'
];

export const ADMIN_FEATURES: FeatureKey[] = [
  'bulk_operations',
  'audit_logging',
  'content_moderation',
  'user_management',
  'newsletter_system'
];

// Navigation items with their corresponding features
export interface ConditionalNavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  feature?: FeatureKey;
  visible?: boolean;
  order?: number;
  badge?: string;
  children?: ConditionalNavItem[];
}

export const DEFAULT_NAVIGATION_ITEMS: ConditionalNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: 'Home',
    visible: true,
    order: 1
  },
  {
    id: 'directory',
    label: 'Members',
    href: '/directory',
    icon: 'Users',
    feature: 'members_directory',
    order: 2
  },
  {
    id: 'companies',
    label: 'Companies',
    href: '/companies',
    icon: 'Building',
    feature: 'companies_listing',
    order: 3
  },
  {
    id: 'events',
    label: 'Events',
    href: '/events',
    icon: 'Calendar',
    feature: 'events_system',
    order: 4
  },
  {
    id: 'groups',
    label: 'Groups',
    href: '/groups',
    icon: 'Users',
    feature: 'groups_communities',
    order: 5
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    href: '/opportunities',
    icon: 'Briefcase',
    feature: 'opportunities_board',
    order: 6
  },
  {
    id: 'galleries',
    label: 'Galleries',
    href: '/galleries',
    icon: 'Camera',
    feature: 'photo_galleries',
    order: 7
  },
  {
    id: 'resources',
    label: 'Resources',
    href: '/resources',
    icon: 'BookOpen',
    feature: 'resources_library',
    order: 8
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    href: '/marketplace',
    icon: 'ShoppingCart',
    feature: 'marketplace',
    order: 9
  },
  {
    id: 'news',
    label: 'News',
    href: '/news',
    icon: 'Newspaper',
    feature: 'news_blog',
    order: 10
  }
];

/**
 * Hook to get filtered navigation items based on enabled features
 */
export function useConditionalNavigation() {
  const requiredFeatures = DEFAULT_NAVIGATION_ITEMS
    .map(item => item.feature)
    .filter((feature): feature is FeatureKey => !!feature);

  const { toggles, loading } = useFeatureToggles(requiredFeatures);

  const filteredNavigation = useMemo(() => {
    return DEFAULT_NAVIGATION_ITEMS.filter(item => {
      // Always show items without feature requirements
      if (!item.feature) return item.visible !== false;
      
      // Show items only if feature is enabled
      return toggles[item.feature] === true;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [toggles]);

  return {
    navigation: filteredNavigation,
    loading,
    isFeatureEnabled: (feature: FeatureKey) => toggles[feature] === true
  };
}

/**
 * Hook to check if core features are available
 */
export function useCoreFeatures() {
  const { toggles, loading } = useFeatureToggles(CORE_FEATURES);

  const coreFeatureStatus = useMemo(() => ({
    directory: toggles['members_directory'] === true,
    companies: toggles['companies_listing'] === true,
    events: toggles['events_system'] === true,
    news: toggles['news_blog'] === true,
    groups: toggles['groups_communities'] === true,
    resources: toggles['resources_library'] === true,
    marketplace: toggles['marketplace'] === true,
    opportunities: toggles['opportunities_board'] === true,
    galleries: toggles['photo_galleries'] === true
  }), [toggles]);

  const enabledCount = Object.values(coreFeatureStatus).filter(Boolean).length;

  return {
    features: coreFeatureStatus,
    loading,
    enabledCount,
    totalCount: CORE_FEATURES.length,
    completionPercentage: Math.round((enabledCount / CORE_FEATURES.length) * 100)
  };
}

/**
 * Hook to check if social features are available
 */
export function useSocialFeatures() {
  const { toggles, loading } = useFeatureToggles(SOCIAL_FEATURES);

  const socialFeatureStatus = useMemo(() => ({
    messaging: toggles['user_messaging'] === true,
    feeds: toggles['social_feeds'] === true,
    following: toggles['user_following'] === true,
    likes: toggles['content_likes'] === true,
    comments: toggles['content_comments'] === true,
    sharing: toggles['content_sharing'] === true
  }), [toggles]);

  return {
    features: socialFeatureStatus,
    loading,
    hasAnySocialFeatures: Object.values(socialFeatureStatus).some(Boolean)
  };
}

/**
 * Hook for gallery-specific feature checking
 */
export function useGalleryFeatures() {
  const galleryFeatures: FeatureKey[] = [
    'photo_galleries',
    'content_likes',
    'content_comments',
    'content_sharing',
    'content_tagging'
  ];

  const { toggles, loading } = useFeatureToggles(galleryFeatures);

  const galleryFeatureStatus = useMemo(() => ({
    galleries: toggles['photo_galleries'] === true,
    likes: toggles['content_likes'] === true,
    comments: toggles['content_comments'] === true,
    sharing: toggles['content_sharing'] === true,
    tagging: toggles['content_tagging'] === true
  }), [toggles]);

  return {
    features: galleryFeatureStatus,
    loading,
    isGalleryEnabled: galleryFeatureStatus.galleries,
    canInteract: galleryFeatureStatus.galleries && (
      galleryFeatureStatus.likes || 
      galleryFeatureStatus.comments || 
      galleryFeatureStatus.sharing
    )
  };
}

/**
 * Hook for admin feature checking
 */
export function useAdminFeatures() {
  const { toggles, loading } = useFeatureToggles(ADMIN_FEATURES);

  const adminFeatureStatus = useMemo(() => ({
    bulkOperations: toggles['bulk_operations'] === true,
    auditLogging: toggles['audit_logging'] === true,
    contentModeration: toggles['content_moderation'] === true,
    userManagement: toggles['user_management'] === true,
    newsletter: toggles['newsletter_system'] === true
  }), [toggles]);

  return {
    features: adminFeatureStatus,
    loading,
    hasAnyAdminFeatures: Object.values(adminFeatureStatus).some(Boolean)
  };
}

/**
 * Hook to check if experimental features are available
 */
export function useExperimentalFeatures() {
  const experimentalFeatures: FeatureKey[] = [
    'ai_content_suggestions',
    'automated_moderation',
    'smart_matching',
    'voice_features',
    'video_features'
  ];

  const { toggles, loading } = useFeatureToggles(experimentalFeatures);

  const experimentalFeatureStatus = useMemo(() => ({
    aiSuggestions: toggles['ai_content_suggestions'] === true,
    autoModeration: toggles['automated_moderation'] === true,
    smartMatching: toggles['smart_matching'] === true,
    voice: toggles['voice_features'] === true,
    video: toggles['video_features'] === true
  }), [toggles]);

  return {
    features: experimentalFeatureStatus,
    loading,
    hasAnyExperimentalFeatures: Object.values(experimentalFeatureStatus).some(Boolean)
  };
}

/**
 * Utility function to get feature description
 */
export function getFeatureDescription(feature: FeatureKey): string {
  const descriptions: Record<FeatureKey, string> = {
    // Core Features
    'members_directory': 'Browse and connect with community members',
    'companies_listing': 'Discover local businesses and organizations',
    'events_system': 'Create and attend community events',
    'news_blog': 'Stay updated with community news and announcements',
    'groups_communities': 'Join special interest groups and communities',
    'resources_library': 'Access shared resources and documentation',
    'marketplace': 'Buy and sell items within the community',
    'opportunities_board': 'Find job opportunities and career postings',
    'photo_galleries': 'Share and view community photo galleries',
    
    // Social Features
    'user_messaging': 'Send direct messages to other members',
    'social_feeds': 'View personalized social media-style feeds',
    'user_following': 'Follow members and get updates on their activity',
    'content_likes': 'Like and react to community content',
    'content_comments': 'Comment and discuss community content',
    'content_sharing': 'Share content on social media platforms',
    
    // Advanced Features
    'advanced_search': 'Use advanced filtering and search capabilities',
    'content_tagging': 'Tag and categorize content for better organization',
    'notification_system': 'Receive push notifications for important updates',
    'calendar_integration': 'Sync events with Google Calendar and Outlook',
    'payment_processing': 'Process payments for events and marketplace items',
    'analytics_dashboard': 'View detailed analytics and insights',
    
    // Admin Features
    'bulk_operations': 'Perform bulk operations on multiple items',
    'audit_logging': 'Track all system changes with detailed audit logs',
    'content_moderation': 'Moderate community content and user reports',
    'user_management': 'Advanced user management and role assignment',
    'newsletter_system': 'Create and send newsletter campaigns',
    
    // Integration Features
    'api_access': 'Access REST API for third-party integrations',
    'webhook_support': 'Receive real-time notifications via webhooks',
    'sso_integration': 'Single Sign-On integration with external providers',
    'ldap_integration': 'Integrate with LDAP/Active Directory systems',
    
    // Mobile Features
    'mobile_app': 'Access features through mobile applications',
    'push_notifications': 'Receive push notifications on mobile devices',
    'offline_mode': 'Use basic features while offline',
    
    // Experimental Features
    'ai_content_suggestions': 'AI-powered content recommendations',
    'automated_moderation': 'Automatic content moderation using AI',
    'smart_matching': 'AI-powered member and opportunity matching',
    'voice_features': 'Voice notes and audio content support',
    'video_features': 'Video content and live streaming capabilities'
  };

  return descriptions[feature] || 'Feature description not available';
}

/**
 * Get feature category for organization
 */
export function getFeatureCategory(feature: FeatureKey): string {
  if (CORE_FEATURES.includes(feature)) return 'Core';
  if (SOCIAL_FEATURES.includes(feature)) return 'Social';
  if (ADVANCED_FEATURES.includes(feature)) return 'Advanced';
  if (ADMIN_FEATURES.includes(feature)) return 'Admin';
  return 'Other';
}