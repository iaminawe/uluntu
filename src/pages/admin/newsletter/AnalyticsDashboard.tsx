import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Mail, 
  Users, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { newsletterAnalyticsApi } from '@/api/newsletter/analytics';
import { newsletterCampaignApi } from '@/features/newsletter/api/campaigns';

interface TopLink {
  url: string;
  clicks: number;
}

interface EngagementDay {
  opens: number;
  clicks: number;
  date: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<number>(30);

  // Fetch overall stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['newsletter-stats'],
    queryFn: () => (newsletterAnalyticsApi as any).getNewsletterStats()
  });

  // Fetch engagement metrics
  const { data: engagement, isLoading: engagementLoading } = useQuery({
    queryKey: ['newsletter-engagement', timeRange],
    queryFn: () => (newsletterAnalyticsApi as any).getEngagementMetrics(timeRange)
  });

  // Fetch campaigns for dropdown
  const { data: campaigns } = useQuery({
    queryKey: ['newsletter-campaigns-list'],
    queryFn: () => newsletterCampaignApi.getCampaigns({ limit: 50, status: 'sent' })
  });

  // Fetch campaign analytics if selected
  const { data: campaignAnalytics, isLoading: campaignLoading } = useQuery({
    queryKey: ['newsletter-campaign-analytics', selectedCampaignId],
    queryFn: () => selectedCampaignId ? newsletterAnalyticsApi.getCampaignAnalytics(selectedCampaignId) : null,
    enabled: !!selectedCampaignId
  });

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
    suffix?: string;
  }> = ({ title, value, icon: Icon, trend, suffix = '' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          {trend.direction === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
          {trend.direction === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
          {trend.direction === 'neutral' && <Minus className="h-4 w-4 text-gray-400" />}
          <span className={`ml-1 text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {Math.abs(trend.value)}% vs last period
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track engagement and performance across your newsletter campaigns
          </p>
        </div>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Subscribers"
            value={stats?.total_subscribers || 0}
            icon={Users}
          />
          <StatCard
            title="Active Subscribers"
            value={stats?.active_subscribers || 0}
            icon={Mail}
          />
          <StatCard
            title="Campaigns Sent"
            value={stats?.sent_campaigns || 0}
            icon={Calendar}
          />
          <StatCard
            title="Average Open Rate"
            value={stats?.avg_open_rate || 0}
            icon={Eye}
            suffix="%"
          />
        </div>
      )}

      {/* Engagement Charts */}
      {engagementLoading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Opens Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Opens</h3>
            <div className="h-64 flex items-end space-x-2">
              {engagement?.daily_opens.map((day: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${Math.max(4, (day.count / Math.max(...engagement.daily_opens.map((d: any) => d.count))) * 100)}%` 
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-center">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Clicks Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Clicks</h3>
            <div className="h-64 flex items-end space-x-2">
              {engagement?.daily_clicks.map((day: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ 
                      height: `${Math.max(4, (day.count / Math.max(...engagement.daily_clicks.map((d: any) => d.count))) * 100)}%` 
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-center">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Campaigns */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Campaigns</h3>
        <div className="space-y-4">
          {engagement?.top_campaigns.slice(0, 5).map((campaign: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{campaign.title}</h4>
              </div>
              <div className="flex space-x-8 text-sm">
                <div className="text-center">
                  <div className="flex items-center text-blue-600">
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="font-medium">{campaign.open_rate}%</span>
                  </div>
                  <span className="text-gray-500">Open Rate</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center text-green-600">
                    <MousePointer className="h-4 w-4 mr-1" />
                    <span className="font-medium">{campaign.click_rate}%</span>
                  </div>
                  <span className="text-gray-500">Click Rate</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign-Specific Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a campaign</option>
            {campaigns?.data?.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title} - {new Date(campaign.sent_at || campaign.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedCampaignId && (
          <>
            {campaignLoading ? (
              <div className="animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : campaignAnalytics ? (
              <div className="space-y-6">
                {/* Campaign Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{(campaignAnalytics as any).total_sent}</div>
                    <div className="text-sm text-gray-600">Sent</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{campaignAnalytics.open_rate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{campaignAnalytics.click_rate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{campaignAnalytics.bounce_rate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Bounce Rate</div>
                  </div>
                </div>

                {/* Top Links */}
                {(campaignAnalytics as any).top_links?.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Top Clicked Links</h4>
                    <div className="space-y-2">
                      {(campaignAnalytics as any).top_links.slice(0, 5).map((link: TopLink, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 truncate flex-1">{link.url}</span>
                          <span className="text-sm font-medium text-gray-900 ml-4">{link.clicks} clicks</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Timeline */}
                {(campaignAnalytics as any).engagement_timeline?.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Engagement Over Time</h4>
                    <div className="h-32 flex items-end space-x-1">
                      {(campaignAnalytics as any).engagement_timeline.map((day: EngagementDay, index: number) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col">
                            <div 
                              className="w-full bg-blue-400 rounded-t"
                              style={{ 
                                height: `${Math.max(2, (day.opens / Math.max(...(campaignAnalytics as any).engagement_timeline.map((d: EngagementDay) => d.opens))) * 60)}px` 
                              }}
                              title={`${day.opens} opens`}
                            ></div>
                            <div 
                              className="w-full bg-green-400"
                              style={{ 
                                height: `${Math.max(2, (day.clicks / Math.max(...(campaignAnalytics as any).engagement_timeline.map((d: EngagementDay) => d.clicks))) * 30)}px` 
                              }}
                              title={`${day.clicks} clicks`}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center space-x-4 mt-2 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-400 rounded mr-1"></div>
                        <span>Opens</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded mr-1"></div>
                        <span>Clicks</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No analytics data available for this campaign</p>
              </div>
            )}
          </>
        )}

        {!selectedCampaignId && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a campaign to view detailed analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;