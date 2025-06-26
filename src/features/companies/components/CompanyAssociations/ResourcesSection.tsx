import React from 'react';
import { Resource } from '@/types';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { BookOpen, FileText, Video, Link as LinkIcon, ExternalLink, Tag } from 'lucide-react';

interface ResourcesSectionProps {
  resources: Resource[];
  isLoading: boolean;
  error?: Error | null;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'article':
      return <FileText className="w-5 h-5" />;
    case 'video':
      return <Video className="w-5 h-5" />;
    case 'tool':
    case 'link':
      return <LinkIcon className="w-5 h-5" />;
    default:
      return <BookOpen className="w-5 h-5" />;
  }
};

const getResourceTypeColor = (type: string) => {
  switch (type) {
    case 'article':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'video':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'tool':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'tutorial':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  }
};

export function ResourcesSection({ resources, isLoading, error }: ResourcesSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Resources
        </h2>
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Failed to load resources
        </div>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return null;
  }

  // Group resources by type
  const groupedResources = resources.reduce((acc, resource) => {
    const type = resource.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-6 h-6" />
        Resources ({resources.length})
      </h2>
      
      <div className="space-y-6">
        {Object.entries(groupedResources).map(([type, typeResources]) => (
          <div key={type}>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 capitalize">
              {type}s ({typeResources.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {resource.title}
                  </h4>
                  
                  {resource.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {resource.description}
                    </p>
                  )}
                  
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          +{resource.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                    By {resource.contributor?.name || 'Unknown'}
                    {resource.dateAdded && (
                      <> • {new Date(resource.dateAdded).toLocaleDateString()}</>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}