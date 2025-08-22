import React from 'react';
import { ActivityItemProps } from '../../types';

/**
 * Activity Item Component
 * Displays individual activity with icon, description, and timestamp
 */
const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  showAvatar = true,
  showTimestamp = true,
  compact = false,
  className = '',
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityIcon = () => {
    const iconClasses = `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center`;
    
    switch (activity.type) {
      case 'photo_upload':
        return (
          <div className={`${iconClasses} bg-blue-100 dark:bg-blue-900`}>
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'event_created':
        return (
          <div className={`${iconClasses} bg-green-100 dark:bg-green-900`}>
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'gallery_shared':
        return (
          <div className={`${iconClasses} bg-purple-100 dark:bg-purple-900`}>
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
        );
      case 'message_sent':
        return (
          <div className={`${iconClasses} bg-orange-100 dark:bg-orange-900`}>
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'comment_added':
        return (
          <div className={`${iconClasses} bg-indigo-100 dark:bg-indigo-900`}>
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
        );
      case 'like_received':
        return (
          <div className={`${iconClasses} bg-red-100 dark:bg-red-900`}>
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'member_joined':
        return (
          <div className={`${iconClasses} bg-teal-100 dark:bg-teal-900`}>
            <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'achievement_earned':
        return (
          <div className={`${iconClasses} bg-yellow-100 dark:bg-yellow-900`}>
            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${iconClasses} bg-slate-100 dark:bg-slate-700`}>
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getPriorityIndicator = () => {
    if (activity.priority === 'high') {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></div>
      );
    }
    return null;
  };

  return (
    <div className={`flex items-start space-x-3 ${compact ? 'py-2' : 'py-3'} ${className}`}>
      {/* Activity Icon or Avatar */}
      {showAvatar ? (
        <div className="relative">
          {activity.actor.image ? (
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={activity.actor.image}
              alt={activity.actor.name}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {activity.actor.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {getPriorityIndicator()}
        </div>
      ) : (
        <div className="relative">
          {getActivityIcon()}
          {getPriorityIndicator()}
        </div>
      )}

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className={`${compact ? 'space-y-1' : 'space-y-2'}`}>
          {/* Activity Title and Description */}
          <div>
            <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-slate-900 dark:text-white`}>
              {activity.title}
            </p>
            {activity.description && (
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-600 dark:text-slate-400 mt-1`}>
                {activity.description}
              </p>
            )}
          </div>

          {/* Target Information */}
          {activity.target && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activity.target.type}:
              </span>
              {activity.target.url ? (
                <a
                  href={activity.target.url}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activity.target.name}
                </a>
              ) : (
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                  {activity.target.name}
                </span>
              )}
            </div>
          )}

          {/* Timestamp */}
          {showTimestamp && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatTimestamp(activity.timestamp)}
            </p>
          )}
        </div>
      </div>

      {/* Activity Type Indicator */}
      {!showAvatar && (
        <div className="flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${
            activity.type.includes('photo') || activity.type.includes('gallery') ? 'bg-blue-500' :
            activity.type.includes('event') ? 'bg-green-500' :
            activity.type.includes('message') || activity.type.includes('comment') ? 'bg-orange-500' :
            activity.type.includes('like') || activity.type.includes('achievement') ? 'bg-purple-500' :
            'bg-slate-400'
          }`}></div>
        </div>
      )}
    </div>
  );
};

export default ActivityItem;
