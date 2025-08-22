import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Plus,
  Search,
  Filter,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useDashboardData, useUserContent } from '../hooks/useDashboardData';
import { AnalyticsOverview } from '../AnalyticsOverview';
import { ActivityStream } from '../ActivityStream';
import { ContentGrid } from '../ContentGrid';
import { QuickActions } from '../QuickActions';
import { DashboardTabs } from '../DashboardTabs';
import { NotificationDropdown } from '../NotificationDropdown';
import { KeyMetrics } from '../KeyMetrics';
import AnalyticsTab from '../AnalyticsTab';
import CompaniesTab from '../CompaniesTab';
import { ContentType, DashboardLayout } from '../../types';
import MessagesTab from '../MessagesTab';
import ActivityTab from '../ActivityTab';
import ContentSubTabs from '../ContentSubTabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';

const DASHBOARD_TABS = [
  { id: 'all', label: 'All Content', icon: Grid3X3, type: 'all' as ContentType },
  { id: 'companies', label: 'Companies', icon: Building2, type: 'company' as ContentType },
  { id: 'groups', label: 'Groups', icon: Users, type: 'group' as ContentType },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, type: 'analytics' as ContentType },
  { id: 'messages', label: 'Messages', icon: MessageCircle, type: 'message' as ContentType },
  { id: 'activity', label: 'Activity', icon: Activity, type: 'activity' as ContentType },
];

const CONTENT_SUB_TABS = [
  { id: 'galleries', label: 'Photo Galleries', icon: Camera, type: 'gallery' as ContentType },
  { id: 'events', label: 'Events', icon: Calendar, type: 'event' as ContentType },
  { id: 'news', label: 'News', icon: Newspaper, type: 'news' as ContentType },
  { id: 'resources', label: 'Resources', icon: BookOpen, type: 'resource' as ContentType },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, type: 'marketplace' as ContentType },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase, type: 'opportunity' as ContentType },
];

