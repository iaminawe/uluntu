import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Image as ImageIcon, Lock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useGalleries } from '@/features/gallery/hooks/useGalleryQueries';
import { formatDistanceToNow } from 'date-fns';

const GalleriesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  
  const { data, isLoading: loading, error } = useGalleries({ 
    privacy: 'public',
    page: currentPage,
    limit: pageSize
  });
  
  const galleries = data?.galleries || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  const handleCreateGallery = () => {
    if (!user) {
      navigate('/login?redirect=/galleries/create');
      return;
    }
    navigate('/galleries/create');
  };

  const handleGalleryClick = (galleryId: string) => {
    navigate(`/galleries/${galleryId}`);
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return null;
      case 'members_only':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'private':
        return <Lock className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <ContentContainer>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </ContentContainer>
    );
  }

  if (error) {
    return (
      <ContentContainer>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading galleries</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700"
          >
            Try Again
          </button>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Camera className="w-8 h-8 text-blue-600" />
              Photo Galleries
            </h1>
            <p className="text-gray-600">
              Explore amazing photo collections from our community members
            </p>
          </div>
          <button
            onClick={handleCreateGallery}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Gallery
          </button>
        </div>

        {/* Galleries Grid */}
        {galleries.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-gray-50 rounded-lg mx-4 md:mx-0">
            <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              No galleries yet
            </h3>
            <p className="text-gray-600 mb-6 text-sm md:text-base px-4">
              Be the first to create a photo gallery and share your work!
            </p>
            {user && (
              <button
                onClick={handleCreateGallery}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Create Your First Gallery
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
            {galleries.map((gallery) => (
              <div
                key={gallery.id}
                onClick={() => handleGalleryClick(gallery.id)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
              >
                {/* Gallery Cover */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {gallery.cover_photo_url ? (
                    <img
                      src={gallery.cover_photo_url}
                      alt={gallery.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Photo Count Overlay */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs md:text-sm flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
                    {gallery.photo_count || 0}
                  </div>
                </div>

                {/* Gallery Info */}
                <div className="p-3 md:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg line-clamp-1 flex-1">
                      {gallery.title}
                    </h3>
                    {getPrivacyIcon(gallery.privacy_level)}
                  </div>
                  
                  {gallery.description && (
                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2 mb-3">
                      {gallery.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                    <span className="truncate flex-1 mr-2">
                      By {gallery.owner?.name || 'Unknown'}
                    </span>
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(gallery.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 px-4 md:px-0">
            {/* Mobile pagination */}
            <div className="md:hidden">
              <div className="text-xs text-gray-600 text-center mb-3">
                Page {currentPage} of {totalPages} ({totalCount} galleries)
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                
                <span className="px-3 py-2 text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Desktop pagination */}
            <div className="hidden md:flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} galleries
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 text-sm rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ContentContainer>
  );
};

export default GalleriesPage;