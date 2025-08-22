import React from 'react';
import { UserContent } from '../../types';
import { Card } from '@/shared/components/ui/Card';
import { 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle, 
  Star,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContentGridProps {
  content: UserContent[];
  view: 'grid' | 'list';
  isLoading?: boolean;
  onContentClick?: (content: UserContent) => void;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  content,
  view,
  isLoading = false,
  onContentClick
}) => {
  if (isLoading) {
    return (
      <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="flex space-x-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No content found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Start creating content to see it appear here.
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
            Create Your First Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
      {content.map((item) => (
        <ContentCard
          key={item.id}
          content={item}
          view={view}
          onClick={() => onContentClick?.(item)}
        />
      ))}
    </div>
  );
};

interface ContentCardProps {
  content: UserContent;
  view: 'grid' | 'list';
  onClick?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, view, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'archived': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      gallery: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      event: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      news: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      resource: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      group: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      marketplace: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      opportunity: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      message: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    };
    return colors[type] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  };

  if (view === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(content.type)}`}>
                  {content.type}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                  {content.status}
                </span>
                {content.featured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              
              <h3 className="text-lg font-medium text-slate-900 dark:text-white truncate">
                {content.title}
              </h3>
              
              {content.excerpt && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {content.excerpt}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })}
                </div>
                
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {content.views.toLocaleString()}
                </div>
                
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {content.likes.toLocaleString()}
                </div>
                
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {content.comments.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden" onClick={onClick}>
      {content.thumbnail && (
        <div className="aspect-video bg-slate-200 dark:bg-slate-700 relative">
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          {content.featured && (
            <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-500 fill-current" />
          )}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(content.type)}`}>
            {content.type}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
            {content.status}
          </span>
        </div>
        
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 line-clamp-2">
          {content.title}
        </h3>
        
        {content.excerpt && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-3">
            {content.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {content.views.toLocaleString()}
            </div>
            
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              {content.likes.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            View Content
          </a>
          
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ContentGrid;