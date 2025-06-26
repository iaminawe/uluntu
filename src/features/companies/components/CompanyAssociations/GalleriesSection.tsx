import React from 'react';
import { Link } from 'react-router-dom';
import { Gallery } from '@/features/gallery/types';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { Images, Camera, Eye, Lock, Globe } from 'lucide-react';

interface GalleriesSectionProps {
  galleries: Gallery[];
  isLoading: boolean;
  error?: Error | null;
}

export function GalleriesSection({ galleries, isLoading, error }: GalleriesSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Images className="w-6 h-6" />
          Photo Galleries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Images className="w-6 h-6" />
          Photo Galleries
        </h2>
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Failed to load galleries
        </div>
      </div>
    );
  }

  if (!galleries || galleries.length === 0) {
    return null;
  }

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Globe className="w-3 h-3" />;
      case 'private':
        return <Lock className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'members_only':
        return 'Members Only';
      default:
        return privacy;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Images className="w-6 h-6" />
        Photo Galleries ({galleries.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            to={`/gallery/${gallery.id}`}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="relative h-48 bg-slate-100 dark:bg-slate-700">
              {gallery.cover_photo_url || gallery.coverImage ? (
                <img
                  src={gallery.cover_photo_url || gallery.coverImage}
                  alt={gallery.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-slate-400" />
                </div>
              )}
              
              {/* Featured badge */}
              {gallery.is_featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </div>
              )}
              
              {/* Photo count */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Images className="w-3 h-3" />
                {gallery.photo_count} photos
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
                {gallery.title}
              </h3>
              
              {gallery.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                  {gallery.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
                  <Eye className="w-3 h-3" />
                  {gallery.view_count} views
                </div>
                
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-500">
                  {getPrivacyIcon(gallery.privacy_level)}
                  {getPrivacyLabel(gallery.privacy_level)}
                </div>
              </div>
              
              {gallery.tags && gallery.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {gallery.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {galleries.length > 6 && (
        <div className="mt-6 text-center">
          <Link
            to={`/gallery?owner=company&ownerId=${galleries[0]?.owner_id}`}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all galleries
            <Images className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}