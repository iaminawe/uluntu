import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { Gallery, UpdateGalleryInput } from '@/features/gallery/types';
import { X, Save, Loader2, Globe, Lock, Users, EyeOff, Star } from 'lucide-react';
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
import { toast } from 'react-hot-toast';

interface GalleryEditModalProps {
  gallery: Gallery;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GalleryEditModal: React.FC<GalleryEditModalProps> = ({
  gallery,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    privacy_level: 'public' | 'members_only' | 'private';
    visibility: 'visible' | 'hidden';
    tags: string[];
    is_featured: boolean;
  }>({
    title: gallery.title || '',
    description: gallery.description || '',
    privacy_level: gallery.privacy_level || 'public',
    visibility: gallery.visibility || 'visible',
    tags: gallery.tags || [],
    is_featured: gallery.is_featured || false
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update gallery mutation
  const updateGalleryMutation = useMutation({
    mutationFn: async (data: UpdateGalleryInput) => {
      return galleryApi.updateGallery(gallery.id, data);
    },
    onSuccess: () => {
      toast.success('Gallery updated successfully!');
      onSuccess();
      setHasChanges(false);
    },
    onError: (error) => {
      console.error('Error updating gallery:', error);
      toast.error('Failed to update gallery. Please try again.');
    }
  });

  // Reset form data when gallery changes
  useEffect(() => {
    setFormData({
      title: gallery.title || '',
      description: gallery.description || '',
      privacy_level: gallery.privacy_level || 'public',
      visibility: gallery.visibility || 'visible',
      tags: gallery.tags || [],
      is_featured: gallery.is_featured || false
    });
    setHasChanges(false);
  }, [gallery]);

  // Check for changes
  useEffect(() => {
    const originalData = {
      title: gallery.title || '',
      description: gallery.description || '',
      privacy_level: gallery.privacy_level || 'public',
      visibility: gallery.visibility || 'visible',
      tags: gallery.tags || [],
      is_featured: gallery.is_featured || false
    };

    const hasDataChanged = (
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.privacy_level !== originalData.privacy_level ||
      formData.visibility !== originalData.visibility ||
      JSON.stringify(formData.tags.sort()) !== JSON.stringify(originalData.tags.sort()) ||
      formData.is_featured !== originalData.is_featured
    );

    setHasChanges(hasDataChanged);
  }, [formData, gallery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a gallery title');
      return;
    }

    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    const updateData: UpdateGalleryInput = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      privacy_level: formData.privacy_level,
      visibility: formData.visibility,
      tags: formData.tags
    };

    // Only include is_featured if it's different (admin-only field)
    if (formData.is_featured !== gallery.is_featured) {
      (updateData as any).is_featured = formData.is_featured;
    }

    updateGalleryMutation.mutate(updateData);
  };

  const handleClose = () => {
    if (hasChanges && !updateGalleryMutation.isPending) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      title: gallery.title || '',
      description: gallery.description || '',
      privacy_level: gallery.privacy_level || 'public',
      visibility: gallery.visibility || 'visible',
      tags: gallery.tags || [],
      is_featured: gallery.is_featured || false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Edit Gallery
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Update gallery information and settings
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleClose}
              disabled={updateGalleryMutation.isPending}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-140px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Basic Information
              </h3>
              
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gallery Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter gallery title..."
                  className="mt-1"
                  required
                  disabled={updateGalleryMutation.isPending}
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
                  placeholder="Enter gallery description..."
                  rows={3}
                  className="mt-1"
                  disabled={updateGalleryMutation.isPending}
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
                    placeholder="Add tags to help categorize this gallery..."
                    disabled={updateGalleryMutation.isPending}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Press Enter or Tab to add tags
                </p>
              </div>
            </div>

            {/* Privacy & Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Privacy & Settings
              </h3>
              
              {/* Privacy Level */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Privacy Level
                </Label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="privacy_level"
                      value="public"
                      checked={formData.privacy_level === 'public'}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        privacy_level: e.target.value as 'public' 
                      })}
                      className="sr-only"
                      disabled={updateGalleryMutation.isPending}
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      formData.privacy_level === 'public'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}>
                      <Globe className={`w-6 h-6 mx-auto mb-2 ${
                        formData.privacy_level === 'public' ? 'text-green-500' : 'text-gray-400'
                      }`} />
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Public
                      </div>
                      <div className="text-xs text-gray-500">
                        Everyone can view
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative">
                    <input
                      type="radio"
                      name="privacy_level"
                      value="members_only"
                      checked={formData.privacy_level === 'members_only'}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        privacy_level: e.target.value as 'members_only' 
                      })}
                      className="sr-only"
                      disabled={updateGalleryMutation.isPending}
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      formData.privacy_level === 'members_only'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}>
                      <Users className={`w-6 h-6 mx-auto mb-2 ${
                        formData.privacy_level === 'members_only' ? 'text-yellow-500' : 'text-gray-400'
                      }`} />
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Members Only
                      </div>
                      <div className="text-xs text-gray-500">
                        Members can view
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative">
                    <input
                      type="radio"
                      name="privacy_level"
                      value="private"
                      checked={formData.privacy_level === 'private'}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        privacy_level: e.target.value as 'private' 
                      })}
                      className="sr-only"
                      disabled={updateGalleryMutation.isPending}
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      formData.privacy_level === 'private'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}>
                      <Lock className={`w-6 h-6 mx-auto mb-2 ${
                        formData.privacy_level === 'private' ? 'text-red-500' : 'text-gray-400'
                      }`} />
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Private
                      </div>
                      <div className="text-xs text-gray-500">
                        Only you can view
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visibility Status
                </Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value: 'visible' | 'hidden') => 
                    setFormData({ ...formData, visibility: value })
                  }
                  disabled={updateGalleryMutation.isPending}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        Visible - Gallery appears in listings
                      </div>
                    </SelectItem>
                    <SelectItem value="hidden">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-gray-500" />
                        Hidden - Gallery is accessible but not listed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Hidden galleries can still be accessed by direct link
                </p>
              </div>

              {/* Featured Gallery Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Featured Gallery
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Featured galleries appear prominently on the site
                  </p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  disabled={updateGalleryMutation.isPending}
                />
              </div>
            </div>

            {/* Gallery Stats (Read-only) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Gallery Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {gallery.photo_count || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Photos
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {gallery.view_count || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Views
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {new Date(gallery.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {gallery.updated_at ? new Date(gallery.updated_at).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Updated
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={updateGalleryMutation.isPending || !hasChanges}
              >
                Reset Changes
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateGalleryMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateGalleryMutation.isPending || !hasChanges || !formData.title.trim()}
                >
                  {updateGalleryMutation.isPending ? (
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
  );
};

export default GalleryEditModal;