import React, { useState } from 'react';
import { FeatureToggle, UpdateFeatureToggleRequest } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Zap, Users, Wrench, Shield, Globe, Smartphone, Info, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FeatureManagementSectionProps {
  features: FeatureToggle[];
  onUpdateFeature: (request: UpdateFeatureToggleRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

// Define which features are actually implemented
const IMPLEMENTED_FEATURES = [
  // Core Features - Fully Implemented
  'members_directory',
  'companies_listing',
  'events_system',
  'news_blog',
  'groups_communities',
  'resources_library',
  'marketplace',
  'opportunities_board',
  'photo_galleries',
  'pages_system',
  'topics_system',

  // Social Features - Fully Implemented
  'user_messaging',

  // UI Features - Fully Implemented
  'dynamic_footer_menus',
  'newsletter_signup'
];

// Check if a feature is implemented
const isFeatureImplemented = (featureKey: string): boolean => {
  return IMPLEMENTED_FEATURES.includes(featureKey);
};

const FeatureManagementSection: React.FC<FeatureManagementSectionProps> = ({
  features,
  onUpdateFeature,
  onRefresh,
  isLoading
}) => {
  const [updatingFeatures, setUpdatingFeatures] = useState<Set<string>>(new Set());

  const handleToggleFeature = async (featureKey: string, enabled: boolean) => {
    // Check if feature is implemented
    if (enabled && !isFeatureImplemented(featureKey)) {
      toast((t) => (
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Feature Not Available
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              The <strong>{featureKey.replace(/_/g, ' ')}</strong> feature has not been implemented yet.
              Enabling it will have no effect until the feature is developed.
            </p>
          </div>
        </div>
      ), {
        duration: 6000,
        icon: '⚠️',
      });
      return;
    }

    setUpdatingFeatures(prev => new Set(prev).add(featureKey));

    try {
      await onUpdateFeature({
        feature_key: featureKey,
        enabled
      });
      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update feature toggle');
      console.error('Error updating feature:', error);
    } finally {
      setUpdatingFeatures(prev => {
        const newSet = new Set(prev);
        newSet.delete(featureKey);
        return newSet;
      });
    }
  };

  // Group features by category
  const featureCategories = [
    {
      title: 'Core Features',
      description: 'Essential platform functionality',
      icon: Zap,
      color: 'blue',
      features: features.filter(f => [
        'members_directory',
        'companies_listing',
        'events_system',
        'news_blog',
        'groups_communities',
        'resources_library',
        'marketplace',
        'opportunities_board',
        'photo_galleries',
        'pages_system',
        'topics_system'
      ].includes(f.feature_key))
    },
    {
      title: 'Social Features',
      description: 'Community interaction and engagement',
      icon: Users,
      color: 'green',
      features: features.filter(f => [
        'user_messaging',
        'social_feeds',
        'user_following',
        'content_likes',
        'content_comments',
        'content_sharing'
      ].includes(f.feature_key))
    },
    {
      title: 'Advanced Features',
      description: 'Enhanced functionality and integrations',
      icon: Wrench,
      color: 'purple',
      features: features.filter(f => [
        'advanced_search',
        'content_tagging',
        'notification_system',
        'calendar_integration',
        'payment_processing',
        'analytics_dashboard'
      ].includes(f.feature_key))
    },
    {
      title: 'Admin Features',
      description: 'Administrative tools and controls',
      icon: Shield,
      color: 'red',
      features: features.filter(f => [
        'bulk_operations',
        'audit_logging',
        'content_moderation',
        'user_management',
        'newsletter_system'
      ].includes(f.feature_key))
    },
    {
      title: 'Integration Features',
      description: 'External service integrations',
      icon: Globe,
      color: 'indigo',
      features: features.filter(f => [
        'api_access',
        'webhook_support',
        'sso_integration',
        'ldap_integration'
      ].includes(f.feature_key))
    },
    {
      title: 'Mobile & Experimental',
      description: 'Mobile features and experimental functionality',
      icon: Smartphone,
      color: 'orange',
      features: features.filter(f => [
        'mobile_app',
        'push_notifications',
        'offline_mode',
        'ai_content_suggestions',
        'automated_moderation',
        'smart_matching',
        'voice_features',
        'video_features'
      ].includes(f.feature_key))
    }
  ].filter(category => category.features.length > 0);

  const totalFeatures = features.length;
  const enabledFeatures = features.filter(f => f.enabled || false).length;
  const enabledPercentage = totalFeatures > 0 ? Math.round((enabledFeatures / totalFeatures) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Feature Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-900 dark:text-gray-100">Feature Toggle Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalFeatures}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{enabledFeatures}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Enabled Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{enabledPercentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Adoption Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {featureCategories.map((category) => {
          const Icon = category.icon;
          
          return (
            <Card key={category.title} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 text-${category.color}-600 dark:text-${category.color}-400`} />
                  <span className="text-gray-900 dark:text-gray-100">{category.title}</span>
                  <Badge variant="secondary">
                    {category.features.filter(f => f.enabled || false).length}/{category.features.length}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.features.map((feature) => {
                    const isUpdating = updatingFeatures.has(feature.feature_key);
                    const implemented = isFeatureImplemented(feature.feature_key);

                    return (
                      <div key={feature.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                        implemented
                          ? 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                          : 'border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {feature.feature_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            {(feature.enabled || false) && implemented && (
                              <Badge variant="success" size="sm">
                                Active
                              </Badge>
                            )}
                            {!implemented && (
                              <Badge variant="warning" size="sm" className="flex items-center space-x-1">
                                <Info className="h-3 w-3" />
                                <span>Not Implemented</span>
                              </Badge>
                            )}
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feature.description}</p>
                          )}
                          {!implemented && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center space-x-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>This feature is planned but not yet available. Enabling it will have no effect.</span>
                            </p>
                          )}
                          {((feature.rollout_percentage ?? 0) < 100) && ((feature.rollout_percentage ?? 0) > 0) && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              Rollout: {feature.rollout_percentage ?? 0}%
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          <Switch
                            checked={feature.enabled || false}
                            onCheckedChange={(checked) => handleToggleFeature(feature.feature_key, checked)}
                            disabled={isUpdating || isLoading}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureManagementSection;
