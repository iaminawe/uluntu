import React, { useState, useRef, useEffect } from 'react';
import { Check, Download, Eye, Heart, MoreVertical, Trash2, Star } from 'lucide-react';
import { Photo } from '../../types';
import { formatFileSize, getPhotoUrl } from '../../utils';

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  onSelect: (photoId: string) => void;
  onClick: () => void;
  onDelete?: (photoId: string) => void;
  onSetCover?: (photoId: string) => void;
  showSelection?: boolean;
  size?: 'small' | 'medium' | 'large';
  isCover?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  isSelected,
  onSelect,
  onClick,
  onDelete,
  onSetCover,
  showSelection = false,
  size = 'medium',
  isCover = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64'
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(photo.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(photo.id);
  };

  const handleSetCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetCover?.(photo.id);
    setShowMenu(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div
      className={`relative group cursor-pointer overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 ${sizeClasses[size]}`}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={getPhotoUrl(photo, size === 'small' ? 'thumbnail' : 'medium')}
        alt={photo.title || 'Photo'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Top actions */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {showSelection && (
            <button
              onClick={handleSelect}
              className={`p-2 rounded-full transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
              aria-label={isSelected ? 'Deselect photo' : 'Select photo'}
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          
          <div className="flex gap-1 ml-auto">
            {(onDelete || onSetCover) && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleMenuClick}
                  className="p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 
                           hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg 
                                border border-slate-200 dark:border-slate-700 py-1 z-50">
                    {onSetCover && !isCover && (
                      <button
                        onClick={handleSetCover}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 
                                 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Set as Cover
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 
                                 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          {photo.title && (
            <h4 className="text-sm font-medium truncate mb-1">{photo.title}</h4>
          )}
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>{formatFileSize(photo.file_size)}</span>
            <div className="flex items-center gap-3">
              {photo.metadata?.camera && (
                <span className="truncate max-w-[100px]">{photo.metadata.camera}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selection indicator without hover */}
      {showSelection && isSelected && (
        <div className="absolute top-2 left-2 p-2 rounded-full bg-orange-500 text-white">
          <Check className="h-4 w-4" />
        </div>
      )}
      
      {/* Cover indicator */}
      {isCover && (
        <div className="absolute top-2 right-2 p-2 rounded-full bg-yellow-500 text-white" title="Cover Photo">
          <Star className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default PhotoCard;