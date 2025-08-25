import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { Photo } from '@/features/gallery/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import {
  Check,
  X,
  Eye,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Image,
  MessageSquare,
  Flag,
  Shield,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Input } from '@/components/ui/input';
import ConfirmationDialog from './ConfirmationDialog';
import { toast } from 'react-hot-toast';

interface PhotoModerationInterfaceProps {
  className?: string;
}

interface ModerationItem {
  id: string;
  photo: Photo;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  flags: string[];
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
}

const PhotoModerationInterface: React.FC<PhotoModerationInterfaceProps> = ({ className }) => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  
  const [selectedPhoto, setSelectedPhoto] = useState<ModerationItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged' | 'rejected'>('pending');
  const [reviewNotes, setReviewNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'delete';
    item: ModerationItem | null;
  }>({ open: false, action: 'approve', item: null });

  // Mock data - in real app, this would come from an API
  const mockModerationItems: ModerationItem[] = [
    {
      id: '1',
      photo: {
        id: 'photo-1',
        gallery_id: 'gallery-1',
        user_id: 'user-1',
        file_name: 'IMG_001.jpg',
        original_file_name: 'IMG_001.jpg',
        file_size: 2048000,
        mime_type: 'image/jpeg',
        storage_path: '/photos/img_001.jpg',
        medium_url: 'https://picsum.photos/800/600?random=1',
        thumbnail_url: 'https://picsum.photos/200/200?random=1',
        width: 800,
        height: 600,
        title: 'Beautiful landscape',
        description: 'A stunning view from the mountains',
        alt_text: 'Mountain landscape with blue sky',
        tags: ['nature', 'landscape', 'mountains'],
        sort_order: 0,
        visibility: 'visible',
        created_at: new Date().toISOString(),
        processing_status: 'completed'
      },
      status: 'pending',
      submitted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      flags: ['inappropriate-content'],
      reporter: {
        id: 'user-2',
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: '2',
      photo: {
        id: 'photo-2',
        gallery_id: 'gallery-1',
        user_id: 'user-2',
        file_name: 'IMG_002.jpg',
        original_file_name: 'IMG_002.jpg',
        file_size: 1536000,
        mime_type: 'image/jpeg',
        storage_path: '/photos/img_002.jpg',
        medium_url: 'https://picsum.photos/800/600?random=2',
        thumbnail_url: 'https://picsum.photos/200/200?random=2',
        width: 800,
        height: 600,
        title: 'City street art',
        description: 'Colorful graffiti on a wall',
        alt_text: 'Street art graffiti',
        tags: ['art', 'street', 'urban'],
        sort_order: 1,
        visibility: 'visible',
        created_at: new Date().toISOString(),
        processing_status: 'completed'
      },
      status: 'flagged',
      submitted_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      flags: ['copyright-violation', 'inappropriate-content']
    }
  ];

  // Filter items based on selected filter
  const filteredItems = mockModerationItems.filter(item => {
    switch (filter) {
      case 'pending':
        return item.status === 'pending';
      case 'flagged':
        return item.status === 'flagged';
      case 'rejected':
        return item.status === 'rejected';
      default:
        return true;
    }
  });

  // Moderation mutations (mock implementations)
  const approveMutation = useMutation({
    mutationFn: async ({ itemId, notes }: { itemId: string; notes?: string }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Photo approved successfully');
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setReviewNotes('');
      setConfirmAction({ open: false, action: 'approve', item: null });
      goToNext();
    },
    onError: () => {
      toast.error('Failed to approve photo');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ itemId, notes }: { itemId: string; notes?: string }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Photo rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setReviewNotes('');
      setConfirmAction({ open: false, action: 'reject', item: null });
      goToNext();
    },
    onError: () => {
      toast.error('Failed to reject photo');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Photo deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setConfirmAction({ open: false, action: 'delete', item: null });
      goToNext();
    },
    onError: () => {
      toast.error('Failed to delete photo');
    }
  });

  const handleApprove = (item: ModerationItem) => {
    setConfirmAction({ open: true, action: 'approve', item });
  };

  const handleReject = (item: ModerationItem) => {
    setConfirmAction({ open: true, action: 'reject', item });
  };

  const handleDelete = (item: ModerationItem) => {
    setConfirmAction({ open: true, action: 'delete', item });
  };

  const confirmModerationAction = () => {
    if (!confirmAction.item) return;

    const notes = reviewNotes.trim();
    
    switch (confirmAction.action) {
      case 'approve':
        approveMutation.mutate({ itemId: confirmAction.item.id, notes });
        break;
      case 'reject':
        rejectMutation.mutate({ itemId: confirmAction.item.id, notes });
        break;
      case 'delete':
        deleteMutation.mutate(confirmAction.item.id);
        break;
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedPhoto(filteredItems[newIndex]);
    }
  };

  const goToNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedPhoto(filteredItems[newIndex]);
    } else if (filteredItems.length > 0) {
      // Stay on the last item or go to previous if current was removed
      const newIndex = Math.min(currentIndex, filteredItems.length - 1);
      setCurrentIndex(newIndex);
      setSelectedPhoto(filteredItems[newIndex]);
    } else {
      setSelectedPhoto(null);
      setCurrentIndex(0);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: ModerationItem['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'flagged':
        return <Badge variant="destructive"><Flag className="h-3 w-3 mr-1" />Flagged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFlagBadge = (flag: string) => {
    const flagLabels: Record<string, string> = {
      'inappropriate-content': 'Inappropriate',
      'copyright-violation': 'Copyright',
      'spam': 'Spam',
      'harassment': 'Harassment',
      'violence': 'Violence',
      'nudity': 'Nudity'
    };

    return (
      <Badge key={flag} variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {flagLabels[flag] || flag}
      </Badge>
    );
  };

  // Initialize selected photo
  React.useEffect(() => {
    if (filteredItems.length > 0 && !selectedPhoto) {
      setSelectedPhoto(filteredItems[0]);
      setCurrentIndex(0);
    }
  }, [filteredItems, selectedPhoto]);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Photo Moderation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and moderate reported or flagged photos
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mockModerationItems.filter(i => i.status === 'pending').length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mockModerationItems.filter(i => i.status === 'flagged').length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mockModerationItems.filter(i => i.status === 'approved').length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <X className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mockModerationItems.filter(i => i.status === 'rejected').length}
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No items to review
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? 'All photos have been reviewed.'
              : `No ${filter} photos at this time.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photo Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {selectedPhoto && (
              <>
                {/* Navigation */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevious}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currentIndex + 1} of {filteredItems.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNext}
                      disabled={currentIndex === filteredItems.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedPhoto.status)}
                    {selectedPhoto.flags.map(flag => getFlagBadge(flag))}
                  </div>
                </div>

                {/* Photo */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <img
                    src={selectedPhoto.photo.medium_url || selectedPhoto.photo.url}
                    alt={selectedPhoto.photo.alt_text || selectedPhoto.photo.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Photo Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedPhoto.photo.title || selectedPhoto.photo.file_name}
                    </h3>
                    {selectedPhoto.photo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedPhoto.photo.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">File:</span>
                      <p className="text-gray-900 dark:text-gray-100">{selectedPhoto.photo.original_file_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Size:</span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {(selectedPhoto.photo.file_size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Dimensions:</span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {selectedPhoto.photo.width} × {selectedPhoto.photo.height}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {formatDate(selectedPhoto.photo.created_at)}
                      </p>
                    </div>
                  </div>

                  {selectedPhoto.photo.tags && selectedPhoto.photo.tags.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Tags:</span>
                      <div className="flex gap-1 mt-1">
                        {selectedPhoto.photo.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Review Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {selectedPhoto && (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Review Details
                  </h3>
                </div>

                <div className="p-4 space-y-6">
                  {/* Report Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Report Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Reported:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {formatDate(selectedPhoto.submitted_at)}
                        </span>
                      </div>
                      {selectedPhoto.reporter && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Reporter:</span>
                          <div className="text-right">
                            <p className="text-gray-900 dark:text-gray-100">{selectedPhoto.reporter.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPhoto.reporter.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flags */}
                  {selectedPhoto.flags.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Reported Issues</h4>
                      <div className="space-y-2">
                        {selectedPhoto.flags.map(flag => (
                          <div key={flag} className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {flag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Review */}
                  {selectedPhoto.reviewed_at && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Previous Review</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Reviewed:</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formatDate(selectedPhoto.reviewed_at)}
                          </span>
                        </div>
                        {selectedPhoto.reviewed_by && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Reviewer:</span>
                            <span className="text-gray-900 dark:text-gray-100">{selectedPhoto.reviewed_by}</span>
                          </div>
                        )}
                        {selectedPhoto.reviewer_notes && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                            <p className="text-gray-900 dark:text-gray-100 mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                              {selectedPhoto.reviewer_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Review Notes */}
                  <div className="space-y-3">
                    <Label htmlFor="review-notes" className="font-medium text-gray-900 dark:text-gray-100">
                      Review Notes (Optional)
                    </Label>
                    <Textarea
                      id="review-notes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about your decision..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Actions</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        onClick={() => handleApprove(selectedPhoto)}
                        disabled={approveMutation.isPending}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedPhoto)}
                        disabled={rejectMutation.isPending}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(selectedPhoto)}
                      disabled={deleteMutation.isPending}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Photo
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmAction.open}
        title={
          confirmAction.action === 'approve' ? 'Approve Photo' :
          confirmAction.action === 'reject' ? 'Reject Photo' :
          'Delete Photo'
        }
        message={
          confirmAction.action === 'approve' 
            ? 'Are you sure you want to approve this photo? It will be visible to users.'
            : confirmAction.action === 'reject'
            ? 'Are you sure you want to reject this photo? It will be hidden from users.'
            : 'Are you sure you want to delete this photo? This action cannot be undone.'
        }
        confirmLabel={
          confirmAction.action === 'approve' ? 'Approve' :
          confirmAction.action === 'reject' ? 'Reject' :
          'Delete'
        }
        confirmVariant={
          confirmAction.action === 'approve' ? 'default' : 'destructive'
        }
        onConfirm={confirmModerationAction}
        onCancel={() => setConfirmAction({ open: false, action: 'approve', item: null })}
        isLoading={approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending}
      />
    </div>
  );
};

export default PhotoModerationInterface;