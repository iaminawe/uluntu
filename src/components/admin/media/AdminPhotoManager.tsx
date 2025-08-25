import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { Gallery, Photo, PhotoMetadata } from '@/features/gallery/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  selectSelectedPhotos, 
  selectIsBatchMode,
  selectViewMode,
  selectPhotoSize,
  togglePhotoSelection,
  clearPhotoSelection,
  selectAllPhotos,
  toggleBatchMode,
  setBatchOperationType,
  setViewMode,
  setPhotoSize,
  openLightbox
} from '@/features/gallery/store/galleryUISlice';
import {
  X,
  Upload,
  Image,
  Eye,
  Edit,
  Trash2,
  Download,
  Star,
  Tag,
  Move,
  Grid,
  List,
  MoreHorizontal,
  CheckSquare,
  Square,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Settings,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BulkPhotoUploader from './BulkPhotoUploader';
import PhotoMetadataModal from './PhotoMetadataModal';
import ConfirmationDialog from './ConfirmationDialog';

interface AdminPhotoManagerProps {
  gallery: Gallery;
  isOpen: boolean;
  onClose: () => void;
}

const AdminPhotoManager: React.FC<AdminPhotoManagerProps> = ({
  gallery,
  isOpen,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  const selectedPhotos = useAppSelector(selectSelectedPhotos);
  const isBatchMode = useAppSelector(selectIsBatchMode);
  const viewMode = useAppSelector(selectViewMode);
  const photoSize = useAppSelector(selectPhotoSize);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploader, setShowUploader] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    photos: Photo[];
    single: boolean;
  }>({ open: false, photos: [], single: false });
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  // Fetch gallery photos
  const { data: photos = [], isLoading, refetch } = useQuery({
    queryKey: ['gallery-photos', gallery.id],
    queryFn: () => galleryApi.getGalleryPhotos(gallery.id),
    enabled: isOpen
  });

  // Delete photos mutation
  const deletePhotosMutation = useMutation({
    mutationFn: (photoIds: string[]) => galleryApi.batchDeletePhotos(photoIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos', gallery.id] });
      dispatch(clearPhotoSelection());
    }
  });

  // Set cover photo mutation
  const setCoverPhotoMutation = useMutation({
    mutationFn: (photoId: string) => galleryApi.setCoverPhoto(gallery.id, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-photos', gallery.id] });
    }
  });

  // Reorder photos mutation
  const reorderPhotosMutation = useMutation({
    mutationFn: (photoOrders: { id: string; order: number }[]) => 
      galleryApi.reorderPhotos(gallery.id, photoOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos', gallery.id] });
    }
  });

  // Filter and sort photos
  const filteredPhotos = photos
    .filter(photo => 
      !searchTerm || 
      photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.title || a.file_name).localeCompare(b.title || b.file_name);
          break;
        case 'size':
          comparison = a.file_size - b.file_size;
          break;
        case 'date':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleSelectAll = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      dispatch(clearPhotoSelection());
    } else {
      dispatch(selectAllPhotos(filteredPhotos.map(p => p.id)));
    }
  };

  const handleBatchDelete = () => {
    const photosToDelete = photos.filter(p => selectedPhotos.includes(p.id));
    setDeleteConfirmation({
      open: true,
      photos: photosToDelete,
      single: false
    });
  };

  const handleSingleDelete = (photo: Photo) => {
    setDeleteConfirmation({
      open: true,
      photos: [photo],
      single: true
    });
  };

  const confirmDelete = async () => {
    const photoIds = deleteConfirmation.photos.map(p => p.id);
    await deletePhotosMutation.mutateAsync(photoIds);
    setDeleteConfirmation({ open: false, photos: [], single: false });
  };

  const handleDragStart = (e: React.DragEvent, photo: Photo) => {
    setDraggedPhoto(photo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    dragCounter.current++;
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverIndex(null);
    
    if (!draggedPhoto) return;
    
    const currentIndex = filteredPhotos.findIndex(p => p.id === draggedPhoto.id);
    if (currentIndex === targetIndex) return;
    
    const newPhotos = [...filteredPhotos];
    newPhotos.splice(currentIndex, 1);
    newPhotos.splice(targetIndex, 0, draggedPhoto);
    
    const photoOrders = newPhotos.map((photo, index) => ({
      id: photo.id,
      order: index
    }));
    
    reorderPhotosMutation.mutate(photoOrders);
    setDraggedPhoto(null);
  };

  const handleViewPhoto = (photo: Photo, index: number) => {
    dispatch(openLightbox({
      photos: filteredPhotos,
      startIndex: index
    }));
  };

  const getPhotoUrl = (photo: Photo, size: string = 'medium') => {
    switch (size) {
      case 'thumbnail':
        return photo.thumbnail_url || photo.small_url || photo.medium_url || photo.url;
      case 'small':
        return photo.small_url || photo.medium_url || photo.url;
      case 'large':
        return photo.large_url || photo.medium_url || photo.url;
      default:
        return photo.medium_url || photo.url;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Manage Photos: {gallery.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {photos.length} photos • {selectedPhotos.length} selected
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => dispatch(setViewMode('grid'))}
                  className="rounded-r-none border-r"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => dispatch(setViewMode('list'))}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Photo Size */}
              <Select value={photoSize} onValueChange={(value: any) => dispatch(setPhotoSize(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">S</SelectItem>
                  <SelectItem value="medium">M</SelectItem>
                  <SelectItem value="large">L</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => dispatch(toggleBatchMode())}
                className={isBatchMode ? 'bg-blue-50 border-blue-500' : ''}
              >
                {isBatchMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {isBatchMode ? 'Exit Batch' : 'Batch Mode'}
              </Button>

              <Button onClick={() => setShowUploader(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {/* Batch Actions */}
          {isBatchMode && selectedPhotos.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedPhotos.length} photos selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(clearPhotoSelection())}
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Tag className="h-4 w-4 mr-2" />
                    Add Tags
                  </Button>
                  <Button variant="outline" size="sm">
                    <Move className="h-4 w-4 mr-2" />
                    Move to Gallery
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-6 flex items-center justify-center h-64">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-3" />
              <span className="text-gray-500">Loading photos...</span>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="p-6 flex flex-col items-center justify-center h-64">
              <Image className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No photos found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                {searchTerm ? 'No photos match your search.' : 'This gallery is empty. Upload some photos to get started.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowUploader(true)} className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              )}
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {viewMode === 'grid' ? (
                <div className={`grid gap-4 p-6 ${
                  photoSize === 'small' ? 'grid-cols-6 md:grid-cols-8 lg:grid-cols-10' :
                  photoSize === 'large' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
                  'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                }`}>
                  {isBatchMode && (
                    <div className="col-span-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="mb-4"
                      >
                        {selectedPhotos.length === filteredPhotos.length ? (
                          <>
                            <Square className="h-4 w-4 mr-2" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Select All
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {filteredPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className={`group relative bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${
                        dragOverIndex === index ? 'ring-2 ring-blue-500' : ''
                      } ${selectedPhotos.includes(photo.id) ? 'ring-2 ring-blue-500' : ''}`}
                      draggable={!isBatchMode}
                      onDragStart={(e) => handleDragStart(e, photo)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDragEnter={handleDragEnter}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {/* Selection Checkbox */}
                      {isBatchMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={selectedPhotos.includes(photo.id)}
                            onCheckedChange={() => dispatch(togglePhotoSelection(photo.id))}
                            className="bg-white/90 backdrop-blur-sm"
                          />
                        </div>
                      )}

                      {/* Cover Photo Badge */}
                      {gallery.cover_photo_id === photo.id && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Cover
                          </Badge>
                        </div>
                      )}

                      {/* Photo */}
                      <div 
                        className={`aspect-square bg-gray-100 dark:bg-gray-600 overflow-hidden ${
                          photoSize === 'small' ? 'h-20' :
                          photoSize === 'large' ? 'h-48' : 'h-32'
                        }`}
                        onClick={() => !isBatchMode && handleViewPhoto(photo, index)}
                      >
                        <img
                          src={getPhotoUrl(photo, photoSize === 'large' ? 'medium' : 'thumbnail')}
                          alt={photo.title || photo.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>

                      {/* Photo Info */}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {photo.title || photo.file_name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{formatFileSize(photo.file_size)}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewPhoto(photo, index)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingPhoto(photo)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {gallery.cover_photo_id !== photo.id && (
                                <DropdownMenuItem
                                  onClick={() => setCoverPhotoMutation.mutate(photo.id)}
                                  disabled={setCoverPhotoMutation.isPending}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Set as Cover
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleSingleDelete(photo)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isBatchMode && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedPhotos.length === filteredPhotos.length ? (
                          <>
                            <Square className="h-4 w-4 mr-2" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Select All
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {filteredPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedPhotos.includes(photo.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      draggable={!isBatchMode}
                      onDragStart={(e) => handleDragStart(e, photo)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDragEnter={handleDragEnter}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {/* Selection */}
                      {isBatchMode && (
                        <Checkbox
                          checked={selectedPhotos.includes(photo.id)}
                          onCheckedChange={() => dispatch(togglePhotoSelection(photo.id))}
                        />
                      )}

                      {/* Thumbnail */}
                      <div 
                        className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => !isBatchMode && handleViewPhoto(photo, index)}
                      >
                        <img
                          src={getPhotoUrl(photo, 'thumbnail')}
                          alt={photo.title || photo.file_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {photo.title || photo.file_name}
                          </p>
                          {gallery.cover_photo_id === photo.id && (
                            <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Cover
                            </Badge>
                          )}
                        </div>
                        {photo.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {photo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{formatFileSize(photo.file_size)}</span>
                          <span>{photo.width} × {photo.height}</span>
                          <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                          {photo.tags && photo.tags.length > 0 && (
                            <div className="flex gap-1">
                              {photo.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {photo.tags.length > 3 && (
                                <span className="text-xs">+{photo.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPhoto(photo, index)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPhoto(photo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {gallery.cover_photo_id !== photo.id && (
                              <DropdownMenuItem
                                onClick={() => setCoverPhotoMutation.mutate(photo.id)}
                                disabled={setCoverPhotoMutation.isPending}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Set as Cover
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleSingleDelete(photo)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Photo Uploader */}
      {showUploader && (
        <BulkPhotoUploader
          galleryId={gallery.id}
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          onSuccess={() => {
            refetch();
            setShowUploader(false);
          }}
        />
      )}

      {/* Photo Metadata Modal */}
      {editingPhoto && (
        <PhotoMetadataModal
          photo={editingPhoto}
          isOpen={!!editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={() => {
            refetch();
            setEditingPhoto(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.open}
        title={deleteConfirmation.single ? 'Delete Photo' : 'Delete Photos'}
        message={deleteConfirmation.single 
          ? `Are you sure you want to delete "${deleteConfirmation.photos[0]?.title || deleteConfirmation.photos[0]?.file_name}"? This action cannot be undone.`
          : `Are you sure you want to delete ${deleteConfirmation.photos.length} photos? This action cannot be undone.`
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmation({ open: false, photos: [], single: false })}
        isLoading={deletePhotosMutation.isPending}
      />
    </div>
  );
};

export default AdminPhotoManager;