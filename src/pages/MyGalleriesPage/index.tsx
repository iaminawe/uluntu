import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Image as ImageIcon, 
  Lock, 
  Users, 
  Globe,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useGalleries } from '@/features/gallery/hooks/useGallery';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { formatDistanceToNow } from 'date-fns';
import type { Gallery } from '@/features/gallery/types';

const MyGalleriesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const { galleries, loading, error, refetch } = useGalleries({ 
    ownerId: user?.id 
  });
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'members_only' | 'private'>('all');

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-galleries');
    }
  }, [user, navigate]);

  const handleCreateGallery = () => {
    navigate('/galleries/create');
  };

  const handleGalleryClick = (galleryId: string) => {
    navigate(`/galleries/${galleryId}`);
  };

  const handleEditGallery = (e: React.MouseEvent, galleryId: string) => {
    e.stopPropagation();
    navigate(`/galleries/${galleryId}/edit`);
  };

  const handleDeleteGallery = async (e: React.MouseEvent, gallery: Gallery) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${gallery.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await galleryApi.deleteGallery(gallery.id);
      refetch();
    } catch (err) {
      console.error('Error deleting gallery:', err);
      alert('Failed to delete gallery');
    }
  };

  const handleToggleVisibility = async (e: React.MouseEvent, gallery: Gallery) => {
    e.stopPropagation();
    
    try {
      const newVisibility = gallery.visibility === 'visible' ? 'hidden' : 'visible';
      await galleryApi.updateGallery(gallery.id, { visibility: newVisibility });
      refetch();
    } catch (err) {
      console.error('Error updating gallery visibility:', err);
      alert('Failed to update gallery visibility');
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'members_only':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'private':
        return <Lock className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return 'Public';
      case 'members_only':
        return 'Members Only';
      case 'private':
        return 'Private';
      default:
        return privacy;
    }
  };

  const filteredGalleries = filter === 'all' 
    ? galleries 
    : galleries.filter(g => g.privacy_level === filter);

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
          <p className="text-red-600 mb-4">Error loading your galleries</p>
          <button
            onClick={() => refetch()}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Galleries</h1>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Privacy Filter */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({galleries.length})
              </button>
              <button
                onClick={() => setFilter('public')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'public' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Globe className="w-4 h-4" />
                Public
              </button>
              <button
                onClick={() => setFilter('members_only')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'members_only' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Members
              </button>
              <button
                onClick={() => setFilter('private')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'private' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                Private
              </button>
            </div>

            <button
              onClick={handleCreateGallery}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Gallery
            </button>
          </div>
        </div>

        {/* Galleries Grid */}
        {filteredGalleries.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'all' 
                ? 'No galleries yet' 
                : `No ${getPrivacyLabel(filter).toLowerCase()} galleries`}
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first photo gallery to start sharing your work!
            </p>
            <button
              onClick={handleCreateGallery}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Gallery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGalleries.map((gallery) => (
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
                  
                  {/* Visibility Badge */}
                  {gallery.visibility === 'hidden' && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                      <EyeOff className="w-4 h-4" />
                      Hidden
                    </div>
                  )}
                </div>

                {/* Gallery Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                        {gallery.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getPrivacyIcon(gallery.privacy_level)}
                        <span className="text-sm text-gray-600">
                          {getPrivacyLabel(gallery.privacy_level)}
                        </span>
                      </div>
                    </div>

                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === gallery.id ? null : gallery.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {activeMenuId === gallery.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                            }}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-20 py-1">
                            <button
                              onClick={(e) => handleToggleVisibility(e, gallery)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                              {gallery.visibility === 'visible' ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  Hide Gallery
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  Show Gallery
                                </>
                              )}
                            </button>
                            <button
                              onClick={(e) => handleEditGallery(e, gallery.id)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Gallery
                            </button>
                            <button
                              onClick={(e) => handleDeleteGallery(e, gallery)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Gallery
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {gallery.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {gallery.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {gallery.view_count || 0} views
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

export default MyGalleriesPage;