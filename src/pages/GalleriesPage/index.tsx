import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Image as ImageIcon, Lock, Users } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useGalleries } from '@/features/gallery/hooks/useGallery';
import { formatDistanceToNow } from 'date-fns';

const GalleriesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const { galleries, loading, error } = useGalleries({ visibility: 'public' });

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
      <PageContainer>
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
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading galleries</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No galleries yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to create a photo gallery and share your work!
            </p>
            {user && (
              <button
                onClick={handleCreateGallery}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Gallery
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Photo Count Overlay */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    {gallery.photo_count || 0}
                  </div>
                </div>

                {/* Gallery Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 flex-1">
                      {gallery.title}
                    </h3>
                    {getPrivacyIcon(gallery.privacy_level)}
                  </div>
                  
                  {gallery.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {gallery.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      By {gallery.owner?.name || 'Unknown'}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(gallery.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default GalleriesPage;