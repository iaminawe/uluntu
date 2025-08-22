import React, { useState } from 'react';
import { ActivityTabProps } from '../../types';
import ContentCard from '../ContentCard';
import Card from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';
import { Activity, Clock, TrendingUp, Users } from 'lucide-react';

/**
 * Activity Tab Component
 * Displays user's activity feed and recent interactions
 */
const ActivityTab: React.FC<ActivityTabProps> = ({
  contentType,
  data,
  loading = false,
  error = null,
  onRefresh,
  onViewDetails,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'content' | 'interactions' | 'system'>('all');
  const [timeFrame, setTimeFrame] = useState<'today' | 'week' | 'month' | 'all'>('week');

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load activity"
        message={error}
        retry={onRefresh}
      />
    );
  }

  const statistics = data.statistics || {
    totalActivities: 0,
    todayActivities: 0,
    weekActivities: 0,
    monthActivities: 0,
  };

  const getFilteredActivities = () => {
    let activities = data.activities || [];
    
    // Filter by type
    if (activeFilter !== 'all') {
      activities = activities.filter(activity => activity.type === activeFilter);
    }
    
    // Filter by time frame
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    switch (timeFrame) {
      case 'today':
        activities = activities.filter(activity => new Date(activity.createdAt) >= today);
        break;
      case 'week':
        activities = activities.filter(activity => new Date(activity.createdAt) >= weekAgo);
        break;
      case 'month':
        activities = activities.filter(activity => new Date(activity.createdAt) >= monthAgo);
        break;
      default:
        // Show all
        break;
    }
    
    return activities;
  };

  const filteredActivities = getFilteredActivities();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content':
        return '📝';
      case 'interactions':
        return '💬';
      case 'system':
        return '🔧';
      default:
        return '📌';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'content':
        return 'Content';
      case 'interactions':
        return 'Interactions';
      case 'system':
        return 'System';
      default:
        return 'Activity';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Activities</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.totalActivities}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.todayActivities}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Week</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.weekActivities}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.monthActivities}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Activity Feed
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Track your recent actions and interactions
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Time Frame Filter */}
              <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'Week' },
                  { id: 'month', label: 'Month' },
                  { id: 'all', label: 'All' },
                ].map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setTimeFrame(period.id as any)}
                    className={`py-1 px-3 text-sm font-medium rounded-md transition-colors ${
                      timeFrame === period.id
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Activity Type Filter */}
              <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                {[
                  { id: 'all', label: 'All', count: data.activities?.length || 0 },
                  { id: 'content', label: 'Content', count: data.activities?.filter(a => a.type === 'content').length || 0 },
                  { id: 'interactions', label: 'Social', count: data.activities?.filter(a => a.type === 'interactions').length || 0 },
                  { id: 'system', label: 'System', count: data.activities?.filter(a => a.type === 'system').length || 0 },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as any)}
                    className={`flex items-center space-x-2 py-1 px-3 text-sm font-medium rounded-md transition-colors ${
                      activeFilter === filter.id
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{getActivityIcon(filter.id)}</span>
                    <span>{filter.label}</span>
                    {filter.count > 0 && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-bold rounded-full ${
                        activeFilter === filter.id
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                      }`}>
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} hasImage={false} lines={2} />
          ))}
        </div>
      )}

      {/* Activity Feed */}
      {!loading && filteredActivities.length > 0 && (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    activity.type === 'content' ? 'bg-blue-100 dark:bg-blue-900' :
                    activity.type === 'interactions' ? 'bg-green-100 dark:bg-green-900' :
                    activity.type === 'system' ? 'bg-orange-100 dark:bg-orange-900' :
                    'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        activity.type === 'content' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        activity.type === 'interactions' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        activity.type === 'system' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      }`}>
                        {getActivityTypeLabel(activity.type)}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {onViewDetails && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(activity)}
                        className="text-xs"
                      >
                        View
                      </Button>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                    {activity.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {activity.description}
                  </p>
                  
                  {activity.metadata && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                        >
                          <strong className="mr-1">{key}:</strong> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredActivities.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No Activity Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                {activeFilter === 'all' && timeFrame === 'all'
                  ? 'Start engaging with the community to see your activity here.'
                  : `No ${activeFilter === 'all' ? '' : getActivityTypeLabel(activeFilter).toLowerCase() + ' '}activity found for the selected time period.`
                }
              </p>
              <div className="space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveFilter('all');
                    setTimeFrame('all');
                  }}
                >
                  Show All Activity
                </Button>
                {onRefresh && (
                  <Button onClick={onRefresh}>
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Activity Summary */}
      {!loading && filteredActivities.length > 0 && (
        <Card className="p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Showing {filteredActivities.length} of {data.activities?.length || 0} activities
              {activeFilter !== 'all' && ` (${getActivityTypeLabel(activeFilter)} only)`}
              {timeFrame !== 'all' && ` from the ${timeFrame === 'today' ? 'last day' : `last ${timeFrame}`}`}
            </span>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Refresh
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ActivityTab;