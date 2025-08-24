import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  X, 
  Plus, 
  Grid, 
  Calendar, 
  Lock, 
  Globe, 
  Users,
  Building,
  User,
  Star,
  CheckCircle
} from 'lucide-react';

import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Gallery, GalleryFilters } from '@/features/gallery/types';
import { galleryApi } from '@/features/gallery/api';

interface GallerySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGalleries: (galleries: Gallery[]) => void;
  selectedGalleryIds?: string[];
  multiSelect?: boolean;
  entityType?: 'user' | 'group' | 'company' | 'page';
  entityId?: string;
  title?: string;
}

const GallerySelector: React.FC<GallerySelectorProps> = ({
  isOpen,
  onClose,
  onSelectGalleries,
  selectedGalleryIds = [],
  multiSelect = true,
  entityType,
  entityId,
  title = 'Select Galleries'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedGalleryIds);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<GalleryFilters>({
    search: '',
    ownerType: entityType,
    ownerId: entityId
  });

  // Reset selected IDs when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedGalleryIds);
    }
  }, [isOpen, selectedGalleryIds]);

  // Fetch galleries
  const { data: galleries, isLoading } = useQuery({
    queryKey: ['galleries', filters],
    queryFn: () => galleryApi.getGalleries(filters),
    enabled: isOpen
  });

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, search: term }));
  }, []);

  // Handle gallery selection
  const handleSelectGallery = useCallback((gallery: Gallery) => {
    if (multiSelect) {
      setSelectedIds(prev => {
        const isSelected = prev.includes(gallery.id);
        if (isSelected) {
          return prev.filter(id => id !== gallery.id);
        } else {
          return [...prev, gallery.id];
        }
      });
    } else {
      setSelectedIds([gallery.id]);
    }
  }, [multiSelect]);

  // Handle confirm selection
  const handleConfirm = useCallback(() => {
    const selectedGalleries = galleries?.items?.filter(g => selectedIds.includes(g.id)) || [];
    onSelectGalleries(selectedGalleries);
    onClose();
  }, [galleries, selectedIds, onSelectGalleries, onClose]);

  // Get owner type icon
  const getOwnerIcon = (ownerType: Gallery['owner_type']) => {
    switch (ownerType) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
      case 'company':
        return <Building className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Get privacy level icon
  const getPrivacyIcon = (privacyLevel: Gallery['privacy_level']) => {
    switch (privacyLevel) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-500" />;
      case 'members_only':
        return <Users className="w-4 h-4 text-orange-500" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const handleCreateNew = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search galleries..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <Button
            onClick={handleCreateNew}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : galleries?.items?.length === 0 ? (
          <div className="text-center py-12">
            <Grid className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg mb-2">No galleries found</p>
            <p className="text-slate-400 text-sm mb-4">
              {searchTerm ? 'Try a different search term' : 'Create your first gallery to get started'}
            </p>
            <Button onClick={handleCreateNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Gallery
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {galleries?.items?.map((gallery) => {
              const isSelected = selectedIds.includes(gallery.id);
              
              return (
                <div
                  key={gallery.id}
                  onClick={() => handleSelectGallery(gallery)}
                  className={`relative group cursor-pointer border-2 rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-orange-500 text-white">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}

                  {/* Gallery thumbnail */}
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden">
                    {gallery.cover_photo_url ? (
                      <img
                        src={gallery.cover_photo_url}
                        alt={gallery.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Grid className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Gallery info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900 dark:text-white truncate">
                      {gallery.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        {getOwnerIcon(gallery.owner_type)}
                        <span>{gallery.owner?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPrivacyIcon(gallery.privacy_level)}
                        {gallery.is_featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{gallery.photo_count} photos</span>
                      <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selection summary */}
        {selectedIds.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700 dark:text-orange-300">
                {selectedIds.length} {multiSelect ? 'galleries' : 'gallery'} selected
              </span>
              <Button
                onClick={() => setSelectedIds([])}
                variant="ghost"
                size="sm"
                className="text-orange-700 dark:text-orange-300"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {galleries?.total || 0} galleries available
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {multiSelect ? `Select ${selectedIds.length}` : 'Select'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GallerySelector;