import React, { useState } from 'react';
import { 
  Settings, 
  // Toggle, - This export doesn't exist in lucide-react
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Building2,
  Calendar,
  Newspaper,
  Users2,
  BookOpen,
  ShoppingCart,
  Briefcase,
  Camera,
  MessageSquare,
  Heart,
  Share2,
  Search,
  Tag,
  Bell,
  BarChart3,
  Shield,
  UserCog,
  Mail,
  Zap,
  Smartphone,
  Brain,
  Mic,
  Video
} from 'lucide-react';
import { 
  useCoreFeatures, 
  useSocialFeatures, 
  useAdminFeatures, 
  useExperimentalFeatures,
  getFeatureDescription,
  getFeatureCategory
} from '@/hooks/useConditionalFeatures';
import { useFeatureToggles } from '@/utils/featureToggle';
import type { FeatureKey } from '@/types/settings';

interface FeatureCardProps {
  feature: FeatureKey;
  isEnabled: boolean;
  onToggle?: (feature: FeatureKey, enabled: boolean) => void;
  readOnly?: boolean;
}

const getFeatureIcon = (feature: FeatureKey) => {
  const iconMap: Record<FeatureKey, React.ReactNode> = {
    // Core Features
    'members_directory': <Users className="w-5 h-5" />,
    'companies_listing': <Building2 className="w-5 h-5" />,
    'events_system': <Calendar className="w-5 h-5" />,
    'news_blog': <Newspaper className="w-5 h-5" />,
    'groups_communities': <Users2 className="w-5 h-5" />,
    'resources_library': <BookOpen className="w-5 h-5" />,
    'marketplace': <ShoppingCart className="w-5 h-5" />,
    'opportunities_board': <Briefcase className="w-5 h-5" />,
    'photo_galleries': <Camera className="w-5 h-5" />,
    
    // Social Features
    'user_messaging': <MessageSquare className="w-5 h-5" />,
    'social_feeds': <Users2 className="w-5 h-5" />,
    'user_following': <Users className="w-5 h-5" />,
    'content_likes': <Heart className="w-5 h-5" />,
    'content_comments': <MessageSquare className="w-5 h-5" />,
    'content_sharing': <Share2 className="w-5 h-5" />,
    
    // Advanced Features
    'advanced_search': <Search className="w-5 h-5" />,
    'content_tagging': <Tag className="w-5 h-5" />,
    'notification_system': <Bell className="w-5 h-5" />,
    'calendar_integration': <Calendar className="w-5 h-5" />,
    'payment_processing': <ShoppingCart className="w-5 h-5" />,
    'analytics_dashboard': <BarChart3 className="w-5 h-5" />,
    
    // Admin Features
    'bulk_operations': <Settings className="w-5 h-5" />,
    'audit_logging': <Shield className="w-5 h-5" />,
    'content_moderation': <Shield className="w-5 h-5" />,
    'user_management': <UserCog className="w-5 h-5" />,
    'newsletter_system': <Mail className="w-5 h-5" />,
    
    // Integration Features
    'api_access': <Zap className="w-5 h-5" />,
    'webhook_support': <Zap className="w-5 h-5" />,
    'sso_integration': <Shield className="w-5 h-5" />,
    'ldap_integration': <Shield className="w-5 h-5" />,
    
    // Mobile Features
    'mobile_app': <Smartphone className="w-5 h-5" />,
    'push_notifications': <Bell className="w-5 h-5" />,
    'offline_mode': <Smartphone className="w-5 h-5" />,
    
    // Experimental Features
    'ai_content_suggestions': <Brain className="w-5 h-5" />,
    'automated_moderation': <Brain className="w-5 h-5" />,
    'smart_matching': <Brain className="w-5 h-5" />,
    'voice_features': <Mic className="w-5 h-5" />,
    'video_features': <Video className="w-5 h-5" />,
    
    // UI Features
    'dynamic_footer_menus': <Settings className="w-5 h-5" />,
    'newsletter_signup': <Mail className="w-5 h-5" />
  };

  return iconMap[feature] || <Settings className="w-5 h-5" />;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  feature, 
  isEnabled, 
  onToggle, 
  readOnly = false 
}) => {
  const category = getFeatureCategory(feature);
  const description = getFeatureDescription(feature);
  const icon = getFeatureIcon(feature);

  const handleToggle = () => {
    if (!readOnly && onToggle) {
      onToggle(feature, !isEnabled);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Social': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border transition-all ${
      isEnabled ? 'border-green-200 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isEnabled 
              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white capitalize">
              {feature.replace(/_/g, ' ')}
            </h3>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(category)}`}>
              {category}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-gray-400" />
          )}
          
          {!readOnly && (
            <button
              onClick={handleToggle}
              className={`p-1 rounded transition-colors ${
                isEnabled 
                  ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900' 
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={`${isEnabled ? 'Disable' : 'Enable'} ${feature}`}
            >
              {isEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
      
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={`font-medium ${
          isEnabled ? 'text-green-600' : 'text-gray-500'
        }`}>
          {isEnabled ? 'Active' : 'Inactive'}
        </span>
        
        {category === 'Core' && (
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            Essential
          </span>
        )}
      </div>
    </div>
  );
};

interface FeatureDashboardProps {
  readOnly?: boolean;
  onFeatureToggle?: (feature: FeatureKey, enabled: boolean) => void;
}

export const FeatureDashboard: React.FC<FeatureDashboardProps> = ({ 
  readOnly = true, 
  onFeatureToggle 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);

  // Get all features
  const allFeatures: FeatureKey[] = [
    // Core Features
    'members_directory', 'companies_listing', 'events_system', 'news_blog',
    'groups_communities', 'resources_library', 'marketplace', 'opportunities_board', 'photo_galleries',
    
    // Social Features
    'user_messaging', 'social_feeds', 'user_following', 'content_likes', 'content_comments', 'content_sharing',
    
    // Advanced Features
    'advanced_search', 'content_tagging', 'notification_system', 'calendar_integration', 
    'payment_processing', 'analytics_dashboard',
    
    // Admin Features
    'bulk_operations', 'audit_logging', 'content_moderation', 'user_management', 'newsletter_system',
    
    // Integration Features
    'api_access', 'webhook_support', 'sso_integration', 'ldap_integration',
    
    // Mobile Features
    'mobile_app', 'push_notifications', 'offline_mode',
    
    // Experimental Features
    'ai_content_suggestions', 'automated_moderation', 'smart_matching', 'voice_features', 'video_features'
  ];

  const { toggles, loading } = useFeatureToggles(allFeatures);
  const coreFeatures = useCoreFeatures();
  const socialFeatures = useSocialFeatures();
  const adminFeatures = useAdminFeatures();
  const experimentalFeatures = useExperimentalFeatures();

  const categories = ['All', 'Core', 'Social', 'Advanced', 'Admin', 'Integration', 'Mobile', 'Experimental'];

  const filteredFeatures = allFeatures.filter(feature => {
    const category = getFeatureCategory(feature);
    const isEnabled = toggles[feature] === true;
    
    if (selectedCategory !== 'All' && category !== selectedCategory) return false;
    if (showOnlyEnabled && !isEnabled) return false;
    
    return true;
  });

  const enabledCount = Object.values(toggles).filter(Boolean).length;
  const totalCount = allFeatures.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Feature Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and monitor platform features
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {enabledCount}/{totalCount}
            </div>
            <div className="text-sm text-gray-500">Features Active</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(enabledCount / totalCount) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{Math.round((enabledCount / totalCount) * 100)}% Complete</span>
          <span>{totalCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlyEnabled(!showOnlyEnabled)}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded-full transition-colors ${
                showOnlyEnabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {showOnlyEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {showOnlyEnabled ? 'Enabled Only' : 'Show All'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map(feature => (
          <FeatureCard
            key={feature}
            feature={feature}
            isEnabled={toggles[feature] === true}
            onToggle={onFeatureToggle}
            readOnly={readOnly}
          />
        ))}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No features found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your filters to see more features.
          </p>
        </div>
      )}

      {/* Feature Categories Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {coreFeatures.enabledCount}/{coreFeatures.totalCount}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Core Features</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Object.values(socialFeatures.features).filter(Boolean).length}/6
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Social Features</div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {Object.values(adminFeatures.features).filter(Boolean).length}/5
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">Admin Features</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Object.values(experimentalFeatures.features).filter(Boolean).length}/5
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Experimental</div>
        </div>
      </div>
    </div>
  );
};