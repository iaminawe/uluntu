import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid3X3,
  List,
  Camera,
  Calendar,
  Newspaper,
  BookOpen,
  Users,
  ShoppingBag,
  Briefcase,
  MessageCircle,
  Activity,
  BarChart3,
  Building2,
  Search,
  Filter
} from 'lucide-react';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useDashboardData } from '../hooks/useDashboardData';
import { NotificationDropdown } from '../NotificationDropdown';
import { KeyMetrics } from '../KeyMetrics';
import { ContentType, DashboardLayout } from '../../types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';
import { VerticalTabSet } from '../VerticalTabSet';
import { useEnabledFeatures } from '@/hooks/useSettings';
import type { FeatureKey } from '@/types/settings';

// Tab with optional feature requirement
interface DashboardTab {
  id: string;
  label: string;
  icon: any;
  type: ContentType;
  feature?: FeatureKey; // Optional feature requirement
}

// Convert horizontal tabs to vertical content tabs with feature requirements
const ALL_CONTENT_TABS: DashboardTab[] = [
  { id: 'galleries', label: 'Photo Galleries', icon: Camera, type: 'gallery' as ContentType, feature: 'photo_galleries' },
  { id: 'events', label: 'Events', icon: Calendar, type: 'event' as ContentType, feature: 'events_system' },
  { id: 'news', label: 'News', icon: Newspaper, type: 'news' as ContentType, feature: 'news_blog' },
  { id: 'resources', label: 'Resources', icon: BookOpen, type: 'resource' as ContentType, feature: 'resources_library' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, type: 'marketplace' as ContentType, feature: 'marketplace' },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase, type: 'opportunity' as ContentType, feature: 'opportunities_board' },
  { id: 'groups', label: 'My Groups', icon: Users, type: 'group' as ContentType, feature: 'groups_communities' },
  { id: 'companies', label: 'My Companies', icon: Building2, type: 'company' as ContentType, feature: 'companies_listing' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, type: 'analytics' as ContentType }, // No feature requirement
  { id: 'messages', label: 'Messages', icon: MessageCircle, type: 'message' as ContentType, feature: 'user_messaging' },
  { id: 'activity', label: 'Activity', icon: Activity, type: 'activity' as ContentType }, // No feature requirement
];

export const UserDashboard: React.FC = () => {
  const { user } = useSession();
  const { tab = 'galleries' } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { isFeatureEnabled } = useEnabledFeatures();
  
  const [layout, setLayout] = useState<DashboardLayout>({
    sidebar: { collapsed: false, pinned: true },
    contentView: 'grid',
    activeTab: tab,
    filters: {}
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Update activeTab when URL changes
  useEffect(() => {
    setLayout(prev => ({ ...prev, activeTab: tab }));
  }, [tab]);

  // Get dashboard overview data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useDashboardData();

  // Filter tabs based on enabled features
  const enabledTabs = useMemo(() => {
    return ALL_CONTENT_TABS.filter(tab => {
      // If tab has no feature requirement, always show it
      if (!tab.feature) return true;

      // Otherwise, check if the feature is enabled
      return isFeatureEnabled(tab.feature);
    });
  }, [isFeatureEnabled]);

  // Combine tab data with counts
  const tabsWithCounts = useMemo(() => {
    return enabledTabs.map(tab => {
      // For special tabs (messages, activity, analytics), show with zero count for now
      if (tab.id === 'messages' || tab.id === 'activity' || tab.id === 'analytics') {
        return { ...tab, count: 0 };
      }

      if (!dashboardData?.contentSummary) {
        return { ...tab, count: 0 };
      }

      const summary = dashboardData.contentSummary.find(item => item.type === tab.type);
      return { ...tab, count: summary?.count || 0 };
    });
  }, [enabledTabs, dashboardData?.contentSummary]);

  const handleTabChange = (tabId: string) => {
    // Check if the tab is enabled
    const requestedTab = ALL_CONTENT_TABS.find(t => t.id === tabId);
    if (requestedTab?.feature && !isFeatureEnabled(requestedTab.feature)) {
      // Redirect to first available tab if requested tab is disabled
      const firstEnabledTab = enabledTabs[0];
      if (firstEnabledTab) {
        if (firstEnabledTab.id === 'galleries') {
          navigate('/dashboard');
        } else {
          navigate(`/dashboard/${firstEnabledTab.id}`);
        }
      }
      return;
    }

    // Navigate to the new tab URL
    if (tabId === 'galleries') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tabId}`);
    }
  };

  // Redirect to first enabled tab if current tab is disabled
  useEffect(() => {
    const currentTab = ALL_CONTENT_TABS.find(t => t.id === tab);
    if (currentTab?.feature && !isFeatureEnabled(currentTab.feature)) {
      const firstEnabledTab = enabledTabs[0];
      if (firstEnabledTab) {
        if (firstEnabledTab.id === 'galleries') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate(`/dashboard/${firstEnabledTab.id}`, { replace: true });
        }
      }
    }
  }, [tab, enabledTabs, isFeatureEnabled, navigate]);

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <ErrorDisplay 
          error={dashboardError} 
          retry={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Welcome back, {user?.email?.split('@')[0]}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
                <button
                  onClick={() => setLayout(prev => ({ ...prev, contentView: 'grid' }))}
                  className={`p-2 ${layout.contentView === 'grid' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLayout(prev => ({ ...prev, contentView: 'list' }))}
                  className={`p-2 ${layout.contentView === 'list' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg"
              >
                <Filter className="h-4 w-4" />
              </button>

              {/* Notifications */}
              <NotificationDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        {dashboardData?.stats && (
          <KeyMetrics stats={dashboardData.stats} />
        )}

        {/* Vertical Tab Layout */}
        <VerticalTabSet
          tabs={tabsWithCounts}
          activeTab={layout.activeTab || 'galleries'}
          onTabChange={handleTabChange}
          showCreateButton={true}
        />
      </div>
    </div>
  );
};

export default UserDashboard;