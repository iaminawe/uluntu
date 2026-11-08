import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { generateSlug } from '@/utils/slugUtils';
import { useMarketplaceHybrid } from '@/features/marketplace/hooks/useMarketplaceHybrid';
import BasicInfoSection from './BasicInfoSection';
import ImagesGallerySection from './ImagesGallerySection';
import TagsSection from './TagsSection';
import DeleteConfirmModal from './DeleteConfirmModal';
import FormHeader from './FormHeader';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { FormData, ListingCondition, ListingType } from './types';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';
import { useEnabledFeatures } from '@/hooks/useSettings';

export default function MarketplaceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Check if marketplace feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const marketplaceEnabled = isFeatureEnabled('marketplace');

  // Redirect if marketplace is disabled
  if (!featuresLoading && !marketplaceEnabled) {
    return <Navigate to="/" replace />;
  }

  // Show loading while checking features
  if (featuresLoading) {
    return <LoadingState />;
  }
  
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    price: '0',
    condition: 'new',
    location: '',
    type: 'product', // Using valid ListingType
    status: 'draft',
    featured: false,
    tags: [],
    newTag: '',
    contactEmail: '',
    contactPhone: '',
    contactMethod: '',
    showContactInfo: false
  });
  
  // Use hybrid hook for marketplace data and actions
  const { 
    getListing, 
    createListing, 
    updateListing, 
    deleteListing 
  } = useMarketplaceHybrid();
  
  // Get listing data if editing
  const { data: listing, isLoading: fetchLoading, error: fetchError } = getListing(id || '');
  
  // Topic management
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const { data: entityTopics } = useEntityTopics('marketplace', id || '');
  const setEntityTopicsMutation = useSetEntityTopics();
  
  // State for delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form data when listing is loaded
  useEffect(() => {
    if (listing && isEditing) {
      setFormData({
        title: listing.title || '',
        slug: listing.slug || generateSlug(listing.title || ''),
        description: listing.description || '',
        price: typeof listing.price === 'number' ? String(listing.price) : '0',
        condition: (listing.condition || 'new') as ListingCondition,
        location: listing.location || '',
        type: (listing.type || 'product') as ListingType,
        status: listing.status || 'draft',
        featured: listing.featured || false,
        tags: listing.tags || [],
        newTag: '',
        contactEmail: '',
        contactPhone: '',
        contactMethod: '',
        showContactInfo: false
      });
    }
  }, [listing, isEditing]);
  
  // Effect to populate topics
  useEffect(() => {
    if (entityTopics) {
      setSelectedTopicIds(entityTopics.map(topic => topic.id));
    }
  }, [entityTopics]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert form data to API input format
      const listingData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        price: parseFloat(formData.price),
        condition: formData.condition,
        location: formData.location,
        type: formData.type,
        status: formData.status,
        featured: formData.featured,
        tags: formData.tags,
        // For a new listing, we'd need to set the seller ID
        // In a real app, this would come from the authenticated user
        sellerId: isEditing ? '' : '1' 
      };
      
      let result;
      if (isEditing && id) {
        // Update existing listing
        result = await updateListing.mutateAsync({ id, data: listingData as any });
      } else {
        // Create new listing
        result = await createListing.mutateAsync(listingData as any);
      }
      
      // Save topics after successful entity save
      if (result && selectedTopicIds.length > 0) {
        try {
          await setEntityTopicsMutation.mutateAsync({
            entityType: 'marketplace',
            entityId: result.id || id,
            topicIds: selectedTopicIds
          });
        } catch (topicError) {
          console.error('Error saving topics:', topicError);
        }
      }
      
      // Navigate back to marketplace on success
      navigate('/marketplace');
    } catch (error) {
      console.error('Error saving marketplace listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle basic info changes
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle tags changes
  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };
  
  // Handle image changes
  const handleImageChange = (file: File | null) => {
    // For now, we'll just handle the type correctly
    // In a real implementation, we would process the file
    console.log('File received:', file);
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteListing.mutateAsync(id);
      navigate('/marketplace');
    } catch (error) {
      console.error('Error deleting marketplace listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (fetchLoading) {
    return <LoadingState />;
  }
  
  // Error state
  if (fetchError && isEditing) {
    return <ErrorState message="Failed to load marketplace listing" />;
  }
  
  // Error state handling can be added here if actual error fetching logic is implemented
  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Marketplace Listing' : 'Create New Listing'} | Uluntu</title>
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="w-4/5 max-w-[80%] mx-auto bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center">
            <Link 
              to="/marketplace" 
              className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
              {isEditing ? 'Edit Listing' : 'Create New Listing'}
            </h1>
          </div>
            
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Basic Info Section */}
              <BasicInfoSection
                formData={formData}
                handleChange={handleBasicInfoChange}
                getTypeIcon={(type) => <span>{type}</span>}
                isSubmitting={isSubmitting}
              />
              
              <hr className="border-t border-slate-200 dark:border-slate-700" />
              
              {/* Tags Section */}
              <TagsSection
                tags={formData.tags}
                handleTagsChange={handleTagsChange}
                isSubmitting={isSubmitting}
              />
              
              <hr className="border-t border-slate-200 dark:border-slate-700" />
              
              {/* Topics Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topics
                </label>
                <TopicSelector
                  selectedTopics={selectedTopicIds}
                  onTopicsChange={setSelectedTopicIds}
                  placeholder="Search and select topics for this listing..."
                  maxTopics={5}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add topics to help categorize this listing and make it discoverable on topic pages.
                </p>
              </div>
              
              <hr className="border-t border-slate-200 dark:border-slate-700" />
              
              {/* Images Gallery Section */}
              <ImagesGallerySection
                images={[]}
                handleImageChange={handleImageChange}
                handleRemoveImage={(index) => console.log('Remove image at index:', index)}
                isSubmitting={isSubmitting}
              />
              
              {/* Form Actions */}
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => navigate(isEditing ? `/marketplace/${id}` : '/marketplace')}
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
                      onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
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
                      onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
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
                    {isSubmitting ? 'Saving...' : 'Save Listing'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
