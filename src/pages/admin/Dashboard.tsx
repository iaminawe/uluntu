import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminStatsApi } from '@/api/admin/stats';
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
  Activity
} from 'lucide-react';

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  change?: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCard> = ({ title, value, icon: Icon, change, loading }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {loading ? '...' : value.toLocaleString()}
        </p>
        {change !== undefined && (
          <p className="mt-2 text-sm">
            <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-gray-600"> from last month</span>
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminStatsApi.getDashboardStats()
  });

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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your platform's activity and statistics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={isLoading} />
        ))}
      </div>

      {/* Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Moderation Alert */}
        {stats?.pendingModeration && stats.pendingModeration > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-yellow-900">
                  Pending Moderation Items
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  You have {stats.pendingModeration} items waiting for review.
                </p>
                <a
                  href="/admin/moderation"
                  className="mt-4 inline-flex items-center text-sm font-medium text-yellow-900 hover:text-yellow-700"
                >
                  Review items
                  <span className="ml-1">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Admin Activity
            </h3>
          </div>
          <div className="p-6">
            {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start text-sm">
                    <Activity className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-gray-900">
                        <span className="font-medium">{activity.admin?.email || 'Unknown'}</span>
                        {' '}
                        {activity.action} {activity.entity_type}
                      </p>
                      <p className="text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Platform Health
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Database Storage</span>
                <span className="text-gray-900 font-medium">23%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">API Rate Limit</span>
                <span className="text-gray-900 font-medium">45%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Users (24h)</span>
                <span className="text-gray-900 font-medium">{stats?.totalUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;