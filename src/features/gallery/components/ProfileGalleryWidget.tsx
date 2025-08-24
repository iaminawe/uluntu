import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Grid, 
  Star, 
  Eye, 
  Calendar, 
  ChevronRight, 
  Image as ImageIcon,
  Users,
  Globe,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Gallery, GalleryFilters } from '../types';
import { galleryApi } from '../api';

interface ProfileGalleryWidgetProps {
  userId: string;
  profileType?: 'user' | 'group' | 'company';
  maxGalleries?: number;
  showFeaturedFirst?: boolean;
  showPrivacyIndicator?: boolean;
  showStats?: boolean;
  compact?: boolean;
  className?: string;
}

const ProfileGalleryWidget: React.FC<ProfileGalleryWidgetProps> = ({
  userId,
  profileType = 'user',
  maxGalleries = 6,
  showFeaturedFirst = true,
  showPrivacyIndicator = true,
  showStats = true,
  compact = false,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);

  // Fetch user galleries
  const { data: galleries, isLoading } = useQuery({
    queryKey: ['profile-galleries', userId, profileType],
    queryFn: () => {
      const filters: GalleryFilters = {
        ownerType: profileType,
        ownerId: userId,
        visibility: 'visible',
        sortBy: showFeaturedFirst ? 'featured' : 'date',
        sortOrder: 'desc'
      };
      return galleryApi.getGalleries(filters);
    }
  });

  const galleryItems = galleries?.items || [];
  const displayedGalleries = showAll ? galleryItems : galleryItems.slice(0, maxGalleries);
  const featuredGallery = showFeaturedFirst ? galleryItems.find(g => g.is_featured) : null;

  // Get privacy icon
  const getPrivacyIcon = (privacyLevel: Gallery['privacy_level']) => {
    switch (privacyLevel) {
      case 'public':
        return <Globe className="w-3 h-3 text-green-500" title="Public" />;
      case 'members_only':
        return <Users className="w-3 h-3 text-orange-500" title="Members Only" />;
      case 'private':
        return <Lock className="w-3 h-3 text-red-500" title="Private" />;
      default:
        return null;
    }
  };

  // Render gallery card
  const renderGalleryCard = (gallery: Gallery, isFeatured = false) => (
    <Link
      key={gallery.id}
      to={`/galleries/${gallery.slug || gallery.id}`}
      className={`group block ${
        compact ? 'p-3' : 'p-4'
      } bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-md`}
    >
      {/* Gallery thumbnail */}
      <div className={`aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg mb-3 overflow-hidden relative ${
        compact ? 'mb-2' : 'mb-3'
      }`}>
        {gallery.cover_photo_url ? (
          <img
            src={gallery.cover_photo_url}
            alt={gallery.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-slate-400`} />
          </div>
        )}

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" className="text-xs">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          </div>
        )}

        {/* Privacy indicator */}
        {showPrivacyIndicator && (
          <div className="absolute bottom-2 left-2">
            {getPrivacyIcon(gallery.privacy_level)}
          </div>
        )}
      </div>

      {/* Gallery info */}
      <div className="space-y-2">
        <h4 className={`font-medium text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors ${
          compact ? 'text-sm' : 'text-base'
        }`}>
          {gallery.title}
        </h4>

        {gallery.description && !compact && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {gallery.description}
          </p>
        )}

        {showStats && (
          <div className={`flex items-center justify-between ${compact ? 'text-xs' : 'text-sm'} text-slate-500 dark:text-slate-400`}>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <ImageIcon className="w-3 h-3 mr-1" />
                <span>{gallery.photo_count}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>{gallery.view_count}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Grid className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500 mb-2">No galleries yet</p>
        <p className="text-slate-400 text-sm">
          {profileType === 'user' ? 'Create your first gallery to showcase your photos' : 'No galleries available'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-slate-900 dark:text-white ${compact ? 'text-lg' : 'text-xl'}`}>
          Galleries
          <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
            ({galleryItems.length})
          </span>
        </h3>
        
        {galleryItems.length > maxGalleries && (
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
          >
            {showAll ? 'Show Less' : `View All (${galleryItems.length})`}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Featured Gallery (if exists and showFeaturedFirst is true) */}
      {featuredGallery && showFeaturedFirst && !compact && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
            <Star className="w-4 h-4 mr-2 text-yellow-500 fill-current" />
            Featured Gallery
          </h4>
          {renderGalleryCard(featuredGallery, true)}
        </div>
      )}

      {/* Gallery Grid */}
      <div className={`grid gap-4 ${
        compact 
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {displayedGalleries
          .filter(gallery => !featuredGallery || gallery.id !== featuredGallery.id)
          .map((gallery) => renderGalleryCard(gallery))}
      </div>

      {/* View All Link */}
      {!showAll && galleryItems.length > maxGalleries && (
        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <Link
            to={`/galleries?owner=${userId}&type=${profileType}`}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm flex items-center justify-center group"
          >
            View All {galleryItems.length} Galleries
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileGalleryWidget;