import React from 'react';
import { DashboardAnalytics } from '../../types';
import { Card } from '@/shared/components/ui/Card';
import { AnalyticsWidget } from '../AnalyticsWidget';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Clock
} from 'lucide-react';

interface AnalyticsOverviewProps {
  analytics: DashboardAnalytics;
  className?: string;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  analytics,
  className = ''
}) => {
  // Provide safe defaults if analytics structure is incomplete
  const engagement = analytics?.engagement || {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    engagementRate: 0,
    avgTimeOnContent: 0
  };
  
  const growth = analytics?.growth || {
    viewsGrowth: 0,
    engagementGrowth: 0,
    contentGrowth: 0,
    period: 'month' as const
  };

  const widgets = [
    {
      id: 'views',
      title: 'Total Views',
      value: engagement.totalViews,
      format: 'number' as const,
      icon: Eye,
      change: growth.viewsGrowth,
      trend: growth.viewsGrowth > 0 ? 'up' as const : 'down' as const
    },
    {
      id: 'likes',
      title: 'Likes',
      value: engagement.totalLikes,
      format: 'number' as const,
      icon: Heart,
      change: growth.engagementGrowth,
      trend: growth.engagementGrowth > 0 ? 'up' as const : 'down' as const
    },
    {
      id: 'comments',
      title: 'Comments',
      value: engagement.totalComments,
      format: 'number' as const,
      icon: MessageCircle
    },
    {
      id: 'engagement',
      title: 'Engagement Rate',
      value: engagement.engagementRate || 0,
      format: 'percentage' as const,
      icon: TrendingUp,
      change: growth.engagementGrowth,
      trend: growth.engagementGrowth > 0 ? 'up' as const : 'down' as const
    }
  ];

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
        Analytics Overview
      </h3>
      
      <div className="space-y-4">
        {widgets.map((widget) => (
          <AnalyticsWidget
            key={widget.id}
            title={widget.title}
            value={widget.value}
            format={widget.format}
            icon={widget.icon}
            change={widget.change}
            trend={widget.trend}
          />
        ))}
        
        {/* Additional insights */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <span>Average Time on Content</span>
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">
            {Math.floor((engagement.avgTimeOnContent || 0) / 60)}m {(engagement.avgTimeOnContent || 0) % 60}s
          </div>
        </div>
        
        {/* Growth period indicator */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Growth compared to last {growth.period}
        </div>
      </div>
    </Card>
  );
};

export default AnalyticsOverview;