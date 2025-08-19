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
  Minus,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  RefreshCw,
  Filter,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  Target
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
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [selectedMetric, setSelectedMetric] = useState<'opens' | 'clicks' | 'bounces' | 'unsubscribes'>('opens');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all');
  const [showRealTime, setShowRealTime] = useState(false);

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

  // Fetch real analytics data for charts
  const { data: analyticsData } = useQuery({
    queryKey: ['newsletter-analytics-chart', timeRange, selectedMetric],
    queryFn: () => newsletterAnalyticsApi.getEngagementTrends({
      days: timeRange,
      metric: selectedMetric
    })
  });

  // Use real data if available, otherwise show empty state
  const chartData = analyticsData?.trends || [];

  // Real-time metrics simulation
  React.useEffect(() => {
    if (!showRealTime) return;
    
    const interval = setInterval(() => {
      // Simulate real-time updates
      console.log('Real-time update');
    }, 5000);
    
    return () => clearInterval(interval);
  }, [showRealTime]);

  const InteractiveChart = ({ data, metric }: { data: any[], metric: string }) => {
    const maxValue = Math.max(...data.map(d => d[metric] || 0));
    
    return (
      <div className="relative">
        <div className="flex items-end space-x-1 h-64">
          {data.map((day, index) => {
            const value = day[metric] || 0;
            const height = (value / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className={`w-full transition-all duration-300 rounded-t group-hover:opacity-80 ${
                      metric === 'opens' ? 'bg-blue-500' :
                      metric === 'clicks' ? 'bg-green-500' :
                      metric === 'bounces' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br/>
                    {value} {metric}
                  </div>
                </div>
                
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DeviceBreakdown = ({ data }: { data: any[] }) => {
    const totals = data.reduce((acc, day) => {
      acc.desktop += day.devices.desktop;
      acc.mobile += day.devices.mobile;
      acc.tablet += day.devices.tablet;
      return acc;
    }, { desktop: 0, mobile: 0, tablet: 0 });
    
    const total = totals.desktop + totals.mobile + totals.tablet;
    
    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1 bg-blue-500 h-8 rounded-l flex items-center justify-center text-white text-sm font-medium" style={{ flex: totals.desktop / total }}>
            {Math.round((totals.desktop / total) * 100)}%
          </div>
          <div className="flex-1 bg-green-500 h-8 flex items-center justify-center text-white text-sm font-medium" style={{ flex: totals.mobile / total }}>
            {Math.round((totals.mobile / total) * 100)}%
          </div>
          <div className="flex-1 bg-purple-500 h-8 rounded-r flex items-center justify-center text-white text-sm font-medium" style={{ flex: totals.tablet / total }}>
            {Math.round((totals.tablet / total) * 100)}%
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Monitor className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Desktop</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Mobile</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Tablet className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Tablet</span>
          </div>
        </div>
      </div>
    );
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
    suffix?: string;
  }> = ({ title, value, icon: Icon, trend, suffix = '' }) => (
    <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Newsletter Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 mt-1">
            Track engagement and performance across your newsletter campaigns
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRealTime(!showRealTime)}
              className={`inline-flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                showRealTime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${showRealTime ? 'animate-spin' : ''}`} />
              Real-time
            </button>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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

      {/* Interactive Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Engagement Metrics</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="opens">Opens</option>
                <option value="clicks">Clicks</option>
                <option value="bounces">Bounces</option>
                <option value="unsubscribes">Unsubscribes</option>
              </select>
            </div>
            <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded">
              <button
                onClick={() => setChartType('line')}
                className={`p-1 rounded-l ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1 ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1 rounded-r ${chartType === 'area' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <InteractiveChart data={chartData} metric={selectedMetric} />
      </div>

      {/* Device & Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Device Breakdown</h3>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
          <DeviceBreakdown data={chartData} />
        </div>

        {/* Send Time Optimization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Optimal Send Times
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-900">Tuesday, 10:00 AM</div>
                <div className="text-sm text-green-600">Highest open rate (34.2%)</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-900">34.2%</div>
                <div className="text-xs text-green-600">+12% vs average</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-900">Thursday, 2:00 PM</div>
                <div className="text-sm text-blue-600">Highest click rate (8.7%)</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-900">8.7%</div>
                <div className="text-xs text-blue-600">+15% vs average</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recommendation</div>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                Schedule your next campaign for Tuesday at 10:00 AM to maximize engagement.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-purple-600" />
          Geographic Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Performing Regions</h4>
            {[
              { region: 'British Columbia', opens: 342, rate: 28.5 },
              { region: 'Alberta', opens: 189, rate: 24.1 },
              { region: 'Ontario', opens: 156, rate: 21.8 },
              { region: 'Other', opens: 98, rate: 18.3 }
            ].map((region, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{region.region}</div>
                  <div className="text-xs text-gray-500">{region.opens} opens</div>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{region.rate}%</div>
              </div>
            ))}
          </div>
          
          <div className="col-span-2">
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Globe className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Interactive map would go here</p>
                <p className="text-xs">Showing engagement by region</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Top Performing Campaigns</h3>
        <div className="space-y-4">
          {engagement?.top_campaigns.slice(0, 5).map((campaign: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{campaign.title}</h4>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Campaign Details</h3>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sent</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{campaignAnalytics.open_rate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Open Rate</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{campaignAnalytics.click_rate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Click Rate</div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{campaignAnalytics.bounce_rate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</div>
                  </div>
                </div>

                {/* Top Links */}
                {(campaignAnalytics as any).top_links?.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Top Clicked Links</h4>
                    <div className="space-y-2">
                      {(campaignAnalytics as any).top_links.slice(0, 5).map((link: TopLink, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{link.url}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-4">{link.clicks} clicks</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Timeline */}
                {(campaignAnalytics as any).engagement_timeline?.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Engagement Over Time</h4>
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

      {/* A/B Testing Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-orange-600" />
          A/B Testing Results
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Weekly Tech Update - Subject Line Test</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Testing completed • 2,486 recipients</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Winner: Variant B
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Variant A (Control)</div>
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">"This Week in Tech: Latest Updates"</div>
                <div className="flex justify-between text-sm">
                  <span>Open Rate:</span>
                  <span className="font-medium">22.4%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Click Rate:</span>
                  <span className="font-medium">4.2%</span>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded border-2 border-green-200">
                <div className="text-sm text-green-600 mb-1">Variant B (Winner)</div>
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">"🚀 Tech Breakthroughs You Can't Miss"</div>
                <div className="flex justify-between text-sm">
                  <span>Open Rate:</span>
                  <span className="font-medium text-green-700">31.8% (+9.4%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Click Rate:</span>
                  <span className="font-medium text-green-700">6.1% (+1.9%)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <div className="text-sm text-blue-800">
                <strong>Insight:</strong> Emoji and urgency-focused subject lines performed 42% better. 
                Consider using similar approaches for future campaigns.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      {showRealTime && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-green-600 animate-spin" />
            Real-time Activity
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[
              { time: '2 seconds ago', action: 'Email opened', details: 'user@example.com opened "Weekly Tech Update"', type: 'open' },
              { time: '15 seconds ago', action: 'Link clicked', details: 'Event registration link clicked', type: 'click' },
              { time: '32 seconds ago', action: 'New subscription', details: 'new.user@example.com subscribed', type: 'subscribe' },
              { time: '1 minute ago', action: 'Email opened', details: 'member@example.com opened "Weekly Tech Update"', type: 'open' },
              { time: '2 minutes ago', action: 'Unsubscribe', details: 'user@example.com unsubscribed', type: 'unsubscribe' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.type === 'open' ? 'bg-blue-500' :
                  activity.type === 'click' ? 'bg-green-500' :
                  activity.type === 'subscribe' ? 'bg-purple-500' :
                  'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;