import React, { useState } from 'react';
import { BookmarkPlus, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { resourcesApi } from '@/features/resources/api/resourcesApi';

interface AddToResourcesButtonProps {
  galleryId: string;
  galleryTitle: string;
  galleryDescription?: string;
  galleryImage?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export const AddToResourcesButton: React.FC<AddToResourcesButtonProps> = ({
  galleryId,
  galleryTitle,
  galleryDescription,
  galleryImage,
  className = '',
  variant = 'default'
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector(selectCurrentUser);

  const handleAddToResources = async () => {
    if (!user) {
      setError('You must be logged in to add resources');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      // Create the resource entry
      await resourcesApi.create({
        title: galleryTitle,
        description: galleryDescription || `Photo gallery: ${galleryTitle}`,
        type: 'gallery',
        url: `/galleries/${galleryId}`,
        image: galleryImage || null,
        status: 'published',
        featured: false,
        contributorId: user.id,
        groupId: undefined, // Could be enhanced to support group association
        tags: ['gallery', 'photos', 'community']
      });

      setIsAdded(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 3000);

    } catch (err) {
      console.error('Error adding gallery to resources:', err);
      setError('Failed to add gallery to resources. Please try again.');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsAdding(false);
    }
  };

  const isCompact = variant === 'compact';

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className={isCompact ? 'text-sm' : 'text-base'}>
          {error}
        </span>
      </div>
    );
  }

  if (isAdded) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <Check className="w-4 h-4" />
        <span className={isCompact ? 'text-sm' : 'text-base'}>
          Added to Resources!
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleAddToResources}
      disabled={isAdding || !user}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
        ${!user 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
        }
        ${isCompact ? 'px-3 py-1 text-sm' : ''}
        ${className}
      `}
      title={!user ? 'Login required to add resources' : 'Add this gallery to community resources'}
    >
      {isAdding ? (
        <Loader2 className={`animate-spin ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} />
      ) : (
        <BookmarkPlus className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
      )}
      <span>
        {isAdding ? 'Adding...' : 'Add to Resources'}
      </span>
    </button>
  );
};