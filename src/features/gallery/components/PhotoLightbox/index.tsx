import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Share2, 
  Download,
  Info,
  Calendar,
  Camera,
  MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useGalleryFeatures } from '@/hooks/useConditionalFeatures';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import type { Photo } from '../../types';

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
  onLike?: (photoId: string) => void;
  onComment?: (photoId: string, comment: string) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  initialIndex,
  onClose,
  onLike,
  onComment
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const currentPhoto = photos[currentIndex];
  const user = useAppSelector(selectCurrentUser);
  const { features } = useGalleryFeatures();
  
  // Helper function to get public URL from storage path
  const getPublicUrl = useCallback((path: string | undefined) => {
    if (!path) return null;
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Otherwise, construct the public URL using Supabase storage
    return supabase.storage.from('gallery-photos').getPublicUrl(path).data.publicUrl;
  }, []);
  
  // Get the best available image URL for the current photo
  const currentPhotoUrl = useMemo(() => {
    if (!currentPhoto) return '';
    
    // Try URL fields first (they might already be full URLs)
    if (currentPhoto.large_url) return currentPhoto.large_url;
    if (currentPhoto.medium_url) return currentPhoto.medium_url;
    if (currentPhoto.url) return currentPhoto.url;
    if (currentPhoto.original_url) return currentPhoto.original_url;
    
    // Then try paths and convert to URLs
    const largePath = getPublicUrl(currentPhoto.large_path);
    if (largePath) return largePath;
    
    const mediumPath = getPublicUrl(currentPhoto.medium_path);
    if (mediumPath) return mediumPath;
    
    const storagePath = getPublicUrl(currentPhoto.storage_path);
    if (storagePath) return storagePath;
    
    const originalPath = getPublicUrl(currentPhoto.original_path);
    if (originalPath) return originalPath;
    
    return '';
  }, [currentPhoto, getPublicUrl]);
  
  // Debug: Log photo data to understand structure
  useEffect(() => {
    if (currentPhoto) {
      console.log('PhotoLightbox - Current photo data:', {
        id: currentPhoto.id,
        storage_path: currentPhoto.storage_path,
        medium_path: currentPhoto.medium_path,
        thumbnail_path: currentPhoto.thumbnail_path,
        url: currentPhoto.url,
        large_url: currentPhoto.large_url,
        medium_url: currentPhoto.medium_url,
        title: currentPhoto.title,
        computedUrl: currentPhotoUrl
      });
    }
  }, [currentPhoto, currentPhotoUrl]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  const handleLike = () => {
    if (!user) {
      // Redirect to login
      window.location.href = `/login?redirect=${window.location.pathname}`;
      return;
    }
    
    if (onLike && currentPhoto) {
      onLike(currentPhoto.id);
      setIsLiked(!isLiked);
    }
  };
  
  const handleComment = () => {
    if (!user) {
      // Redirect to login
      window.location.href = `/login?redirect=${window.location.pathname}`;
      return;
    }
    
    setShowCommentModal(true);
  };
  
  const submitComment = () => {
    if (onComment && currentPhoto && commentText.trim()) {
      onComment(currentPhoto.id, commentText);
      setCommentText('');
      setShowCommentModal(false);
    }
  };

  const handleDownload = () => {
    if (currentPhoto && currentPhotoUrl) {
      const link = document.createElement('a');
      link.href = currentPhotoUrl;
      link.download = currentPhoto.file_name || `photo-${currentPhoto.id}.jpg`;
      link.click();
    }
  };

  const formatExifData = (exif: any) => {
    if (!exif) return null;
    
    const items = [];
    if (exif.Camera) items.push(exif.Camera);
    if (exif.LensMake && exif.LensModel) {
      items.push(`${exif.LensMake} ${exif.LensModel}`);
    }
    if (exif.FocalLength) items.push(`${exif.FocalLength}mm`);
    if (exif.FNumber) items.push(`f/${exif.FNumber}`);
    if (exif.ExposureTime) items.push(`${exif.ExposureTime}s`);
    if (exif.ISO) items.push(`ISO ${exif.ISO}`);
    
    return items.join(' • ');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white">
            <span className="text-sm">
              {currentIndex + 1} / {photos.length}
            </span>
            {currentPhoto?.title && (
              <h2 className="text-lg font-medium">{currentPhoto.title}</h2>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={currentPhotoUrl}
          alt={currentPhoto?.title || 'Photo'}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Navigation Buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Photo Info */}
          <div className="flex items-center gap-6 text-white">
            {features.likes && (
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 hover:text-red-400 transition-colors ${
                  isLiked ? 'text-red-500' : ''
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{(currentPhoto as any)?.like_count || 0}</span>
              </button>
            )}
            
            {features.comments && (
              <button 
                onClick={handleComment}
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{(currentPhoto as any)?.comment_count || 0}</span>
              </button>
            )}
            
            <span className="text-sm text-gray-300">
              {currentPhoto?.created_at && 
                formatDistanceToNow(new Date(currentPhoto.created_at), { addSuffix: true })
              }
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 hover:bg-white/20 rounded transition-colors ${
                showInfo ? 'bg-white/20' : ''
              }`}
            >
              <Info className="w-5 h-5 text-white" />
            </button>
            
            <button className="p-2 hover:bg-white/20 rounded transition-colors">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/20 rounded transition-colors"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && currentPhoto && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-sm p-6 overflow-y-auto">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <h3 className="text-white font-semibold text-lg mb-4">Photo Details</h3>
          
          {currentPhoto.title && (
            <div className="mb-4">
              <h4 className="text-gray-400 text-sm mb-1">Title</h4>
              <p className="text-white">{currentPhoto.title}</p>
            </div>
          )}
          
          {currentPhoto.description && (
            <div className="mb-4">
              <h4 className="text-gray-400 text-sm mb-1">Description</h4>
              <p className="text-white text-sm">{currentPhoto.description}</p>
            </div>
          )}
          
          <div className="mb-4">
            <h4 className="text-gray-400 text-sm mb-1">Uploaded</h4>
            <p className="text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(currentPhoto.created_at).toLocaleDateString()}
            </p>
          </div>
          
          {(currentPhoto.metadata as any)?.exif && (
            <div className="mb-4">
              <h4 className="text-gray-400 text-sm mb-1">Camera Settings</h4>
              <p className="text-white text-sm flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {formatExifData((currentPhoto.metadata as any).exif)}
              </p>
            </div>
          )}
          
          {currentPhoto.metadata?.location && (
            <div className="mb-4">
              <h4 className="text-gray-400 text-sm mb-1">Location</h4>
              <p className="text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {currentPhoto.metadata.location.name || 
                  `${currentPhoto.metadata.location.latitude}, ${currentPhoto.metadata.location.longitude}`}
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <h4 className="text-gray-400 text-sm mb-1">File Info</h4>
            <p className="text-white text-sm">
              {currentPhoto.file_name} • {(currentPhoto.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-white text-sm">
              {currentPhoto.width} × {currentPhoto.height} pixels
            </p>
          </div>
          
          {currentPhoto.tags && currentPhoto.tags.length > 0 && (
            <div>
              <h4 className="text-gray-400 text-sm mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {currentPhoto.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 text-white text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Comment Modal */}
      {showCommentModal && features.comments && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add a Comment</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 
                         dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};