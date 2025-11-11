import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentStatus } from '../../data/mock/types';
import { resourcesApi, ResourceInput } from '@/features/resources/api/resourcesApi';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { generateSlug } from '@/utils/slugUtils';
import { supabase } from '@/lib/supabase';
import FormHeader from './FormHeader';
import ResourceDetails from './ResourceDetails';
import ResourceTypeSelect from './ResourceTypeSelect';
import UrlInput from './UrlInput';
import TagsInput from './TagsInput';
import GroupSelect from './GroupSelect';
import StatusOptions from './StatusOptions';
import FormActions from './FormActions';
import DeleteConfirm from './DeleteConfirm';
import LoadingState from './LoadingState';
import { FormData, ResourceType } from './types';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';

// This would normally come from a hook like useResource
const SAMPLE_RESOURCE = {
  id: '1', // Use string ID for consistency across the application
  title: 'Introduction to AI Ethics',
  description: 'A comprehensive guide to ethical considerations in AI development.',
  type: 'document' as ResourceType,
  url: 'https://example.com/ai-ethics-guide',
  tags: ['AI', 'Ethics', 'Technology', 'Guidelines'],
  group: {
    id: '1', // Use string ID for consistency across the application
    name: 'AI Enthusiasts Kootenay'
  },
  status: 'published' as ContentStatus,
  featured: true // Example resource is featured
};

export default function ResourceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined && id !== 'create';
  const { user } = useAuth();
  const { data: member } = useMemberByUserId(user?.id);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    status: 'draft' as ContentStatus,
    featured: false, // Default not featured
    type: 'document' as ResourceType,
    url: '',
    tags: [] as string[],
    groupId: '',
    newTag: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  // Topic management
  const { data: entityTopics } = useEntityTopics('resource', id || '');
  const setEntityTopicsMutation = useSetEntityTopics();
  
  useEffect(() => {
    if (isEditing && id) {
      loadResource();
    }
  }, [isEditing, id]);
  
  // Populate topics when entity topics are loaded
  useEffect(() => {
    if (entityTopics) {
      setSelectedTopicIds(entityTopics.map(topic => topic.id));
    }
  }, [entityTopics]);

  const loadResource = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const resource = await resourcesApi.getById(id);
      if (resource) {
        setFormData({
          title: resource.title,
          slug: resource.slug || generateSlug(resource.title),
          description: resource.description,
          type: resource.type as ResourceType,
          url: resource.url,
          tags: resource.tags || [],
          groupId: resource.groupId || '',
          newTag: '',
          status: resource.status || 'draft',
          featured: resource.featured || false
        });
      }
    } catch (error) {
      console.error('Error loading resource:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) {
      console.error('Member not found');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const resourceData: ResourceInput = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        type: formData.type,
        url: formData.url,
        status: formData.status,
        featured: formData.featured,
        contributorId: member.id,
        groupId: formData.groupId || null,
        tags: formData.tags
      };

      let result;
      if (isEditing && id) {
        result = await resourcesApi.update(id, resourceData);
      } else {
        result = await resourcesApi.create(resourceData);
      }

      if (result) {
        // Save topics after successful resource save
        if (selectedTopicIds.length > 0) {
          await setEntityTopicsMutation.mutateAsync({
            entityType: 'resource',
            entityId: result.id,
            topicIds: selectedTopicIds
          });
        }
        
        setSubmitSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/resources');
        }, 1500);
      } else {
        throw new Error('Failed to save resource');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await resourcesApi.delete(id);
      if (success) {
        navigate('/resources');
      } else {
        console.error('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Resource' : 'Add New Resource'} - Kootenay Tech Community</title>
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="w-4/5 max-w-[80%] mx-auto bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center">
            <Link 
              to="/resources" 
              className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
              {isEditing ? 'Edit Resource' : 'Add New Resource'}
            </h1>
          </div>
          
          <div className="p-6">
            {submitSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Resource {isEditing ? 'updated' : 'created'} successfully! Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <ResourceDetails 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                
                <ResourceTypeSelect 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                
                <UrlInput 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                
                <TagsInput 
                  formData={formData} 
                  handleChange={handleChange}
                  handleAddTag={handleAddTag}
                  handleRemoveTag={handleRemoveTag}
                />
                
                <GroupSelect 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                
                <StatusOptions 
                  formData={formData} 
                  handleChange={handleChange}
                  setFormData={setFormData}
                />
                
                {/* Topics Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topics
                  </label>
                  <TopicSelector
                    selectedTopics={selectedTopicIds}
                    onTopicsChange={setSelectedTopicIds}
                    placeholder="Search and select topics for this resource..."
                    maxTopics={5}
                    className="w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add topics to help categorize this resource and make it discoverable on topic pages.
                  </p>
                </div>
                
                <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => navigate(isEditing ? `/resources/${id}` : '/resources')}
                    className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                              text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 
                              transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <div className="flex gap-2">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2 border border-red-300 text-red-600 rounded-lg 
                                  hover:bg-red-50 transition-colors flex items-center gap-2"
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
                      {isSubmitting ? 'Saving...' : 'Save Resource'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <DeleteConfirm
        show={showDeleteConfirm}
        setShow={setShowDeleteConfirm}
        handleDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
