import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { Gallery, GalleryFilters } from '@/features/gallery/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  selectSelectedGalleries, 
  selectViewMode, 
  toggleGallerySelection,
  clearGallerySelection,
  setViewMode
} from '@/features/gallery/store/galleryUISlice';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Image,
  Users,
  Calendar,
  Filter,
  Download,
  Upload,
  Copy,
  Archive,
  Star,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Grid,
  List,
  Photos
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import AdminPhotoManager from './AdminPhotoManager';
import GalleryCreationModal from './GalleryCreationModal';
import GalleryEditModal from './GalleryEditModal';
import ConfirmationDialog from './ConfirmationDialog';

const GalleryManagementPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const selectedGalleries = useAppSelector(selectSelectedGalleries);
  const viewMode = useAppSelector(selectViewMode);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<GalleryFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [viewingGallery, setViewingGallery] = useState<Gallery | null>(null);
  const [managingPhotos, setManagingPhotos] = useState<Gallery | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    galleries: Gallery[];
    single: boolean;
  }>({ open: false, galleries: [], single: false });

  const pageSize = 20;

  // Fetch galleries with filters
  const { data: galleriesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-galleries', currentPage, searchTerm, filters],
    queryFn: () => galleryApi.getAllGalleries({
      ...filters,
      search: searchTerm,
      page: currentPage,
      limit: pageSize
    })
  });

  // Delete galleries mutation
  const deleteGalleriesMutation = useMutation({
    mutationFn: async (galleryIds: string[]) => {
      await Promise.all(galleryIds.map(id => galleryApi.deleteGallery(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      setSelectedGalleries([]);
    }
  });

  // Create gallery mutation
  const createGalleryMutation = useMutation({
    mutationFn: (galleryData: Partial<Gallery>) => galleryApi.createGallery(galleryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      setShowCreateModal(false);
    }
  });

  // Update gallery mutation
  const updateGalleryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Gallery> }) =>
      galleryApi.updateGallery(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      setEditingGallery(null);
    }
  });

  const handleBatchAction = async (action: string) => {
    if (selectedGalleries.length === 0) return;

    switch (action) {
      case 'delete':
        if (confirm(`Delete ${selectedGalleries.length} galleries?`)) {
          deleteGalleriesMutation.mutate(selectedGalleries);
        }
        break;
      case 'archive':
        // Implement batch archive
        break;
      case 'feature':
        // Implement batch feature
        break;
    }
  };

  const handleSelectAll = () => {
    if (selectedGalleries.length === galleriesData?.galleries.length) {
      setSelectedGalleries([]);
    } else {
      setSelectedGalleries(galleriesData?.galleries.map(g => g.id) || []);
    }
  };

  const totalPages = galleriesData?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gallery Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {galleriesData?.totalCount || 0} galleries total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Gallery
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search galleries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Privacy Level
              </label>
              <Select
                value={filters.privacy || ''}
                onValueChange={(value) => setFilters({...filters, privacy: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All privacy levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All privacy levels</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Owner Type
              </label>
              <Select
                value={filters.ownerType || ''}
                onValueChange={(value) => setFilters({...filters, ownerType: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All owner types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All owner types</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <Select
                value={filters.sortBy || 'date'}
                onValueChange={(value) => setFilters({...filters, sortBy: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value) => setFilters({...filters, sortOrder: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedGalleries.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedGalleries.length} galleries selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction('feature')}
            >
              <Star className="h-4 w-4 mr-2" />
              Feature
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction('archive')}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBatchAction('delete')}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Galleries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <Checkbox
                  checked={selectedGalleries.length === galleriesData?.galleries.length && galleriesData?.galleries.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Gallery
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Privacy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Photos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Loading galleries...
                </td>
              </tr>
            ) : galleriesData?.galleries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No galleries found
                </td>
              </tr>
            ) : (
              galleriesData?.galleries.map((gallery) => (
                <tr key={gallery.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedGalleries.includes(gallery.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedGalleries([...selectedGalleries, gallery.id]);
                        } else {
                          setSelectedGalleries(selectedGalleries.filter(id => id !== gallery.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 mr-4 flex-shrink-0">
                        {gallery.cover_photo_url ? (
                          <img
                            src={gallery.cover_photo_url}
                            alt={gallery.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {gallery.title}
                        </div>
                        {gallery.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {gallery.description}
                          </div>
                        )}
                        {gallery.is_featured && (
                          <Badge variant="secondary" className="mt-1">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {gallery.owner?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {gallery.owner_type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      gallery.privacy_level === 'public' ? 'default' :
                      gallery.privacy_level === 'private' ? 'destructive' : 'secondary'
                    }>
                      {gallery.privacy_level}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setManagingPhotos(gallery)}
                      className="flex items-center text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Click to manage photos"
                    >
                      <Image className="h-4 w-4 mr-1" />
                      {gallery.photo_count || 0}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                      <Eye className="h-4 w-4 mr-1" />
                      {gallery.view_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(gallery.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewingGallery(gallery)}
                        title="View Gallery"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGallery(gallery)}
                        title="Edit Gallery"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setManagingPhotos(gallery)}
                        title="Manage Photos"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setViewingGallery(gallery)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingGallery(gallery)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Gallery
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setManagingPhotos(gallery)}>
                            <Image className="h-4 w-4 mr-2" />
                            Manage Photos
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm(`Delete gallery "${gallery.title}"?`)) {
                                deleteGalleriesMutation.mutate([gallery.id]);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, galleriesData?.totalCount || 0)} of{' '}
            {galleriesData?.totalCount || 0} galleries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Gallery Modal */}
      {viewingGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Gallery Details
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setViewingGallery(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                {viewingGallery.cover_photo_url && (
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                    <img
                      src={viewingGallery.cover_photo_url}
                      alt={viewingGallery.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {viewingGallery.title}
                  </h4>
                  {viewingGallery.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {viewingGallery.description}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Owner:</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {viewingGallery.owner?.name || 'Unknown'} ({viewingGallery.owner_type})
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Privacy:</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {viewingGallery.privacy_level}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Photos:</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {viewingGallery.photo_count || 0}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Views:</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {viewingGallery.view_count || 0}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(viewingGallery.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {viewingGallery.is_featured && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <Badge variant="secondary" className="ml-2">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingGallery(null);
                    setEditingGallery(viewingGallery);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Gallery
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setViewingGallery(null);
                    setManagingPhotos(viewingGallery);
                  }}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Manage Photos
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setViewingGallery(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Gallery Modal */}
      {editingGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit Gallery
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setEditingGallery(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updates = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                privacy_level: formData.get('privacy_level') as Gallery['privacy_level'],
                is_featured: formData.get('is_featured') === 'on'
              };
              updateGalleryMutation.mutate({ id: editingGallery.id, updates });
            }}>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <Input
                    name="title"
                    defaultValue={editingGallery.title}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingGallery.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Privacy Level
                  </label>
                  <Select name="privacy_level" defaultValue={editingGallery.privacy_level}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    id="is_featured"
                    defaultChecked={editingGallery.is_featured}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Featured Gallery
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingGallery(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateGalleryMutation.isPending}
                >
                  {updateGalleryMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Gallery Modal - TODO: Implement create functionality */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Create New Gallery
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Gallery creation functionality will be implemented here.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Photo Manager Modal */}
      {managingPhotos && (
        <AdminPhotoManager
          gallery={managingPhotos}
          isOpen={!!managingPhotos}
          onClose={() => setManagingPhotos(null)}
        />
      )}
    </div>
  );
};

export default GalleryManagementPanel;