import React, { useState, useEffect } from 'react';
import { Eye, Star, Image, ArrowRight } from 'lucide-react';
import { opportunitiesApi } from '../api/opportunitiesApi';
import { OpportunityGallery } from '../types';

interface OpportunityGalleriesProps {
  opportunityId: string;
  showViewAll?: boolean;
  limit?: number;
}

export const OpportunityGalleries: React.FC<OpportunityGalleriesProps> = ({
  opportunityId,
  showViewAll = true,
  limit
}) => {
  const [galleries, setGalleries] = useState<OpportunityGallery[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGalleries();
  }, [opportunityId]);

  const loadGalleries = async () => {
    try {
      setLoading(true);
      const galleryData = await opportunitiesApi.getOpportunityGalleries(opportunityId);
      
      // Apply limit if specified
      const limitedGalleries = limit ? galleryData.slice(0, limit) : galleryData;
      setGalleries(limitedGalleries);
    } catch (error) {
      console.error('Error loading opportunity galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoverImageUrl = (gallery: any) => {
    if (gallery?.cover_photo_id) {
      // Use the storage_path from the database
      return gallery.storage_path || '/placeholder-image.png';
    }
    return '/placeholder-image.png';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (galleries.length === 0) {
    return null; // Don't show empty section
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Related Galleries
            </h3>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {galleries.length}
            </span>
          </div>
          {showViewAll && galleries.length > 3 && (
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleries.map((attachment) => (
            <div key={attachment.id} className="group cursor-pointer">
              <a
                href={`/galleries/${attachment.gallery?.slug}`}
                className="block bg-gray-50 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Gallery Image */}
                <div className="relative h-32">
                  <img
                    src={getCoverImageUrl(attachment.gallery)}
                    alt={attachment.gallery?.title || 'Gallery'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {attachment.featured && (
                    <div className="absolute top-2 left-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>

                {/* Gallery Info */}
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 truncate text-sm">
                    {attachment.gallery?.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {attachment.gallery?.photo_count} photos
                  </p>
                  
                  {attachment.caption && (
                    <p className="text-xs text-gray-700 mt-2 italic line-clamp-2">
                      "{attachment.caption}"
                    </p>
                  )}

                  {/* Owner */}
                  <div className="flex items-center mt-2">
                    {attachment.gallery?.owner_image && (
                      <img
                        src={attachment.gallery.owner_image}
                        alt={attachment.gallery?.owner_name}
                        className="h-4 w-4 rounded-full"
                      />
                    )}
                    <span className="ml-1 text-xs text-gray-500 truncate">
                      {attachment.gallery?.owner_name}
                    </span>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* View All Button (for mobile) */}
        {showViewAll && galleries.length > 3 && (
          <div className="mt-4 text-center md:hidden">
            <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Galleries
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityGalleries;