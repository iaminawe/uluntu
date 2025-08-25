import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { Photo, PhotoMetadata } from '@/features/gallery/types';
import { X, Save, Loader2, Eye, EyeOff, Image, Calendar, Camera, MapPin, Hash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagsInput } from '@/components/TagsInput';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

interface PhotoMetadataModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PhotoMetadataModal: React.FC<PhotoMetadataModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    alt_text: string;
    caption: string;
    tags: string[];
    visibility: 'visible' | 'hidden';
    sort_order: number;
  }>({
    title: photo.title || '',
    description: photo.description || '',
    alt_text: photo.alt_text || '',
    caption: photo.caption || '',
    tags: photo.tags || [],
    visibility: photo.visibility || 'visible',
    sort_order: photo.sort_order || 0
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update photo mutation
  const updatePhotoMutation = useMutation({
    mutationFn: async (data: Partial<Photo>) => {
      return galleryApi.updatePhoto(photo.id, data);
    },
    onSuccess: () => {
      toast.success('Photo updated successfully!');
      onSave();
      setHasChanges(false);
    },
    onError: (error) => {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo. Please try again.');
    }
  });

  // Reset form data when photo changes
  useEffect(() => {
    setFormData({
      title: photo.title || '',
      description: photo.description || '',
      alt_text: photo.alt_text || '',
      caption: photo.caption || '',
      tags: photo.tags || [],
      visibility: photo.visibility || 'visible',
      sort_order: photo.sort_order || 0
    });
    setHasChanges(false);
  }, [photo]);

  // Check for changes
  useEffect(() => {
    const originalData = {
      title: photo.title || '',
      description: photo.description || '',
      alt_text: photo.alt_text || '',
      caption: photo.caption || '',
      tags: photo.tags || [],
      visibility: photo.visibility || 'visible',
      sort_order: photo.sort_order || 0
    };

    const hasDataChanged = (
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.alt_text !== originalData.alt_text ||
      formData.caption !== originalData.caption ||
      JSON.stringify(formData.tags.sort()) !== JSON.stringify(originalData.tags.sort()) ||
      formData.visibility !== originalData.visibility ||
      formData.sort_order !== originalData.sort_order
    );

    setHasChanges(hasDataChanged);
  }, [formData, photo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    const updateData = {
      title: formData.title.trim() || null,
      description: formData.description.trim() || null,
      alt_text: formData.alt_text.trim() || null,
      caption: formData.caption.trim() || null,
      tags: formData.tags,
      visibility: formData.visibility,
      sort_order: formData.sort_order
    };

    updatePhotoMutation.mutate(updateData);
  };

  const handleClose = () => {
    if (hasChanges && !updatePhotoMutation.isPending) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      title: photo.title || '',
      description: photo.description || '',
      alt_text: photo.alt_text || '',
      caption: photo.caption || '',
      tags: photo.tags || [],
      visibility: photo.visibility || 'visible',
      sort_order: photo.sort_order || 0
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPhotoUrl = (size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'medium') => {
    switch (size) {
      case 'thumbnail':
        return photo.thumbnail_url || photo.small_url || photo.medium_url || photo.url;
      case 'small':
        return photo.small_url || photo.medium_url || photo.url;
      case 'large':
        return photo.large_url || photo.medium_url || photo.url;
      case 'original':
        return photo.original_url || photo.url;
      default:
        return photo.medium_url || photo.url;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Photo Preview */}
        <div className="w-1/2 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-full max-h-full p-4">
            <img
              src={getPhotoUrl('large')}
              alt={photo.title || photo.file_name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Form */}
        <div className="w-1/2 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Edit Photo
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {photo.file_name}
                </p>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleClose}
                disabled={updatePhotoMutation.isPending}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Basic Information
                </h3>
                
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter photo title..."
                    className="mt-1"
                    disabled={updatePhotoMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter photo description..."
                    rows={3}
                    className="mt-1"
                    disabled={updatePhotoMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="alt_text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alt Text
                  </Label>
                  <Input
                    id="alt_text"
                    type="text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    placeholder="Describe the image for accessibility..."
                    className="mt-1"
                    disabled={updatePhotoMutation.isPending}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Used by screen readers and SEO
                  </p>
                </div>

                <div>
                  <Label htmlFor="caption" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Caption
                  </Label>
                  <Input
                    id="caption"
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Enter photo caption..."
                    className="mt-1"
                    disabled={updatePhotoMutation.isPending}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </Label>
                  <div className="mt-1">
                    <TagsInput
                      tags={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                      placeholder="Add tags..."
                      disabled={updatePhotoMutation.isPending}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Press Enter or Tab to add tags
                  </p>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Settings
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Visibility
                    </Label>
                    <Select 
                      value={formData.visibility} 
                      onValueChange={(value: 'visible' | 'hidden') => 
                        setFormData({ ...formData, visibility: value })
                      }
                      disabled={updatePhotoMutation.isPending}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visible">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-green-500" />
                            Visible
                          </div>
                        </SelectItem>
                        <SelectItem value="hidden">
                          <div className="flex items-center gap-2">
                            <EyeOff className="h-4 w-4 text-gray-500" />
                            Hidden
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sort_order" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sort Order
                    </Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                      disabled={updatePhotoMutation.isPending}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Photo Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">File:</span>
                      <span className="text-gray-900 dark:text-gray-100">{photo.original_file_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="text-gray-900 dark:text-gray-100">{formatFileSize(photo.file_size)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                      <span className="text-gray-900 dark:text-gray-100">{photo.width} × {photo.height}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <Badge variant="outline">{photo.mime_type}</Badge>
                    </div>
                    
                    {photo.processing_status && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <Badge variant={
                          photo.processing_status === 'completed' ? 'default' :
                          photo.processing_status === 'failed' ? 'destructive' :
                          'secondary'
                        }>
                          {photo.processing_status}
                        </Badge>
                      </div>
                    )}

                    {photo.aspect_ratio && (
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Aspect Ratio:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {photo.aspect_ratio.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {photo.dominant_color && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: photo.dominant_color }}
                        />
                        <span className="text-gray-600 dark:text-gray-400">Color:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                          {photo.dominant_color}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* EXIF Metadata */}
              {photo.metadata && Object.keys(photo.metadata).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Camera Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {photo.metadata.camera && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Camera:</span>
                        <p className="text-gray-900 dark:text-gray-100">{photo.metadata.camera}</p>
                      </div>
                    )}
                    {photo.metadata.lens && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Lens:</span>
                        <p className="text-gray-900 dark:text-gray-100">{photo.metadata.lens}</p>
                      </div>
                    )}
                    {photo.metadata.iso && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">ISO:</span>
                        <p className="text-gray-900 dark:text-gray-100">{photo.metadata.iso}</p>
                      </div>
                    )}
                    {photo.metadata.aperture && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Aperture:</span>
                        <p className="text-gray-900 dark:text-gray-100">{photo.metadata.aperture}</p>
                      </div>
                    )}
                    {photo.metadata.shutterSpeed && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Shutter Speed:</span>
                        <p className="text-gray-900 dark:text-gray-100">{photo.metadata.shutterSpeed}</p>
                      </div>
                    )}
                    {photo.metadata.focalLength && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Focal Length:</span>
                        <p className="text-gray-900 dark:text-gray-100">{photo.metadata.focalLength}</p>
                      </div>
                    )}
                    {photo.metadata.takenAt && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Taken:</span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {new Date(photo.metadata.takenAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {photo.metadata.location && (
                      <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Location:</span>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100">
                          {photo.metadata.location.name || `${photo.metadata.location.latitude}, ${photo.metadata.location.longitude}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={updatePhotoMutation.isPending || !hasChanges}
                >
                  Reset Changes
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={updatePhotoMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatePhotoMutation.isPending || !hasChanges}
                  >
                    {updatePhotoMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {hasChanges && (
                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 text-center">
                  You have unsaved changes
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PhotoMetadataModal;