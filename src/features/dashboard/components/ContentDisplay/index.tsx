import React, { useState } from 'react';
import { 
  Search,
  Filter,
  X,
  Grid3X3,
  List
} from 'lucide-react';
import { ContentGrid } from '../ContentGrid';
import { ContentFilters } from '../ContentFilters';
import { ViewModeToggle } from '../ViewModeToggle';
import { SortDropdown } from '../SortDropdown';
import { useUserContent } from '../../hooks/useDashboardData';
import { ContentType } from '../../types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';
import MessagesTab from '../MessagesTab';
import ActivityTab from '../ActivityTab';
import AnalyticsTab from '../AnalyticsTab';
import CompaniesTab from '../CompaniesTab';
import { GroupsTab } from '../GroupsTab';

interface ContentDisplayProps {
  activeTab: string;
}

const getTabLabel = (tabId: string): string => {
  const labels: Record<string, string> = {
    galleries: 'Photo Galleries',
    events: 'Events',
    news: 'News',
    resources: 'Resources',
    marketplace: 'Marketplace',
    opportunities: 'Opportunities',
    groups: 'Groups',
    companies: 'Companies',
    analytics: 'Analytics',
    messages: 'Messages',
    activity: 'Activity'
  };
  return labels[tabId] || tabId.charAt(0).toUpperCase() + tabId.slice(1);
};

export const ContentDisplay: React.FC<ContentDisplayProps> = ({ activeTab }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Get content for non-special tabs
  const shouldFetchContent = !['messages', 'activity', 'analytics', 'companies', 'groups'].includes(activeTab);
  
  const { 
    data: contentData, 
    isLoading: contentLoading, 
    error: contentError 
  } = useUserContent({
    type: shouldFetchContent ? [activeTab as ContentType] : undefined,
    search: searchQuery,
    sortBy,
    ...filters
  }, 1, 20);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (['messages', 'activity', 'analytics', 'companies', 'groups'].includes(activeTab)) {
    // Render special tabs
    if (activeTab === 'messages') {
      return (
        <div className="p-6">
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
            loading={false}
            error={null}
            onRefresh={() => window.location.reload()}
            onCreateMessage={() => console.log('Create message')}
            onCreateAnnouncement={() => console.log('Create announcement')}
            onMarkAsRead={(id) => console.log('Mark as read:', id)}
          />
        </div>
      );
    }

    if (activeTab === 'activity') {
      return (
        <div className="p-6">
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
            loading={false}
            error={null}
            onRefresh={() => window.location.reload()}
            onViewDetails={(activity) => console.log('View activity:', activity)}
          />
        </div>
      );
    }

    if (activeTab === 'analytics') {
      return (
        <div className="p-6">
          <AnalyticsTab
            contentType="analytics"
            data={{
              analytics: {
                views: 0,
                engagements: 0,
                shares: 0,
                comments: 0,
                likes: 0,
                viewsHistory: [],
                engagementRate: 0,
                topReferrers: []
              },
              stats: {
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
            loading={false}
            error={null}
            onRefresh={() => window.location.reload()}
          />
        </div>
      );
    }

    if (activeTab === 'companies') {
      return (
        <div className="p-6">
          <CompaniesTab
            contentType="company"
            loading={false}
            error={null}
            onRefresh={() => window.location.reload()}
          />
        </div>
      );
    }

    if (activeTab === 'groups') {
      return (
        <div className="p-6">
          <GroupsTab
            contentType="group"
            loading={false}
            error={null}
            onRefresh={() => window.location.reload()}
          />
        </div>
      );
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {getTabLabel(activeTab)}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your {activeTab} content
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <SortDropdown value={sortBy} onChange={setSortBy} />

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <ContentFilters
          activeTab={activeTab}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Content Grid/List */}
      {contentLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : contentError ? (
        <ErrorDisplay error={contentError} />
      ) : (
        <ContentGrid
          content={contentData?.data || []}
          view={viewMode}
          isLoading={contentLoading}
        />
      )}
    </div>
  );
};

export default ContentDisplay;