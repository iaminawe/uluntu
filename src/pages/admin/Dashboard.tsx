import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminStatsApi } from '@/features/admin/api/stats';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import MetricsCard from '@/components/charts/MetricsCard';
import TimeRangeSelector, { TimeRangeValue } from '@/components/charts/TimeRangeSelector';
import {
  Users,
  Building2,
  UsersRound,
  Calendar,
  Newspaper,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  UserPlus,
  Eye,
  MousePointer
} from 'lucide-react';

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  change?: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCard> = ({ title, value, icon: Icon, change, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {loading ? '...' : value.toLocaleString()}
        </p>
        {change !== undefined && (
          <p className="mt-2 text-sm">
            <span className={`${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-medium`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-gray-600 dark:text-gray-400"> from last month</span>
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-full">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [signupTimeRange, setSignupTimeRange] = useState<TimeRangeValue>({ type: 'month' });
  const [engagementTimeRange, setEngagementTimeRange] = useState<TimeRangeValue>({ type: 'month' });

  // Fetch stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminStatsApi.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  // Fetch user signup analytics
  const { data: signupData, isLoading: signupLoading } = useQuery({
    queryKey: ['user-signup-analytics', signupTimeRange],
    queryFn: () => adminStatsApi.getUserSignupAnalytics(
      signupTimeRange.type,
      signupTimeRange.startDate,
      signupTimeRange.endDate
    ),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000
  });

  // Fetch page views and engagement
  const { data: engagementData, isLoading: engagementLoading } = useQuery({
    queryKey: ['page-views-engagement', engagementTimeRange],
    queryFn: () => adminStatsApi.getPageViewsAndEngagement(
      engagementTimeRange.type,
      engagementTimeRange.startDate,
      engagementTimeRange.endDate
    ),
    refetchInterval: 60000,
    staleTime: 30000
  });

  // Debug logging for development
  if (import.meta.env.DEV && stats) {
    console.log('📊 Dashboard Stats:', stats);
  }

  if (error) {
    console.error('Dashboard stats error:', error);
  }

  const statCards = [
    { title: 'Total Members', value: stats?.totalMembers || 0, icon: Users },
    { title: 'Companies', value: stats?.totalCompanies || 0, icon: Building2 },
    { title: 'Groups', value: stats?.totalGroups || 0, icon: UsersRound },
    { title: 'Events', value: stats?.totalEvents || 0, icon: Calendar },
    { title: 'News Articles', value: stats?.totalNews || 0, icon: Newspaper },
    { title: 'Resources', value: stats?.totalResources || 0, icon: BookOpen },
    { title: 'Marketplace', value: stats?.totalMarketplaceListings || 0, icon: ShoppingBag },
    { title: 'Opportunities', value: stats?.totalOpportunities || 0, icon: Briefcase }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Overview of your platform's activity and statistics
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-400">
              Unable to load dashboard data. Using cached or default values.
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={isLoading} />
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* User Signups Chart */}
        <MetricsCard 
          title="User Signups" 
          icon={UserPlus}
          subtitle={signupData?.dateRangeLabel || 'Loading...'}
        >
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {signupData?.totalSignups || 0} new users
            </div>
            <TimeRangeSelector
              value={signupTimeRange}
              onChange={setSignupTimeRange}
            />
          </div>
          {signupLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-gray-400">Loading signup data...</div>
            </div>
          ) : (
            <LineChart
              data={signupData?.data || []}
              labels={signupData?.labels || []}
              color="#10b981"
              height={180}
            />
          )}
        </MetricsCard>

        {/* Page Views and Engagement */}
        <MetricsCard 
          title="Page Views & Engagement" 
          icon={Eye}
          subtitle={engagementData?.dateRangeLabel || 'Loading...'}
        >
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {engagementData?.totalPageViews?.toLocaleString() || '0'} page views,{' '}
              {engagementData?.totalInteractions || 0} interactions
            </div>
            <TimeRangeSelector
              value={engagementTimeRange}
              onChange={setEngagementTimeRange}
            />
          </div>
          {engagementLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-gray-400">Loading engagement data...</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Views
                </div>
                <LineChart
                  data={engagementData?.pageViews || []}
                  labels={engagementData?.labels || []}
                  color="#3b82f6"
                  height={120}
                  showGrid={false}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Interactions
                </div>
                <BarChart
                  data={engagementData?.interactions || []}
                  labels={engagementData?.labels || []}
                  color="#f59e0b"
                  height={120}
                  showGrid={false}
                />
              </div>
            </div>
          )}
        </MetricsCard>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Avg Page Views</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {engagementData?.avgDailyPageViews?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-full">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Signups</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {signupData?.data ? signupData.data.slice(-7).reduce((sum, count) => sum + count, 0) : 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900 rounded-full">
              <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Rate</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {engagementData?.totalPageViews && engagementData?.totalInteractions
                  ? `${Math.round((engagementData.totalInteractions / engagementData.totalPageViews) * 100 * 100) / 100}%`
                  : '0%'
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Interactions/Views</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-full">
              <MousePointer className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Moderation Alert */}
        {Boolean(stats?.pendingModeration && stats.pendingModeration > 0) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100">
                  Pending Moderation Items
                </h3>
                <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  You have {stats.pendingModeration} items waiting for review.
                </p>
                <a
                  href="/admin/moderation"
                  className="mt-4 inline-flex items-center text-sm font-medium text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-200"
                >
                  Review items
                  <span className="ml-1">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Admin Activity
            </h3>
          </div>
          <div className="p-6">
            {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={(activity as any).id} className="flex items-start text-sm">
                    <Activity className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">
                        <span className="font-medium">{(activity as any).admin?.email || 'Unknown'}</span>
                        {' '}
                        {(activity as any).action} {(activity as any).entity_type}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {new Date((activity as any).created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              Platform Health
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Database Storage</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">23%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full" style={{ width: '23%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">API Rate Limit</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">45%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Active Users (24h)</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {stats?.totalMembers?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;