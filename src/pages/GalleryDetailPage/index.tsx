import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical,
  Lock,
  Users,
  Edit,
  Trash2,
  Flag,
  BookmarkPlus
} from 'lucide-react';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { PhotoLightbox } from '@/features/gallery/components/PhotoLightbox';
import { AddToResourcesButton } from '@/features/gallery/components/AddToResourcesButton';
import { formatDistanceToNow } from 'date-fns';
import type { Gallery, Photo } from '@/features/gallery/types';

const GalleryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    if (id) {
      loadGallery();
    }
  }, [id]);

  const loadGallery = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [galleryData, photosData] = await Promise.all([
        galleryApi.getGallery(id),
        galleryApi.getGalleryPhotos(id)
      ]);
      
      setGallery(galleryData);
      setPhotos(photosData);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleLikePhoto = async (photoId: string) => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }
    
    try {
      const isLiked = await galleryApi.likePhoto(photoId);
      // Update the photo in the list
      setPhotos(photos.map(photo => 
        photo.id === photoId 
          ? { 
              ...photo, 
              like_count: isLiked 
                ? ((photo as any).like_count || 0) + 1 
                : Math.max(((photo as any).like_count || 0) - 1, 0),
              is_liked: isLiked
            }
          : photo
      ));
    } catch (err) {
      console.error('Error liking photo:', err);
    }
  };

  const handleEditGallery = () => {
    navigate(`/galleries/${id}/edit`);
  };

  const handleDeleteGallery = async () => {
    if (!confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
      return;
    }
    
    try {
      await galleryApi.deleteGallery(id!);
      navigate('/my-galleries');
    } catch (err) {
      console.error('Error deleting gallery:', err);
      alert('Failed to delete gallery');
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return null;
      case 'members_only':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'private':
        return <Lock className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return 'Public Gallery';
      case 'members_only':
        return 'Members Only';
      case 'private':
        return 'Private Gallery';
      default:
        return privacy;
    }
  };

  if (loading) {
    return (
      <ContentContainer>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </ContentContainer>
    );
  }

  if (error || !gallery) {
    return (
      <ContentContainer>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{(error as any)?.message || 'Gallery not found'}</p>
          <button
            onClick={() => navigate('/galleries')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Galleries
          </button>
        </div>
      </ContentContainer>
    );
  }

  const isOwner = user?.id === gallery.owner_id;

  return (
    <ContentContainer>
      <div className="max-w-7xl mx-auto">
        {/* Gallery Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/galleries')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Galleries
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {gallery.title}
                  </h1>
                  {getPrivacyIcon(gallery.privacy_level)}
                </div>
                <p className="text-gray-600 mb-4">{gallery.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <div>
                    By <span className="font-medium text-gray-700">{gallery.owner?.name || 'Unknown User'}</span>
                  </div>
                  <div>
                    {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                  </div>
                  <div>
                    Created {formatDistanceToNow(new Date(gallery.created_at), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1">
                    {getPrivacyIcon(gallery.privacy_level)}
                    <span>{getPrivacyLabel(gallery.privacy_level)}</span>
                  </div>
                </div>
                
                {/* Add to Resources Button */}
                {!isOwner && gallery.privacy_level === 'public' && (
                  <AddToResourcesButton
                    galleryId={gallery.id}
                    galleryTitle={gallery.title}
                    galleryDescription={gallery.description}
                    galleryImage={gallery.cover_photo_url}
                    variant="compact"
                  />
                )}
              </div>

              {/* Action Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                
                {showMoreMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 py-1">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share Gallery
                      </button>
                      {isOwner && (
                        <>
                          <button
                            onClick={handleEditGallery}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Gallery
                          </button>
                          <button
                            onClick={handleDeleteGallery}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Gallery
                          </button>
                        </>
                      )}
                      {!isOwner && (
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600">
                          <Flag className="w-4 h-4" />
                          Report Gallery
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No photos in this gallery yet</p>
            {isOwner && (
              <button
                onClick={() => navigate(`/galleries/${id}/upload`)}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Photos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => handlePhotoClick(index)}
              >
                <img
                  src={photo.thumbnail_path || photo.medium_path || photo.storage_path}
                  alt={photo.alt_text || photo.title || 'Photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    {photo.title && (
                      <p className="font-medium text-sm mb-1 line-clamp-1">
                        {photo.title}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {(photo as any).like_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {(photo as any).comment_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selectedPhotoIndex !== null && (
          <PhotoLightbox
            photos={photos}
            initialIndex={selectedPhotoIndex}
            onClose={() => setSelectedPhotoIndex(null)}
            onLike={handleLikePhoto}
          />
        )}
      </div>
    </ContentContainer>
  );
};

export default GalleryDetailPage;