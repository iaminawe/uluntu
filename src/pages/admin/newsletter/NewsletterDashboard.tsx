import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Calendar, 
  Eye, 
  Send,
  Plus,
  Settings,
  FileText
} from 'lucide-react';
import { newsletterSubscriptionApi } from '@/features/newsletter/api/subscriptions';
import { newsletterCampaignApi } from '@/features/newsletter/api/campaigns';

const NewsletterDashboard: React.FC = () => {
  // Fetch newsletter statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['newsletter-stats'],
    queryFn: () => newsletterSubscriptionApi.getSubscriptionStats()
  });

  // Fetch recent campaigns
  const { data: recentCampaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['recent-campaigns'],
    queryFn: () => newsletterCampaignApi.getCampaigns({ limit: 5 })
  });

  const quickStats = [
    {
      title: 'Total Subscribers',
      value: stats?.total_subscribers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Subscribers',
      value: stats?.active_subscribers || 0,
      icon: Mail,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Avg Open Rate',
      value: `${stats?.avg_open_rate?.toFixed(1) || 0}%`,
      icon: Eye,
      color: 'bg-purple-500',
      change: '+2.3%'
    },
    {
      title: 'Campaigns Sent',
      value: stats?.sent_campaigns || 0,
      icon: Send,
      color: 'bg-orange-500',
      change: '+4'
    }
  ];

  const quickActions = [
    {
      title: 'Create Campaign',
      description: 'Start a new newsletter campaign',
      icon: Plus,
      href: '/admin/newsletter/campaigns/new',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Manage Subscribers',
      description: 'View and manage newsletter subscribers',
      icon: Users,
      href: '/admin/newsletter/subscribers',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'View Analytics',
      description: 'Analyze newsletter performance',
      icon: TrendingUp,
      href: '/admin/newsletter/analytics',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Newsletter Settings',
      description: 'Configure templates and settings',
      icon: Settings,
      href: '/admin/newsletter/settings',
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Newsletter Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your community newsletter and engage with subscribers
          </p>
        </div>
        <Link
          to="/admin/newsletter/campaigns/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className={`${action.color} text-white p-4 rounded-lg transition-colors`}
            >
              <action.icon className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Campaigns</h2>
            <Link 
              to="/admin/newsletter/campaigns"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          
          {campaignsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentCampaigns?.data?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No campaigns yet</p>
              <Link
                to="/admin/newsletter/campaigns/new"
                className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
              >
                Create your first campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCampaigns?.data?.map((campaign) => (
                <div key={campaign.id} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{campaign.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{campaign.subject}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.status}
                        </span>
                        {campaign.sent_at && (
                          <span className="text-xs text-gray-500">
                            Sent {new Date(campaign.sent_at).toLocaleDateString()}
                          </span>
                        )}
                        {campaign.recipient_count > 0 && (
                          <span className="text-xs text-gray-500">
                            {campaign.recipient_count} recipients
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/admin/newsletter/campaigns/${campaign.id}`}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Overview</h2>
          
          {statsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Open Rate</span>
                  <span className="font-medium">{stats?.avg_open_rate?.toFixed(1) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(stats?.avg_open_rate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Click Rate</span>
                  <span className="font-medium">{stats?.avg_click_rate?.toFixed(1) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(stats?.avg_click_rate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Subscriber Growth</span>
                  <span className="font-medium">+12% this month</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {((stats?.active_subscribers || 0) / Math.max(stats?.total_subscribers || 1, 1) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Active Subscribers</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Campaigns */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Scheduled Campaigns</h2>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No scheduled campaigns</p>
          <p className="text-sm text-gray-400 mt-1">
            Campaigns you schedule will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterDashboard;