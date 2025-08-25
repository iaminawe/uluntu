import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, Eye, Edit, Trash2, Users, Lock, Globe, Calendar } from 'lucide-react';
import { AdminGalleryView, AdminGalleryFilters, BulkGalleryOperation } from '../types';
import { adminGalleryApi } from '../api/adminGalleryApi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface GalleryOverviewProps {
  onCreateGallery: () => void;
  onEditGallery: (gallery: AdminGalleryView) => void;
  onViewPhotos: (gallery: AdminGalleryView) => void;
}

export const GalleryOverview: React.FC<GalleryOverviewProps> = ({
  onCreateGallery,
  onEditGallery,
  onViewPhotos
}) => {
  // State management
  const [galleries, setGalleries] = useState<AdminGalleryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AdminGalleryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // View options
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load galleries
  const loadGalleries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appliedFilters = { ...filters };
      if (searchTerm) {
        appliedFilters.search = searchTerm;
      }

      const response = await adminGalleryApi.getAdminGalleries({
        page: currentPage,
        limit: 24,
        filters: appliedFilters,
        sortBy,
        sortOrder
      });

      setGalleries(response.galleries);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load galleries');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    loadGalleries();
  }, [loadGalleries]);

  // Gallery selection
  const toggleGallerySelection = (galleryId: string) => {
    const newSelection = new Set(selectedGalleries);
    if (newSelection.has(galleryId)) {
      newSelection.delete(galleryId);
    } else {
      newSelection.add(galleryId);
    }
    setSelectedGalleries(newSelection);
  };

  const selectAllGalleries = () => {
    if (selectedGalleries.size === galleries.length) {
      setSelectedGalleries(new Set());
    } else {
      setSelectedGalleries(new Set(galleries.map(g => g.id)));
    }
  };

  // Bulk operations
  const handleBulkOperation = async (operation: BulkGalleryOperation) => {
    try {
      await adminGalleryApi.bulkUpdateGalleries(operation);
      await loadGalleries();
      setSelectedGalleries(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk operation failed');
    }
  };

  // Delete gallery
  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
      return;
    }

    try {
      await adminGalleryApi.deleteAdminGallery(galleryId);
      await loadGalleries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gallery');
    }
  };

  // Privacy icon helper
  const getPrivacyIcon = (privacyLevel: string) => {
    switch (privacyLevel) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-500" />;
      case 'members_only':
        return <Users className="w-4 h-4 text-orange-500" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Moderation status badge
  const getModerationBadge = (status: string) => {
    const variants = {
      approved: 'success',
      pending: 'warning',
      rejected: 'error'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={loadGalleries}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gallery Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage all user galleries and photos
          </p>
        </div>
        <Button onClick={onCreateGallery} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Gallery
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search galleries by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
          
          <DropdownMenu
            trigger={
              <Button variant="outline">
                Sort: {sortBy} ({sortOrder})
              </Button>
            }
            items={[
              {
                label: 'Created Date (Newest)',
                onClick: () => { setSortBy('created_at'); setSortOrder('desc'); }
              },
              {
                label: 'Created Date (Oldest)',
                onClick: () => { setSortBy('created_at'); setSortOrder('asc'); }
              },
              {
                label: 'Title (A-Z)',
                onClick: () => { setSortBy('title'); setSortOrder('asc'); }
              },
              {
                label: 'Title (Z-A)',
                onClick: () => { setSortBy('title'); setSortOrder('desc'); }
              },
              {
                label: 'Photo Count (High-Low)',
                onClick: () => { setSortBy('photo_count'); setSortOrder('desc'); }
              },
              {
                label: 'Views (High-Low)',
                onClick: () => { setSortBy('view_count'); setSortOrder('desc'); }
              }
            ]}
          />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Privacy Level</label>
              <div className="space-y-2">
                {['public', 'members_only', 'private'].map((level) => (
                  <label key={level} className="flex items-center">
                    <Checkbox
                      checked={filters.privacyLevel?.includes(level) || false}
                      onChange={(checked) => {
                        const current = filters.privacyLevel || [];
                        if (checked) {
                          setFilters({
                            ...filters,
                            privacyLevel: [...current, level]
                          });
                        } else {
                          setFilters({
                            ...filters,
                            privacyLevel: current.filter(l => l !== level)
                          });
                        }
                      }}
                    />
                    <span className="ml-2 text-sm capitalize">
                      {level.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Visibility</label>
              <div className="space-y-2">
                {['visible', 'hidden', 'archived'].map((visibility) => (
                  <label key={visibility} className="flex items-center">
                    <Checkbox
                      checked={filters.visibility?.includes(visibility) || false}
                      onChange={(checked) => {
                        const current = filters.visibility || [];
                        if (checked) {
                          setFilters({
                            ...filters,
                            visibility: [...current, visibility]
                          });
                        } else {
                          setFilters({
                            ...filters,
                            visibility: current.filter(v => v !== visibility)
                          });
                        }
                      }}
                    />
                    <span className="ml-2 text-sm capitalize">{visibility}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Moderation Status</label>
              <div className="space-y-2">
                {['approved', 'pending', 'rejected'].map((status) => (
                  <label key={status} className="flex items-center">
                    <Checkbox
                      checked={filters.moderationStatus?.includes(status) || false}
                      onChange={(checked) => {
                        const current = filters.moderationStatus || [];
                        if (checked) {
                          setFilters({
                            ...filters,
                            moderationStatus: [...current, status]
                          });
                        } else {
                          setFilters({
                            ...filters,
                            moderationStatus: current.filter(s => s !== status)
                          });
                        }
                      }}
                    />
                    <span className="ml-2 text-sm capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setFilters({})}>
              Clear Filters
            </Button>
            <Button onClick={() => setCurrentPage(1)}>
              Apply Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedGalleries.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedGalleries.size} gallery{selectedGalleries.size !== 1 ? 'ies' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation({
                  type: 'visibility',
                  galleryIds: Array.from(selectedGalleries),
                  payload: { visibility: 'hidden' }
                })}
              >
                Hide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation({
                  type: 'visibility',
                  galleryIds: Array.from(selectedGalleries),
                  payload: { visibility: 'visible' }
                })}
              >
                Show
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation({
                  type: 'delete',
                  galleryIds: Array.from(selectedGalleries)
                })}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {galleries.length === 0 ? (
        <EmptyState
          title="No galleries found"
          description="Create your first gallery or adjust your search filters"
          action={
            <Button onClick={onCreateGallery}>
              <Plus className="w-4 h-4 mr-2" />
              Create Gallery
            </Button>
          }
        />
      ) : (
        <>
          {/* Selection Header */}
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center">
              <Checkbox
                checked={selectedGalleries.size === galleries.length}
                onChange={selectAllGalleries}
              />
              <span className="ml-2 text-sm">
                Select all ({galleries.length})
              </span>
            </label>
            <div className="text-sm text-gray-600">
              Showing {galleries.length} of {totalCount} galleries
            </div>
          </div>

          {/* Gallery Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleries.map((gallery) => (
              <Card key={gallery.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedGalleries.has(gallery.id)}
                      onChange={() => toggleGallerySelection(gallery.id)}
                      className="bg-white/80 backdrop-blur"
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                    {gallery.cover_photo_url ? (
                      <img
                        src={gallery.cover_photo_url}
                        alt={gallery.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">No cover photo</span>
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3">
                      <DropdownMenu
                        trigger={
                          <Button size="sm" variant="ghost" className="bg-white/80 backdrop-blur">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: 'View Photos',
                            icon: Eye,
                            onClick: () => onViewPhotos(gallery)
                          },
                          {
                            label: 'Edit Gallery',
                            icon: Edit,
                            onClick: () => onEditGallery(gallery)
                          },
                          {
                            label: 'Delete',
                            icon: Trash2,
                            onClick: () => handleDeleteGallery(gallery.id),
                            className: 'text-red-600'
                          }
                        ]}
                      />
                    </div>

                    {/* Status Indicators */}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {gallery.featured && (
                        <Badge variant="secondary" size="sm">
                          Featured
                        </Badge>
                      )}
                      {getModerationBadge(gallery.moderationStatus)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {gallery.title}
                    </h3>
                    {getPrivacyIcon(gallery.privacy_level)}
                  </div>
                  
                  {gallery.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{gallery.photo_count} photos</span>
                      <span>{gallery.stats.viewCount} views</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(gallery.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Owner: {gallery.owner.name}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewPhotos(gallery)}
                      className="flex-1"
                    >
                      View Photos
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditGallery(gallery)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showInfo={{
                total: totalCount,
                current: galleries.length,
                perPage: 24
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};