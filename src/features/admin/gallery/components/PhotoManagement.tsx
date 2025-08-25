import React, { useState, useCallback, useEffect } from 'react';
import { 
  ArrowLeft, Search, Filter, Grid, List, Star, Eye, Edit, Trash2, 
  Download, Move, Tag, MoreVertical, Image, Calendar, FileSize,
  CheckCircle, Clock, XCircle, AlertTriangle
} from 'lucide-react';
import { AdminPhotoView, AdminPhotoFilters, BulkPhotoOperation, AdminGalleryView } from '../types';
import { adminGalleryApi } from '../api/adminGalleryApi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PhotoDetailsPanel } from './PhotoDetailsPanel';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface PhotoManagementProps {
  gallery: AdminGalleryView;
  onBack: () => void;
  onEditGallery: () => void;
}

export const PhotoManagement: React.FC<PhotoManagementProps> = ({
  gallery,
  onBack,
  onEditGallery
}) => {
  // State management
  const [photos, setPhotos] = useState<AdminPhotoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter and view state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AdminPhotoFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Photo details panel
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showPhotoDetails, setShowPhotoDetails] = useState(false);

  // Load photos
  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appliedFilters = { ...filters };
      if (searchTerm) {
        appliedFilters.search = searchTerm;
      }
      appliedFilters.sortBy = sortBy as any;
      appliedFilters.sortOrder = sortOrder;

      const response = await adminGalleryApi.getAdminGalleryPhotos(gallery.id, {
        page: currentPage,
        limit: 50,
        filters: appliedFilters
      });

      setPhotos(response.photos);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [gallery.id, currentPage, filters, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // Photo selection
  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  const selectAllPhotos = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
  };

  // Bulk operations
  const handleBulkOperation = async (operation: BulkPhotoOperation) => {
    try {
      await adminGalleryApi.bulkUpdatePhotos(operation);
      await loadPhotos();
      setSelectedPhotos(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk operation failed');
    }
  };

  // Photo reordering
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UX
    setPhotos(items);

    try {
      // Update sort orders in database
      const updates = items.map((photo, index) => ({
        id: photo.id,
        order: index
      }));

      await adminGalleryApi.bulkUpdatePhotos({
        type: 'reorder',
        photoIds: updates.map(u => u.id),
        payload: { orders: updates }
      });
    } catch (err) {
      // Revert on error
      await loadPhotos();
      setError(err instanceof Error ? err.message : 'Failed to reorder photos');
    }
  };

  // Set cover photo
  const setCoverPhoto = async (photoId: string) => {
    try {
      await adminGalleryApi.setCoverPhoto(gallery.id, photoId);
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set cover photo');
    }
  };

  // Processing status icon
  const getProcessingIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {gallery.title}
            </h1>
            <Badge variant="secondary">
              {totalCount} photo{totalCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          {gallery.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {gallery.description}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={onEditGallery}>
          Gallery Settings
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search photos by title or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Controls */}
        <div className="flex gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

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
                Sort: {sortBy === 'sortOrder' ? 'Order' : sortBy} ({sortOrder})
              </Button>
            }
            items={[
              {
                label: 'Photo Order',
                onClick: () => { setSortBy('sortOrder'); setSortOrder('asc'); }
              },
              {
                label: 'Upload Date (Newest)',
                onClick: () => { setSortBy('uploadDate'); setSortOrder('desc'); }
              },
              {
                label: 'Upload Date (Oldest)',
                onClick: () => { setSortBy('uploadDate'); setSortOrder('asc'); }
              },
              {
                label: 'File Size (Largest)',
                onClick: () => { setSortBy('fileSize'); setSortOrder('desc'); }
              },
              {
                label: 'File Size (Smallest)',
                onClick: () => { setSortBy('fileSize'); setSortOrder('asc'); }
              },
              {
                label: 'Views (Most)',
                onClick: () => { setSortBy('views'); setSortOrder('desc'); }
              }
            ]}
          />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Visibility</label>
              <div className="space-y-2">
                {['visible', 'hidden'].map((visibility) => (
                  <label key={visibility} className="flex items-center">
                    <Checkbox
                      checked={filters.visibility?.includes(visibility) || false}
                      onChange={(checked) => {
                        const current = filters.visibility || [];
                        if (checked) {
                          setFilters({ ...filters, visibility: [...current, visibility] });
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
              <label className="block text-sm font-medium mb-2">Processing Status</label>
              <div className="space-y-2">
                {[
                  { value: 'completed', label: 'Completed', icon: CheckCircle },
                  { value: 'processing', label: 'Processing', icon: Clock },
                  { value: 'failed', label: 'Failed', icon: XCircle },
                  { value: 'pending', label: 'Pending', icon: AlertTriangle }
                ].map((status) => (
                  <label key={status.value} className="flex items-center">
                    <Checkbox
                      checked={filters.processingStatus?.includes(status.value) || false}
                      onChange={(checked) => {
                        const current = filters.processingStatus || [];
                        if (checked) {
                          setFilters({
                            ...filters,
                            processingStatus: [...current, status.value]
                          });
                        } else {
                          setFilters({
                            ...filters,
                            processingStatus: current.filter(s => s !== status.value)
                          });
                        }
                      }}
                    />
                    <span className="ml-2 text-sm flex items-center gap-2">
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">File Size Range</label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min size (MB)"
                  value={filters.fileSizeRange?.min ? filters.fileSizeRange.min / (1024 * 1024) : ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) * 1024 * 1024 : undefined;
                    setFilters({
                      ...filters,
                      fileSizeRange: {
                        ...filters.fileSizeRange,
                        min: value || 0
                      }
                    });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Max size (MB)"
                  value={filters.fileSizeRange?.max ? filters.fileSizeRange.max / (1024 * 1024) : ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) * 1024 * 1024 : undefined;
                    setFilters({
                      ...filters,
                      fileSizeRange: {
                        ...filters.fileSizeRange,
                        max: value || 0
                      }
                    });
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Date Range</label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={filters.uploadDateRange?.start || ''}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      uploadDateRange: {
                        ...filters.uploadDateRange,
                        start: e.target.value
                      }
                    });
                  }}
                />
                <Input
                  type="date"
                  value={filters.uploadDateRange?.end || ''}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      uploadDateRange: {
                        ...filters.uploadDateRange,
                        end: e.target.value
                      }
                    });
                  }}
                />
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
      {selectedPhotos.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation({
                  type: 'visibility',
                  photoIds: Array.from(selectedPhotos),
                  payload: { visibility: 'visible' }
                })}
              >
                <Eye className="w-4 h-4 mr-1" />
                Show
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation({
                  type: 'visibility',
                  photoIds: Array.from(selectedPhotos),
                  payload: { visibility: 'hidden' }
                })}
              >
                Hide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation({
                  type: 'tag',
                  photoIds: Array.from(selectedPhotos)
                })}
              >
                <Tag className="w-4 h-4 mr-1" />
                Tag
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation({
                  type: 'delete',
                  photoIds: Array.from(selectedPhotos)
                })}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Photos Display */}
      {photos.length === 0 ? (
        <EmptyState
          title="No photos in this gallery"
          description="Upload photos to get started"
          action={
            <Button>
              <Image className="w-4 h-4 mr-2" />
              Upload Photos
            </Button>
          }
        />
      ) : (
        <>
          {/* Selection Header */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <Checkbox
                checked={selectedPhotos.size === photos.length}
                onChange={selectAllPhotos}
              />
              <span className="ml-2 text-sm">
                Select all ({photos.length})
              </span>
            </label>
            <div className="text-sm text-gray-600">
              Showing {photos.length} of {totalCount} photos
            </div>
          </div>

          {/* Photo Grid */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="photos" direction={viewMode === 'grid' ? undefined : 'vertical'}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
                      : 'space-y-2'
                  }
                >
                  {photos.map((photo, index) => (
                    <Draggable key={photo.id} draggableId={photo.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? 'rotate-2 scale-105' : ''} transition-transform`}
                        >
                          <Card className={`overflow-hidden hover:shadow-md transition-shadow ${
                            viewMode === 'grid' ? 'aspect-square' : 'flex items-center p-3'
                          }`}>
                            {viewMode === 'grid' ? (
                              // Grid View
                              <div className="relative h-full">
                                {/* Selection Checkbox */}
                                <div className="absolute top-2 left-2 z-10">
                                  <Checkbox
                                    checked={selectedPhotos.has(photo.id)}
                                    onChange={() => togglePhotoSelection(photo.id)}
                                    className="bg-white/80 backdrop-blur"
                                  />
                                </div>

                                {/* Cover Photo Indicator */}
                                {gallery.cover_photo_id === photo.id && (
                                  <div className="absolute top-2 left-8 z-10">
                                    <Badge variant="secondary" size="sm" className="bg-yellow-100 text-yellow-800">
                                      <Star className="w-3 h-3 mr-1" />
                                      Cover
                                    </Badge>
                                  </div>
                                )}

                                {/* Image */}
                                <img
                                  src={photo.thumbnailUrl}
                                  alt={photo.title || 'Photo'}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => {
                                    setSelectedPhotoId(photo.id);
                                    setShowPhotoDetails(true);
                                  }}
                                />

                                {/* Status Indicators */}
                                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                                  {getProcessingIcon(photo.processingStatus)}
                                  {photo.visibility === 'hidden' && (
                                    <Badge variant="secondary" size="sm">Hidden</Badge>
                                  )}
                                </div>

                                {/* Actions Menu */}
                                <div className="absolute top-2 right-2">
                                  <DropdownMenu
                                    trigger={
                                      <Button size="sm" variant="ghost" className="bg-white/80 backdrop-blur">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    }
                                    items={[
                                      {
                                        label: 'View Details',
                                        icon: Eye,
                                        onClick: () => {
                                          setSelectedPhotoId(photo.id);
                                          setShowPhotoDetails(true);
                                        }
                                      },
                                      {
                                        label: 'Set as Cover',
                                        icon: Star,
                                        onClick: () => setCoverPhoto(photo.id),
                                        disabled: gallery.cover_photo_id === photo.id
                                      },
                                      {
                                        label: 'Download',
                                        icon: Download,
                                        onClick: () => window.open(photo.originalUrl, '_blank')
                                      },
                                      {
                                        label: 'Delete',
                                        icon: Trash2,
                                        onClick: () => handleBulkOperation({
                                          type: 'delete',
                                          photoIds: [photo.id]
                                        }),
                                        className: 'text-red-600'
                                      }
                                    ]}
                                  />
                                </div>
                              </div>
                            ) : (
                              // List View
                              <div className="flex items-center gap-4 w-full">
                                <Checkbox
                                  checked={selectedPhotos.has(photo.id)}
                                  onChange={() => togglePhotoSelection(photo.id)}
                                />
                                
                                <img
                                  src={photo.thumbnailUrl}
                                  alt={photo.title || 'Photo'}
                                  className="w-16 h-16 object-cover rounded cursor-pointer"
                                  onClick={() => {
                                    setSelectedPhotoId(photo.id);
                                    setShowPhotoDetails(true);
                                  }}
                                />
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium truncate">
                                      {photo.title || photo.fileName}
                                    </h4>
                                    {gallery.cover_photo_id === photo.id && (
                                      <Star className="w-4 h-4 text-yellow-500" />
                                    )}
                                  </div>
                                  
                                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <FileSize className="w-3 h-3" />
                                      {formatFileSize(photo.file_size)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(photo.uploadedAt || photo.created_at).toLocaleDateString()}
                                    </span>
                                    <span>{photo.width} × {photo.height}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {getProcessingIcon(photo.processingStatus)}
                                  <Badge variant={photo.visibility === 'visible' ? 'default' : 'secondary'}>
                                    {photo.visibility}
                                  </Badge>
                                  <DropdownMenu
                                    trigger={
                                      <Button size="sm" variant="ghost">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    }
                                    items={[
                                      {
                                        label: 'View Details',
                                        icon: Eye,
                                        onClick: () => {
                                          setSelectedPhotoId(photo.id);
                                          setShowPhotoDetails(true);
                                        }
                                      },
                                      {
                                        label: 'Set as Cover',
                                        icon: Star,
                                        onClick: () => setCoverPhoto(photo.id),
                                        disabled: gallery.cover_photo_id === photo.id
                                      },
                                      {
                                        label: 'Download',
                                        icon: Download,
                                        onClick: () => window.open(photo.originalUrl, '_blank')
                                      },
                                      {
                                        label: 'Delete',
                                        icon: Trash2,
                                        onClick: () => handleBulkOperation({
                                          type: 'delete',
                                          photoIds: [photo.id]
                                        }),
                                        className: 'text-red-600'
                                      }
                                    ]}
                                  />
                                </div>
                              </div>
                            )}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}

      {/* Photo Details Panel */}
      {selectedPhotoId && showPhotoDetails && (
        <PhotoDetailsPanel
          photoId={selectedPhotoId}
          galleryId={gallery.id}
          isOpen={showPhotoDetails}
          onClose={() => {
            setShowPhotoDetails(false);
            setSelectedPhotoId(null);
          }}
          onUpdate={loadPhotos}
        />
      )}

      {error && (
        <div className="text-center py-4">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={loadPhotos}>Retry</Button>
        </div>
      )}
    </div>
  );
};