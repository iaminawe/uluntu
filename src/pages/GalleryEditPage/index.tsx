import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Globe, Users, Lock, X } from 'lucide-react';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { PhotoUpload } from '@/features/gallery/components/PhotoUpload';
import { GallerySelector } from '@/features/gallery/components/GallerySelector';
import { uploadApi } from '@/features/gallery/api/uploadApi';
import { useUserGroups } from '@/shared/hooks/useUserContent';
import type { Gallery, CreateGalleryInput, UpdateGalleryInput } from '@/features/gallery/types';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';

const GalleryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isEditing = !!id;
  
  // Get user's groups for gallery selector
  const { groups: userGroups } = useUserGroups();
  
  // Mock user companies for now - you'd want to implement useUserCompanies hook
  const userCompanies: Array<{ id: string; name: string; role: string }> = [];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState<CreateGalleryInput>({
    title: '',
    description: '',
    privacy_level: 'public',
    visibility: 'visible',
    tags: [],
    owner_type: 'user',
    owner_id: undefined
  });
  const [galleryOwner, setGalleryOwner] = useState<{
    type: 'user' | 'group' | 'company';
    id?: string;
    name?: string;
  }>({ type: 'user' });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  // Topic management
  const { data: entityTopics } = useEntityTopics('gallery', id || '');
  const setEntityTopicsMutation = useSetEntityTopics();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
    }
  }, [user, navigate]);

  // Load existing gallery if editing
  useEffect(() => {
    if (isEditing && id) {
      loadGallery();
    }
  }, [id, isEditing]);

  const loadGallery = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const gallery = await galleryApi.getGallery(id);
      
      // Check if gallery was found
      if (!gallery) {
        navigate('/404');
        return;
      }
      
      // Check ownership
      if (gallery.owner_id !== user?.id) {
        navigate('/unauthorized');
        return;
      }
      
      setFormData({
        title: gallery.title,
        description: gallery.description || '',
        privacy_level: gallery.privacy_level,
        visibility: gallery.visibility === 'archived' ? 'hidden' : gallery.visibility as 'hidden' | 'visible',
        tags: gallery.tags || [],
        owner_type: gallery.owner_type || 'user',
        owner_id: gallery.owner_id
      });
      
      // Set gallery owner for selector
      if (gallery.owner_type === 'group' && gallery.group) {
        setGalleryOwner({
          type: 'group',
          id: gallery.group.id,
          name: gallery.group.name
        });
      } else if (gallery.owner_type === 'company' && gallery.company) {
        setGalleryOwner({
          type: 'company',
          id: gallery.company.id,
          name: gallery.company.name
        });
      } else {
        setGalleryOwner({ type: 'user' });
      }
    } catch (err) {
      console.error('Error loading gallery:', err);
      navigate('/my-galleries');
    } finally {
      setLoading(false);
    }
  };
  
  // Effect to populate topics
  useEffect(() => {
    if (entityTopics) {
      setSelectedTopicIds(entityTopics.map(topic => topic.id));
    }
  }, [entityTopics]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      // Update form data with current gallery owner selection
      const finalFormData = {
        ...formData,
        owner_type: galleryOwner.type,
        owner_id: galleryOwner.type === 'user' ? user?.id : galleryOwner.id
      };
      
      let result;
      if (isEditing && id) {
        result = await galleryApi.updateGallery(id, finalFormData as UpdateGalleryInput);
        
        // Save topics after successful entity save
        if (selectedTopicIds.length > 0) {
          try {
            await setEntityTopicsMutation.mutateAsync({
              entityType: 'gallery',
              entityId: id,
              topicIds: selectedTopicIds
            });
          } catch (topicError) {
            console.error('Error saving topics:', topicError);
          }
        }
        
        navigate(`/galleries/${id}`);
      } else {
        result = await galleryApi.createGallery(finalFormData);
        
        // Save topics after successful entity save
        if (result && selectedTopicIds.length > 0) {
          try {
            await setEntityTopicsMutation.mutateAsync({
              entityType: 'gallery',
              entityId: result.id,
              topicIds: selectedTopicIds
            });
          } catch (topicError) {
            console.error('Error saving topics:', topicError);
          }
        }
        
        // After creating, show upload modal or navigate
        if (result) {
          setShowUpload(true);
        }
      }
    } catch (err) {
      console.error('Error saving gallery:', err);
      setErrors({ submit: 'Failed to save gallery. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    const tags = formData.tags || [];
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setFormData({ ...formData, tags: [...tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  const handlePhotoUpload = async (files: File[]) => {
    if (!id) return;
    
    try {
      await uploadApi.uploadBatch(files, { galleryId: id });
      navigate(`/galleries/${id}`);
    } catch (err) {
      console.error('Error uploading photos:', err);
    }
  };
  
  const handleBatchUpload = (uploadedPhotos: any[]) => {
    console.log('Batch upload completed:', uploadedPhotos);
    navigate(`/galleries/${id}`);
  };

  if (loading) {
    return (
      <ContentContainer>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </ContentContainer>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="w-4/5 max-w-[80%] mx-auto bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center">
          <button
            onClick={() => navigate(isEditing ? `/galleries/${id}` : '/my-galleries')}
            className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
            {isEditing ? 'Edit Gallery' : 'Create New Gallery'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Gallery Owner Selector */}
          {!isEditing && (
            <GallerySelector
              ownerType={galleryOwner.type}
              ownerId={galleryOwner.id}
              onOwnerChange={(type, id) => setGalleryOwner({ type, id, name: '' })}
              userGroups={userGroups.map(g => ({ id: g.id, name: g.name }))}
              userCompanies={userCompanies.map(c => ({ id: c.id, name: c.name }))}
            />
          )}
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="My Amazing Photos"
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tell us about this gallery..."
              rows={4}
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {(formData.description || '').length}/500 characters
            </p>
          </div>

          {/* Privacy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Level
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={formData.privacy_level === 'public'}
                  onChange={(e) => setFormData({ ...formData, privacy_level: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Public</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Anyone can view this gallery
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="members_only"
                  checked={formData.privacy_level === 'members_only'}
                  onChange={(e) => setFormData({ ...formData, privacy_level: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Members Only</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Only logged-in members can view this gallery
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={formData.privacy_level === 'private'}
                  onChange={(e) => setFormData({ ...formData, privacy_level: e.target.value as any })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Private</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Only you can view this gallery
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Topics Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics
            </label>
            <TopicSelector
              selectedTopics={selectedTopicIds}
              onTopicsChange={setSelectedTopicIds}
              placeholder="Search and select topics for this gallery..."
              maxTopics={5}
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              Add topics to help categorize this gallery and make it discoverable on topic pages.
            </p>
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag..."
                maxLength={30}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            {(formData.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(formData.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Gallery'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/galleries/${id}` : '/my-galleries')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Photo Upload Modal */}
        {showUpload && !isEditing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Upload Photos</h2>
                  <button
                    onClick={() => navigate('/my-galleries')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Your gallery has been created! Now add some photos to it.
                </p>
                
                <PhotoUpload
                  galleryId={id}
                  onUpload={handlePhotoUpload}
                  onBatchUpload={handleBatchUpload}
                  maxFiles={20}
                  showBatchUpload={true}
                />
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => navigate('/my-galleries')}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryEditPage;