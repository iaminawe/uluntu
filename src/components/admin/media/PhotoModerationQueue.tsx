import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Photo } from '@/features/gallery/types';
import {
  Check,
  X,
  Eye,
  Flag,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  User,
  Calendar,
  Image as ImageIcon,
  MoreHorizontal,
  RefreshCw
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

interface PhotoWithModeration extends Photo {
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderation_notes?: string;
  flagged_by?: string;
  flagged_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  flag_reasons?: string[];
}

const PhotoModerationQueue: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState<PhotoWithModeration | null>(null);

  const pageSize = 20;

  // Fetch photos for moderation
  const { data: photosData, isLoading, refetch } = useQuery({
    queryKey: ['moderation-queue', currentPage, searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('gallery_photos')
        .select(`
          *,
          user_galleries(
            title,
            user_id
          ),
          members(
            name,
            email
          )
        `, { count: 'exact' });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('moderation_status', statusFilter);
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Pagination
      const from = (currentPage - 1) * pageSize;
      query = query
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        photos: (data || []) as PhotoWithModeration[],
        total: count || 0
      };
    }
  });

  // Moderate photo mutation
  const moderatePhotoMutation = useMutation({
    mutationFn: async ({ 
      photoId, 
      action, 
      reason 
    }: { 
      photoId: string; 
      action: 'approve' | 'reject' | 'flag'; 
      reason?: string 
    }) => {
      const updates: any = {
        moderation_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      };

      if (reason) {
        updates.moderation_notes = reason;
      }

      const { error } = await supabase
        .from('gallery_photos')
        .update(updates)
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setSelectedPhotos([]);
      setShowRejectModal(false);
      setRejectionReason('');
      setCurrentPhoto(null);
    }
  });

  // Batch moderate photos
  const batchModerateMutation = useMutation({
    mutationFn: async ({ 
      photoIds, 
      action, 
      reason 
    }: { 
      photoIds: string[]; 
      action: 'approve' | 'reject' | 'flag'; 
      reason?: string 
    }) => {
      const updates: any = {
        moderation_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      };

      if (reason) {
        updates.moderation_notes = reason;
      }

      const { error } = await supabase
        .from('gallery_photos')
        .update(updates)
        .in('id', photoIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setSelectedPhotos([]);
    }
  });

  const handleBatchAction = (action: 'approve' | 'reject' | 'flag') => {
    if (selectedPhotos.length === 0) return;

    if (action === 'approve') {
      batchModerateMutation.mutate({ photoIds: selectedPhotos, action });
    } else if (action === 'reject') {
      // Show bulk rejection modal
      setShowRejectModal(true);
    }
  };

  const handlePhotoAction = (photo: PhotoWithModeration, action: 'approve' | 'reject' | 'flag') => {
    if (action === 'approve') {
      moderatePhotoMutation.mutate({ photoId: photo.id, action });
    } else if (action === 'reject') {
      setCurrentPhoto(photo);
      setShowRejectModal(true);
    }
  };

  const handleRejectSubmit = () => {
    if (currentPhoto) {
      moderatePhotoMutation.mutate({
        photoId: currentPhoto.id,
        action: 'reject',
        reason: rejectionReason
      });
    } else if (selectedPhotos.length > 0) {
      batchModerateMutation.mutate({
        photoIds: selectedPhotos,
        action: 'reject',
        reason: rejectionReason
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedPhotos.length === photosData?.photos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(photosData?.photos.map(p => p.id) || []);
    }
  };

  const totalPages = Math.ceil((photosData?.total || 0) / pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'flagged':
        return <Badge variant="outline"><Flag className="h-3 w-3 mr-1" />Flagged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Photo Moderation Queue
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {photosData?.total || 0} photos in queue
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: '24', icon: Clock, color: 'orange' },
          { label: 'Approved Today', value: '156', icon: Check, color: 'green' },
          { label: 'Rejected Today', value: '8', icon: X, color: 'red' },
          { label: 'Flagged Content', value: '3', icon: Flag, color: 'yellow' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedPhotos.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedPhotos.length} photos selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction('approve')}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve All
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBatchAction('reject')}
            >
              <X className="h-4 w-4 mr-2" />
              Reject All
            </Button>
          </div>
        </div>
      )}

      {/* Photos Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <Checkbox
                  checked={selectedPhotos.length === photosData?.photos.length && photosData?.photos.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Gallery
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Uploader
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Loading photos...
                </td>
              </tr>
            ) : photosData?.photos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No photos found for moderation
                </td>
              </tr>
            ) : (
              photosData?.photos.map((photo) => (
                <tr key={photo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedPhotos.includes(photo.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPhotos([...selectedPhotos, photo.id]);
                        } else {
                          setSelectedPhotos(selectedPhotos.filter(id => id !== photo.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 mr-4 flex-shrink-0">
                        {photo.thumbnail_url || photo.url ? (
                          <img
                            src={photo.thumbnail_url || photo.url}
                            alt={photo.title || 'Photo'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {photo.title || photo.original_file_name}
                        </div>
                        {photo.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {photo.description}
                          </div>
                        )}
                        {photo.flag_reasons && (
                          <div className="flex items-center mt-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-xs text-yellow-600">
                              {photo.flag_reasons.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {(photo as any).user_galleries?.title || 'Unknown Gallery'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {(photo as any).members?.name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(photo as any).members?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(photo.moderation_status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(photo.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePhotoAction(photo, 'approve')}
                        disabled={photo.moderation_status === 'approved'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePhotoAction(photo, 'reject')}
                        disabled={photo.moderation_status === 'rejected'}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Flag for Review
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            View Moderation History
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
            {Math.min(currentPage * pageSize, photosData?.total || 0)} of{' '}
            {photosData?.total || 0} photos
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

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Reject Photo{selectedPhotos.length > 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting {selectedPhotos.length > 1 ? 'these photos' : 'this photo'}.
            </p>
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setCurrentPhoto(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoModerationQueue;