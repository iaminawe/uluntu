import React from 'react';
import { ContentCardProps } from '../../types';
import Card from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button';

/**
 * Content Card Component
 * A flexible card component for displaying different types of content
 */
const ContentCard: React.FC<ContentCardProps> = ({
  item,
  type,
  size = 'md',
  layout = 'card',
  showActions = false,
  actions = [],
  onSelect,
  className = '',
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'visible':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
      case 'hidden':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getTypeIcon = (contentType: string) => {
    const iconClass = 'w-4 h-4';
    
    switch (contentType) {
      case 'photo':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'gallery':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'event':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'message':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const renderImage = () => {
    const imageUrl = item.image || item.cover_photo_url || item.coverImage || item.hero_image;
    
    if (!imageUrl) {
      return (
        <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <div className="text-slate-400">
            {getTypeIcon(type)}
          </div>
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={item.title || 'Content image'}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
    );
  };

  const renderMetadata = () => {
    switch (type) {
      case 'gallery':
        return (
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-4">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {item.photo_count || item.photoCount || 0} photos
            </span>
            {item.view_count && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {item.view_count} views
              </span>
            )}
          </div>
        );
      case 'event':
        return (
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-4">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(item.date)}
            </span>
            {item.location && (
              <span className="flex items-center truncate">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location}
              </span>
            )}
            {item.attendees && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                {item.attendees} attending
              </span>
            )}
          </div>
        );
      case 'message':
        return (
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-4">
            {item.replies && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {item.replies} replies
              </span>
            )}
            {item.likes && (
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {item.likes} likes
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (layout === 'list') {
    return (
      <Card
        className={`p-4 ${onSelect ? 'cursor-pointer' : ''} ${className}`}
        onClick={onSelect ? () => onSelect(item) : undefined}
        hoverable={!!onSelect}
      >
        <div className="flex items-center space-x-4">
          {/* Icon/Image */}
          <div className="flex-shrink-0">
            {item.image || item.cover_photo_url ? (
              <img
                src={item.image || item.cover_photo_url}
                alt={item.title}
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                {getTypeIcon(type)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {item.title}
              </h3>
              {(item.status || item.visibility) && (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status || item.visibility)}`}>
                  {item.status || item.visibility}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
                {item.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              {renderMetadata()}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(item.created_at || item.createdAt || item.date)}
              </span>
            </div>
          </div>

          {/* Actions */}
          {showActions && actions.length > 0 && (
            <div className="flex-shrink-0 flex space-x-2">
              {actions.slice(0, 2).map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item);
                  }}
                  disabled={action.disabled}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Card layout
  return (
    <Card
      className={`overflow-hidden ${onSelect ? 'cursor-pointer' : ''} ${className}`}
      onClick={onSelect ? () => onSelect(item) : undefined}
      hoverable={!!onSelect}
    >
      {/* Image */}
      <div className="relative">
        {renderImage()}
        {(item.status || item.visibility) && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status || item.visibility)}`}>
              {item.status || item.visibility}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-medium text-slate-900 dark:text-white line-clamp-2 ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          }`}>
            {item.title}
          </h3>
        </div>

        {item.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {renderMetadata()}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{formatDate(item.created_at || item.createdAt || item.date)}</span>
            <div className="flex items-center">
              {getTypeIcon(type)}
              <span className="ml-1 capitalize">{type}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && actions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex space-x-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item);
                  }}
                  disabled={action.disabled}
                  className="flex-1 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContentCard;