import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageSquare, 
  Users 
} from 'lucide-react';
import { DashboardStats } from '../../types';

interface KeyMetricsProps {
  stats: DashboardStats;
  className?: string;
}

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ 
  stats, 
  className = '' 
}) => {
  const metrics = [
    {
      label: 'Total Content',
      value: stats.totalContent,
      change: stats.weeklyGrowth.content,
      icon: MessageSquare,
      color: 'blue'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      change: stats.weeklyGrowth.views,
      icon: Eye,
      color: 'green'
    },
    {
      label: 'Engagement',
      value: stats.totalEngagement,
      change: stats.weeklyGrowth.engagement,
      icon: Heart,
      color: 'purple'
    },
    {
      label: 'Community',
      value: stats.contentByType.groups + stats.contentByType.events,
      change: 0, // Calculate from weekly data if available
      icon: Users,
      color: 'orange'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    }
    if (change < 0) {
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          
          return (
            <div 
              key={metric.label}
              className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
            >
              <div className={`
                p-2 rounded-lg
                ${metric.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                ${metric.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                ${metric.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                ${metric.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' : ''}
              `}>
                <Icon className={`
                  h-4 w-4
                  ${metric.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : ''}
                  ${metric.color === 'green' ? 'text-green-600 dark:text-green-400' : ''}
                  ${metric.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : ''}
                  ${metric.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : ''}
                `} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                  {metric.label}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatNumber(metric.value)}
                  </p>
                  {metric.change !== 0 && (
                    <div className={`flex items-center space-x-1 ${getChangeColor(metric.change)}`}>
                      {getChangeIcon(metric.change)}
                      <span className="text-xs font-medium">
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeyMetrics;