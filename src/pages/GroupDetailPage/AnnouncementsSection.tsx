import React from 'react';
import { AlertCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent';
  created_at: string;
  expires_at?: string;
  creator: {
    name: string;
    image: string;
  };
}

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  isLoading: boolean;
}

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ announcements, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Group Announcements
      </h3>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`border rounded-lg p-4 ${getPriorityStyles(announcement.priority)}`}
          >
            <div className="flex items-start gap-3">
              {getPriorityIcon(announcement.priority)}
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                  {announcement.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  {announcement.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <img
                      src={announcement.creator.image}
                      alt={announcement.creator.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{announcement.creator.name}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
                  {announcement.expires_at && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires {formatDistanceToNow(new Date(announcement.expires_at), { addSuffix: true })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsSection;