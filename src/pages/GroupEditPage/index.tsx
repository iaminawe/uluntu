import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGroup } from '@/hooks/useGroupQueries';
import { groupsApi, GroupInput } from '@/features/groups/api/groupsApi';
import { ArrowLeft, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import FormHeader from './FormHeader';
import GroupInfo from './GroupInfo';
import VisibilitySelect from './VisibilitySelect';
import ImageUpload from './ImageUpload';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import { FormData } from './types';
import { generateSlug } from '@/features/companies/utils/slugUtils';
import { supabase, uploadGroupImage } from '@/lib/supabase';
import { ContentStatus } from '../../types/common';

const initialFormData: FormData = {
  name: '',
  slug: '',
  description: '',
  longDescription: '',
  heroImage: '',
  coverImage: '',
  visibility: 'open',
  interests: [],
  status: 'draft' as ContentStatus,
  featured: false
};

export default function GroupEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const groupId = id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Image upload state
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  
  const { 
    data: group, 
    isLoading: groupLoading
  } = useGroup(groupId);
  
  // Populate form with group data when in edit mode
  useEffect(() => {
    if (isEditMode && group) {
      setFormData({
        name: group.name,
        slug: (group as any).slug || generateSlug(group.name),
        description: group.description || '',
        longDescription: group.longDescription || '',
        heroImage: group.heroImage || '',
        coverImage: group.coverImage || '',
        visibility: (['open', 'closed', 'secret'].includes(group.visibility as string)
          ? (group.visibility as 'open' | 'closed' | 'secret')
          : 'open'),
        interests: [],
        status: (group.status as ContentStatus) || 'draft',
        featured: group.featured || false
      });
    }
  }, [isEditMode, group]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleHeroImageChange = (file: File | null) => {
    setHeroImageFile(file);
    if (file) {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, heroImage: objectUrl }));
    } else {
      setFormData(prev => ({ ...prev, heroImage: '' }));
    }
  };

  const handleCoverImageChange = (file: File | null) => {
    setCoverImageFile(file);
    if (file) {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, coverImage: objectUrl }));
    } else {
      setFormData(prev => ({ ...prev, coverImage: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Short description is required';
    }
    
    if (!formData.heroImage.trim()) {
      newErrors.heroImage = 'Hero image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload images if new files are selected
      let finalHeroImageUrl = formData.heroImage;
      let finalCoverImageUrl = formData.coverImage;
      
      if (heroImageFile || coverImageFile) {
        setIsUploadingImages(true);
        
        const tempGroupId = id || `temp-${Date.now()}`;
        
        if (heroImageFile) {
          const { url, error } = await uploadGroupImage(heroImageFile, tempGroupId, 'hero');
          if (error) {
            setErrors(prev => ({ ...prev, heroImage: 'Failed to upload hero image. Please try again.' }));
            return;
          }
          finalHeroImageUrl = url || '';
        }
        
        if (coverImageFile) {
          const { url, error } = await uploadGroupImage(coverImageFile, tempGroupId, 'cover');
          if (error) {
            setErrors(prev => ({ ...prev, coverImage: 'Failed to upload cover image. Please try again.' }));
            return;
          }
          finalCoverImageUrl = url || '';
        }
        
        setIsUploadingImages(false);
      }
      
      // Prepare data for API
      const groupData: GroupInput = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        longDescription: formData.longDescription || null,
        heroImage: finalHeroImageUrl,
        coverImage: finalCoverImageUrl,
        visibility: formData.visibility,
        status: formData.status,
        featured: formData.featured
      };

      let result;
      if (isEditMode && id) {
        // Update existing group
        result = await groupsApi.update(id, groupData);
      } else {
        // Create new group
        result = await groupsApi.create(groupData);
      }

      if (result) {
        setSubmitSuccess(true);
        
        // Navigate back after success
        setTimeout(() => {
          navigate(isEditMode ? `/groups/${id}` : '/groups');
        }, 1500);
      } else {
        throw new Error('Failed to save group');
      }
    } catch (error) {
      console.error('Error submitting group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      navigate('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      setErrors(prev => ({ 
        ...prev, 
        name: error instanceof Error ? error.message : 'Failed to delete group' 
      }));
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (groupLoading && isEditMode) {
    return <LoadingState />;
  }
  
  return (
    <React.Fragment>
      <Helmet>
        <title>
          {isEditMode ? `Edit Group: ${group?.name || 'Loading...'}` : 'Create New Group'} - Kootenay Tech Community
        </title>
        <meta 
          name="description" 
          content={`${isEditMode ? 'Edit' : 'Create'} a group for the Kootenay Tech Community.`} 
        />
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="w-4/5 max-w-[80%] mx-auto bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center">
            <Link 
              to="/groups" 
              className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
              {isEditMode ? 'Edit Group' : 'Create New Group'}
            </h1>
          </div>
          
          {submitSuccess ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                {isEditMode ? 'Group Updated Successfully!' : 'Group Created Successfully!'}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                You will be redirected to the groups page shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                <GroupInfo 
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
                
                <VisibilitySelect 
                  formData={formData}
                  handleChange={handleChange}
                />
                
                <ImageUpload 
                  formData={formData}
                  handleChange={handleChange}
                  onHeroImageChange={handleHeroImageChange}
                  onCoverImageChange={handleCoverImageChange}
                  errors={errors}
                  isSubmitting={isSubmitting || isUploadingImages}
                />
                
                <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => navigate(isEditMode ? `/groups/${id}` : '/groups')}
                    className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                              text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 
                              transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <div className="flex gap-2">
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-6 py-2 border border-red-300 text-red-600 rounded-lg 
                                  hover:bg-red-50 transition-colors flex items-center gap-2
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-5 w-5" />
                        Delete
                      </button>
                    )}
                    
                    {formData.status === 'published' ? (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: 'draft' as ContentStatus }))}
                        className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                                  text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 
                                  transition-colors flex items-center gap-2"
                      >
                        <EyeOff className="h-5 w-5" />
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: 'published' as ContentStatus }))}
                        className="px-6 py-2 border border-green-600 text-green-600 rounded-lg 
                                  hover:bg-green-50 transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-5 w-5" />
                        Publish
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 bg-orange-500 text-white rounded-lg 
                                hover:bg-orange-600 transition-colors flex items-center gap-2
                                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <Save className="h-5 w-5" />
                      {isSubmitting ? 'Saving...' : 'Save Group'}
                    </button>
                  </div>
                </div>
              </form>
          )}
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Confirm Delete
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this group? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                          text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