export const UserDashboard: React.FC = () => {
  const { user } = useSession();
  const { tab = 'all' } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [layout, setLayout] = useState<DashboardLayout>({
    sidebar: { collapsed: false, pinned: true },
    contentView: 'grid',
    activeTab: tab,
    filters: {}
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<string>('galleries');

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

  // Get filtered content based on active tab and sub-tab
  const getContentType = () => {
    if (layout.activeTab === 'all') {
      // If "All Content" is selected, use the sub-tab to determine content type
      return [activeSubTab as ContentType];
    } else if (layout.activeTab === 'messages' || layout.activeTab === 'activity' || layout.activeTab === 'analytics' || layout.activeTab === 'groups' || layout.activeTab === 'companies') {
      // For non-content tabs, use the tab itself
      return [layout.activeTab as ContentType];
    }
    return undefined;
  };

  const { 
    data: contentData, 
    isLoading: contentLoading, 
    error: contentError 
  } = useUserContent({
    type: getContentType(),
    search: searchQuery,
    ...layout.filters
  }, 1, 20);

  // Combine tab data with counts
  const tabsWithCounts = useMemo(() => {
    return DASHBOARD_TABS.map(tab => {
      // For special tabs (messages, activity, analytics, companies), show with zero count for now
      if (tab.id === 'messages' || tab.id === 'activity' || tab.id === 'analytics' || tab.id === 'companies') {
        return { ...tab, count: 0 };
      }
      
      if (!dashboardData?.contentSummary) {
        return { ...tab, count: 0 };
      }
      
      if (tab.id === 'all') {
        const totalCount = dashboardData.contentSummary.reduce((sum, item) => sum + item.count, 0);
        return { ...tab, count: totalCount };
      }
      
      const summary = dashboardData.contentSummary.find(item => item.type === tab.type);
      return { ...tab, count: summary?.count || 0 };
    });
  }, [dashboardData?.contentSummary]);

  // Combine sub-tab data with counts
  const subTabsWithCounts = useMemo(() => {
    return CONTENT_SUB_TABS.map(tab => {
      if (!dashboardData?.contentSummary) {
        return { ...tab, count: 0 };
      }
      
      const summary = dashboardData.contentSummary.find(item => item.type === tab.type);
      return { ...tab, count: summary?.count || 0 };
    });
  }, [dashboardData?.contentSummary]);

  const handleTabChange = (tabId: string) => {
    // Navigate to the new tab URL
    if (tabId === 'all') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tabId}`);
    }
  };

  const handleSubTabChange = (subTabId: string) => {
    setActiveSubTab(subTabId);
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setLayout(prev => ({ ...prev, contentView: view }));
  };

  const handleFilterChange = (filters: any) => {
    setLayout(prev => ({ ...prev, filters }));
  };

  const toggleSidebar = () => {
    setLayout(prev => ({ 
      ...prev, 
      sidebar: { 
        ...prev.sidebar, 
        collapsed: !prev.sidebar.collapsed 
      } 
    }));
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex min-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
        {/* Sidebar */}
        <div className={`${
          layout.sidebar.collapsed ? 'w-0' : 'w-80'
        } transition-all duration-300 ease-in-out bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0`}>
          <div className="p-6 space-y-6">
            {/* Quick Actions */}
            <QuickActions />


            {/* Activity Stream */}
            {dashboardData?.recentActivity && (
              <ActivityStream 
                activities={dashboardData.recentActivity} 
              />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sidebar Toggle & Content Header */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label={layout.sidebar.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {layout.sidebar.collapsed ? (
                    <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  )}
                </button>
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
                    onClick={() => handleViewChange('grid')}
                    className={`p-2 ${layout.contentView === 'grid' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleViewChange('list')}
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

                {/* Quick Create */}
                <button className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {/* Key Metrics */}
              {dashboardData?.stats && (
                <KeyMetrics stats={dashboardData.stats} />
              )}

              {/* Main Tabs */}
              <DashboardTabs
                tabs={tabsWithCounts}
                activeTab={layout.activeTab}
                onTabChange={handleTabChange}
              />

              {/* Sub-tabs for All Content */}
              {layout.activeTab === 'all' && (
                <ContentSubTabs
                  tabs={subTabsWithCounts}
                  activeTab={activeSubTab}
                  onTabChange={handleSubTabChange}
                />
              )}

              {/* Content Area */}
              {contentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : contentError ? (
                <ErrorDisplay error={contentError} />
              ) : (
                <>
                  {/* Messages Tab */}
                  {layout.activeTab === 'messages' ? (
                    <MessagesTab
                      contentType="message"
                      data={{
                        statistics: {
                          totalConversations: 0,
                          unreadMessages: 0,
                          recentActivity: 0,
                        },
                        conversations: [],
                        announcements: [],
                        notifications: [],
                      }}
                      loading={contentLoading}
                      error={contentError}
                      onRefresh={() => window.location.reload()}
                      onCreateMessage={() => console.log('Create message')}
                      onCreateAnnouncement={() => console.log('Create announcement')}
                      onMarkAsRead={(id) => console.log('Mark as read:', id)}
                    />
                  ) : layout.activeTab === 'activity' ? (
                    <ActivityTab
                      contentType="activity"
                      data={{
                        statistics: {
                          totalActivities: 0,
                          todayActivities: 0,
                          weekActivities: 0,
                          monthActivities: 0,
                        },
                        activities: [],
                      }}
                      loading={contentLoading}
                      error={contentError}
                      onRefresh={() => window.location.reload()}
                      onViewDetails={(activity) => console.log('View activity:', activity)}
                    />
                  ) : layout.activeTab === 'analytics' ? (
                    <AnalyticsTab
                      contentType="analytics"
                      data={{
                        analytics: dashboardData?.analytics || {
                          views: 0,
                          engagements: 0,
                          shares: 0,
                          comments: 0,
                          likes: 0,
                          viewsHistory: [],
                          engagementRate: 0,
                          topReferrers: []
                        },
                        stats: dashboardData?.stats || {
                          totalContent: 0,
                          totalViews: 0,
                          totalEngagement: 0,
                          weeklyGrowth: { content: 0, views: 0, engagement: 0 },
                          contentByType: {
                            events: 0,
                            news: 0,
                            resources: 0,
                            groups: 0,
                            marketplace: 0,
                            opportunities: 0,
                            galleries: 0,
                            messages: 0
                          }
                        }
                      }}
                      loading={contentLoading}
                      error={contentError}
                      onRefresh={() => window.location.reload()}
                    />
                  ) : layout.activeTab === 'companies' ? (
                    <CompaniesTab
                      contentType="company"
                      loading={contentLoading}
                      error={contentError}
                      onRefresh={() => window.location.reload()}
                    />
                  ) : (
                    <ContentGrid
                      content={contentData?.data || []}
                      view={layout.contentView}
                      isLoading={contentLoading}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;