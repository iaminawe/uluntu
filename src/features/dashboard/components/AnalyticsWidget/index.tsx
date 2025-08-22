import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface AnalyticsWidgetProps {
  title: string;
  value: number | string;
  format: 'number' | 'percentage' | 'currency' | 'duration';
  icon?: LucideIcon;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  title,
  value,
  format,
  icon: Icon,
  change,
  trend,
  className = ''
}) => {
  const formatValue = (val: number | string, fmt: string) => {
    if (typeof val === 'string') return val;
    
    switch (fmt) {
      case 'number':
        return val.toLocaleString();
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'duration':
        const hours = Math.floor(val / 3600);
        const minutes = Math.floor((val % 3600) / 60);
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      default:
        return val.toString();
    }
  };

  const getTrendColor = (trendDirection?: string) => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  const getTrendIcon = (trendDirection?: string) => {
    switch (trendDirection) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return null;
    }
  };

  const TrendIcon = getTrendIcon(trend);

  return (
    <div className={`p-3 bg-slate-50 dark:bg-slate-800 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          {Icon && (
            <Icon className="h-4 w-4 text-slate-400 mr-2" />
          )}
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </span>
        </div>
        
        {change !== undefined && TrendIcon && (
          <div className={`flex items-center ${getTrendColor(trend)}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            <span className="text-xs font-medium">
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="text-xl font-semibold text-slate-900 dark:text-white">
        {formatValue(value, format)}
      </div>
    </div>
  );
};

export default AnalyticsWidget;