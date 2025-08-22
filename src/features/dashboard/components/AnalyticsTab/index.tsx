import React from 'react';
import { AnalyticsOverview } from '../AnalyticsOverview';
import { ContentAnalytics, DashboardStats } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users, 
  Calendar,
  Activity
} from 'lucide-react';

interface AnalyticsTabProps {
  contentType: 'analytics';
  data: {
    analytics: ContentAnalytics;
    stats: DashboardStats;
  };
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  data,
  loading,
  error,
  onRefresh,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-200 dark:bg-slate-700 h-64 rounded-lg"></div>
            <div className="bg-slate-200 dark:bg-slate-700 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-slate-500 dark:text-slate-400 mb-4">
          Failed to load analytics data
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const contentTypeStats = [
    { 
      label: 'Events', 
      value: data.stats.contentByType.events, 
      icon: Calendar,
      color: 'bg-blue-500'
    },
    { 
      label: 'News', 
      value: data.stats.contentByType.news, 
      icon: Activity,
      color: 'bg-green-500'
    },
    { 
      label: 'Resources', 
      value: data.stats.contentByType.resources, 
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    { 
      label: 'Groups', 
      value: data.stats.contentByType.groups, 
      icon: Users,
      color: 'bg-orange-500'
    },
    { 
      label: 'Galleries', 
      value: data.stats.contentByType.galleries, 
      icon: Eye,
      color: 'bg-pink-500'
    },
    { 
      label: 'Marketplace', 
      value: data.stats.contentByType.marketplace, 
      icon: TrendingUp,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Content Type Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Content Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {contentTypeStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Performance Overview
          </h3>
          <AnalyticsOverview analytics={data.analytics} />
        </div>

        {/* Growth Metrics */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Weekly Growth
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Content Growth
              </span>
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-4 w-4 ${
                  data.stats.weeklyGrowth.content >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`} />
                <span className={`text-sm font-semibold ${
                  data.stats.weeklyGrowth.content >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.stats.weeklyGrowth.content > 0 ? '+' : ''}{data.stats.weeklyGrowth.content}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Views Growth
              </span>
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-4 w-4 ${
                  data.stats.weeklyGrowth.views >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`} />
                <span className={`text-sm font-semibold ${
                  data.stats.weeklyGrowth.views >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.stats.weeklyGrowth.views > 0 ? '+' : ''}{data.stats.weeklyGrowth.views}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Engagement Growth
              </span>
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-4 w-4 ${
                  data.stats.weeklyGrowth.engagement >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`} />
                <span className={`text-sm font-semibold ${
                  data.stats.weeklyGrowth.engagement >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.stats.weeklyGrowth.engagement > 0 ? '+' : ''}{data.stats.weeklyGrowth.engagement}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;