import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useNewsArticle } from '@/hooks/useNewsQueries';
import { newsApi } from '@/features/news/api/newsApi';
import { useAuth } from '@/features/auth/hooks/useAuth';
import FormHeader from './FormHeader';
import TagsInput from './TagsInput';
import FormInputs from './FormInputs';
import FormActions from './FormActions';
import DeleteConfirmModal from './DeleteConfirmModal';
import LoadingState from './LoadingState';
import { FormData } from './types';
import { ContentStatus } from '../../types/common';
import { NewsArticle } from '@/types';
import { generateSlug } from '@/utils/slugUtils';
import { uploadNewsImage } from '../../lib/supabase';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';

const initialFormData: FormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  tags: [],
  authorId: 1, // Default author ID
  status: 'draft' as ContentStatus, // Default status
  featured: false // Default not featured
};

export default function NewsEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  // Use string ID for consistency - hooks have been updated to handle string IDs
  const articleId = id || undefined;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  const { 
    data: article, 
    isLoading: articleLoading
  } = useNewsArticle(articleId!);
  
  // Topic management
  const { data: entityTopics } = useEntityTopics('news', articleId || '');
  const setEntityTopicsMutation = useSetEntityTopics();
  
  // Populate form with article data when in edit mode
  useEffect(() => {
    if (isEditMode && article) {
      setFormData({
        title: article.title,
        slug: article.slug || generateSlug(article.title),
        excerpt: article.excerpt,
        content: article.content,
        image: article.image || '',
        tags: article.tags || [],
        authorId: typeof article.author.id === 'string' ? parseInt(article.author.id, 10) : (typeof article.author.id === 'number' ? article.author.id : 1),
        status: article.status || 'draft' as ContentStatus,
        featured: article.featured || false
      });
    }
  }, [isEditMode, article]);
  
  // Populate topics when entity topics are loaded
  useEffect(() => {
    if (entityTopics) {
      setSelectedTopicIds(entityTopics.map(topic => topic.id));
    }
  }, [entityTopics]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug when title changes and slug is empty
    if (name === 'title' && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        image: objectUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        image: ''
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Partial<FormData> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    let finalImageUrl = formData.image;
    
    try {
      // Upload image if a new file was selected
      if (imageFile) {
        setIsUploadingImage(true);
        const newsId = id || `temp-${Date.now()}`;
        const { url, error } = await uploadNewsImage(imageFile, newsId);
        
        if (error) {
          console.error('Error uploading image:', error);
          setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
          return;
        }
        
        finalImageUrl = url || '';
        setIsUploadingImage(false);
      }
      
      // Prepare data for API
      // ContentAIEditor returns markdown/HTML content which is compatible with existing format
      const newsArticleData: Partial<NewsArticle> = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content, // ContentAIEditor provides markdown/HTML content
        image: finalImageUrl,
        tags: formData.tags,
        status: formData.status,
        featured: formData.featured,
      };
      
      // Add author for new articles
      if (!isEditMode && user?.id) {
        newsArticleData.author = {
          id: user.id,
          name: user.name || 'Unknown',
          image: user.image || ''
        };
      }
      
      // Add date for new articles
      if (!isEditMode) {
        newsArticleData.date = new Date().toISOString();
      }

      let result;
      if (isEditMode && id) {
        // Update existing article
        result = await newsApi.update(id, newsArticleData);
      } else {
        // Create new article
        result = await newsApi.create(newsArticleData);
      }

      if (result) {
        // Save topics after successful article save
        if (selectedTopicIds.length > 0) {
          await setEntityTopicsMutation.mutateAsync({
            entityType: 'news',
            entityId: result.id,
            topicIds: selectedTopicIds
          });
        }
        
        setSubmitSuccess(true);
        
        // Navigate after successful submission
        setTimeout(() => {
          navigate(isEditMode ? `/news/${result.id}` : '/news');
        }, 1500);
      } else {
        throw new Error('Failed to save article');
      }
    } catch (error) {
      console.error('Error submitting news article:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to save article. Please try again.' }));
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await newsApi.delete(id);
      if (success) {
        navigate('/news');
      } else {
        console.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (articleLoading && isEditMode) {
    return <LoadingState />;
  }
  
  return (
    <>
      <Helmet>
        <title>
          {isEditMode 
            ? `Edit Article: ${article?.title || 'Loading...'}`
            : 'Create New Article'
          } - Uluntu
        </title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="w-4/5 max-w-[80%] mx-auto">
          <FormHeader 
            isEditMode={isEditMode} 
            title={article?.title || ''} 
          />
          
          {submitSuccess ? (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {isEditMode 
                      ? 'Article updated successfully!' 
                      : 'Article created successfully!'
                    } Redirecting...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
              <FormInputs 
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                onImageChange={handleImageChange}
                errors={errors}
              />
              
              <TagsInput 
                tags={formData.tags}
                newTag={newTag}
                setNewTag={setNewTag}
                handleAddTag={handleAddTag}
                handleRemoveTag={handleRemoveTag}
                errors={errors}
              />
              
              {/* Topics Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topics
                </label>
                <TopicSelector
                  selectedTopics={selectedTopicIds}
                  onTopicsChange={setSelectedTopicIds}
                  placeholder="Search and select topics for this article..."
                  maxTopics={5}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add topics to help categorize this article and make it discoverable on topic pages.
                </p>
              </div>
              
              <FormActions 
                isEditMode={isEditMode}
                formData={formData}
                isSubmitting={isSubmitting}
                navigate={navigate}
                id={id}
                setShowDeleteConfirm={setShowDeleteConfirm}
                setFormData={setFormData}
              />
            </form>
          )}
        </div>
      </div>
      
      <DeleteConfirmModal
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleDelete={handleDelete}
      />
    </>
  );
}
