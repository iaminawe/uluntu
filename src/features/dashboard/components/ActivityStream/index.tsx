import React from 'react';
import { ActivityItem } from '../../types';
import { Card } from '@/shared/components/ui/Card';
import { 
  Plus, 
  Edit, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  User,
  Calendar,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityStreamProps {
  activities: ActivityItem[];
  className?: string;
  limit?: number;
}

export const ActivityStream: React.FC<ActivityStreamProps> = ({
  activities,
  className = '',
  limit
}) => {
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content_created': return Plus;
      case 'content_updated': return Edit;
      case 'content_published': return Eye;
      case 'content_liked': return Heart;
      case 'content_commented': return MessageCircle;
      case 'content_shared': return Share2;
      case 'profile_updated': return User;
      case 'event_rsvp': return Calendar;
      case 'achievement_unlocked': return Award;
      default: return Plus;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'content_created': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'content_updated': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'content_published': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'content_liked': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'content_commented': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'content_shared': return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'profile_updated': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'event_rsvp': return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
      case 'achievement_unlocked': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return '';
    }
  };

  if (displayActivities.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No recent activity to show
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        {activities.length > (limit || 0) && (
          <button className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
            View All
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {displayActivities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const isLast = index === displayActivities.length - 1;
          
          return (
            <div key={activity.id} className="relative">
              <div className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${getPriorityIndicator(activity.priority)}`}>
                <div className={`flex-shrink-0 p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {activity.title}
                  </p>
                  
                  {activity.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center mt-2 space-x-4">
                    <time className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </time>
                    
                    {activity.contentType && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {activity.contentType}
                      </span>
                    )}
                    
                    {activity.priority && activity.priority !== 'low' && (
                      <span className={`text-xs font-medium ${
                        activity.priority === 'high' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {activity.priority} priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {!isLast && (
                <div className="absolute left-6 top-14 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityStream;