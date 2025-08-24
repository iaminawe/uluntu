import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { Gallery, GalleryFilters } from '@/features/gallery/types';
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
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const GalleryManagementPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGalleries, setSelectedGalleries] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<GalleryFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);

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
                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                      <Image className="h-4 w-4 mr-1" />
                      {gallery.photo_count || 0}
                    </div>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGallery(gallery)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
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
                          <DropdownMenuItem className="text-red-600">
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

      {/* Modals would go here - Create Gallery Modal, Edit Gallery Modal etc. */}
      {/* These would be separate components for better organization */}
    </div>
  );
};

export default GalleryManagementPanel;