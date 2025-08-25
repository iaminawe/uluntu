import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { CreateGalleryInput } from '@/features/gallery/types';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { X, Save, Loader2, User, Users, Building, Globe, Lock, EyeOff } from 'lucide-react';
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
import { toast } from 'react-hot-toast';

interface GalleryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GalleryCreationModal: React.FC<GalleryCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useSession();
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    privacy_level: 'public' | 'members_only' | 'private';
    visibility: 'visible' | 'hidden';
    tags: string[];
    owner_type: 'user' | 'group' | 'company';
    owner_id?: string;
  }>({
    title: '',
    description: '',
    privacy_level: 'public',
    visibility: 'visible',
    tags: [],
    owner_type: 'user',
    owner_id: user?.id
  });

  // Create gallery mutation
  const createGalleryMutation = useMutation({
    mutationFn: async (data: CreateGalleryInput) => {
      const galleryData = {
        ...data,
        user_id: user?.id,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        photo_count: 0,
        view_count: 0,
        is_featured: false,
        sort_order: 0
      };
      
      return galleryApi.createGallery(galleryData);
    },
    onSuccess: () => {
      toast.success('Gallery created successfully!');
      onSuccess();
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating gallery:', error);
      toast.error('Failed to create gallery. Please try again.');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      privacy_level: 'public',
      visibility: 'visible',
      tags: [],
      owner_type: 'user',
      owner_id: user?.id
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a gallery title');
      return;
    }

    createGalleryMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      privacy_level: formData.privacy_level,
      visibility: formData.visibility,
      tags: formData.tags,
      owner_type: formData.owner_type,
      owner_id: formData.owner_id
    });
  };

  const handleClose = () => {
    if (!createGalleryMutation.isPending) {
      resetForm();
      onClose();
    }
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
                Create New Gallery
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create a new photo gallery for organizing your images
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleClose}
              disabled={createGalleryMutation.isPending}
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
                  disabled={createGalleryMutation.isPending}
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
                  disabled={createGalleryMutation.isPending}
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
                    disabled={createGalleryMutation.isPending}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Press Enter or Tab to add tags
                </p>
              </div>
            </div>

            {/* Owner & Privacy */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Ownership & Privacy
              </h3>
              
              {/* Owner Type */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gallery Owner
                </Label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="owner_type"
                      value="user"
                      checked={formData.owner_type === 'user'}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        owner_type: e.target.value as 'user',
                        owner_id: user?.id 
                      })}
                      className="sr-only"
                      disabled={createGalleryMutation.isPending}
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      formData.owner_type === 'user'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}>
                      <User className={`w-6 h-6 mx-auto mb-2 ${
                        formData.owner_type === 'user' ? 'text-orange-500' : 'text-gray-400'
                      }`} />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Personal
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative opacity-50 cursor-not-allowed">
                    <input
                      type="radio"
                      name="owner_type"
                      value="group"
                      disabled
                      className="sr-only"
                    />
                    <div className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <div className="text-sm font-medium text-gray-500">
                        Group
                      </div>
                      <div className="text-xs text-gray-400">
                        Coming Soon
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative opacity-50 cursor-not-allowed">
                    <input
                      type="radio"
                      name="owner_type"
                      value="company"
                      disabled
                      className="sr-only"
                    />
                    <div className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-center">
                      <Building className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <div className="text-sm font-medium text-gray-500">
                        Company
                      </div>
                      <div className="text-xs text-gray-400">
                        Coming Soon
                      </div>
                    </div>
                  </label>
                </div>
              </div>

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
                      disabled={createGalleryMutation.isPending}
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
                      disabled={createGalleryMutation.isPending}
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
                      disabled={createGalleryMutation.isPending}
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
                  disabled={createGalleryMutation.isPending}
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
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createGalleryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGalleryMutation.isPending || !formData.title.trim()}
              >
                {createGalleryMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Gallery
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GalleryCreationModal;