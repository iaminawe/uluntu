import React, { useState } from 'react';
import { MessagesTabProps } from '../../types';
import ContentCard from '../ContentCard';
import Card from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';

/**
 * Messages Tab Component
 * Displays user's messages and conversations
 */
const MessagesTab: React.FC<MessagesTabProps> = ({
  contentType,
  data,
  loading = false,
  error = null,
  onRefresh,
  onCreateMessage,
  onCreateAnnouncement,
  onMarkAsRead,
  className = '',
}) => {
  const [activeSection, setActiveSection] = useState<'conversations' | 'announcements' | 'notifications'>('conversations');

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load messages"
        message={error}
        retry={onRefresh}
      />
    );
  }

  const statistics = data.statistics || {
    totalConversations: 0,
    unreadMessages: 0,
    recentActivity: 0,
  };

  const getSectionData = () => {
    switch (activeSection) {
      case 'conversations':
        return data.conversations || [];
      case 'announcements':
        return data.announcements || [];
      case 'notifications':
        return data.notifications || [];
      default:
        return [];
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'conversations':
        return 'Conversations';
      case 'announcements':
        return 'Announcements';
      case 'notifications':
        return 'Notifications';
      default:
        return 'Messages';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'conversations':
        return 'Direct messages and group conversations';
      case 'announcements':
        return 'Community announcements and updates';
      case 'notifications':
        return 'System notifications and alerts';
      default:
        return '';
    }
  };

  const sectionData = getSectionData();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Conversations</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.totalConversations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Unread Messages</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.unreadMessages}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent Activity</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.recentActivity}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Section Navigation */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {getSectionTitle()}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getSectionDescription()}
              </p>
            </div>
            <div className="flex space-x-2">
              {onCreateMessage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateMessage}
                  className="inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Message
                </Button>
              )}
              {onCreateAnnouncement && activeSection === 'announcements' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onCreateAnnouncement}
                  className="inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  New Announcement
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="px-6 py-4">
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {[
              { id: 'conversations', label: 'Conversations', count: data.conversations?.length || 0 },
              { id: 'announcements', label: 'Announcements', count: data.announcements?.length || 0 },
              { id: 'notifications', label: 'Notifications', count: statistics.unreadMessages },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{section.label}</span>
                {section.count > 0 && (
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full ${
                    activeSection === section.id
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      : section.id === 'notifications' && section.count > 0
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>
                    {section.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} hasImage={false} lines={2} />
          ))}
        </div>
      )}

      {/* Messages List */}
      {!loading && sectionData.length > 0 && (
        <div className="space-y-4">
          {sectionData.map((message) => (
            <ContentCard
              key={message.id}
              item={message}
              type="message"
              size="md"
              layout="list"
              showActions={true}
              actions={[
                ...(message.unread && onMarkAsRead ? [{
                  id: 'mark-read',
                  label: 'Mark Read',
                  icon: 'check',
                  variant: 'outline' as const,
                  onClick: () => onMarkAsRead(message.id),
                }] : []),
                {
                  id: 'reply',
                  label: 'Reply',
                  icon: 'reply',
                  variant: 'default' as const,
                  onClick: () => console.log('Reply to message', message.id),
                },
              ]}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sectionData.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              {activeSection === 'conversations' && (
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {activeSection === 'announcements' && (
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              )}
              {activeSection === 'notifications' && (
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-9.797 7.077A9.969 9.969 0 003 12c0 5.523 4.477 10 10 10a9.97 9.97 0 01-2.473-6.498z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {activeSection === 'conversations' && 'No Conversations'}
                {activeSection === 'announcements' && 'No Announcements'}
                {activeSection === 'notifications' && 'No Notifications'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                {activeSection === 'conversations' && 'Start a conversation with community members to connect and collaborate.'}
                {activeSection === 'announcements' && 'Stay tuned for important community announcements and updates.'}
                {activeSection === 'notifications' && 'You\'re all caught up! Notifications will appear here when you have new activity.'}
              </p>
              <div className="space-x-3">
                {activeSection === 'conversations' && onCreateMessage && (
                  <Button onClick={onCreateMessage}>
                    Start a Conversation
                  </Button>
                )}
                {activeSection === 'announcements' && onCreateAnnouncement && (
                  <Button onClick={onCreateAnnouncement}>
                    Create Announcement
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions for Unread Messages */}
      {statistics.unreadMessages > 0 && activeSection !== 'notifications' && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  You have {statistics.unreadMessages} unread message{statistics.unreadMessages !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('notifications')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              View All
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MessagesTab;