import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Briefcase, Monitor } from 'lucide-react';
import BasicInfoSection from './BasicInfoSection';
import ImagesGallerySection from './ImagesGallerySection';
import TagsSection from './TagsSection';
import DeleteConfirmModal from './DeleteConfirmModal';
import { FormData, ListingType } from './types';
import { SAMPLE_LISTING, initialFormData } from './data';

export default function MarketplaceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined && id !== 'create';
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  useEffect(() => {
    if (isEditing) {
      // This would normally fetch the listing data from an API
      setFormData({
        title: SAMPLE_LISTING.title,
        description: SAMPLE_LISTING.description,
        type: SAMPLE_LISTING.type,
        price: SAMPLE_LISTING.price.toString(),
        condition: SAMPLE_LISTING.condition,
        location: SAMPLE_LISTING.location,
        tags: SAMPLE_LISTING.tags,
        newTag: '',
        status: SAMPLE_LISTING.status,
        featured: SAMPLE_LISTING.featured || false
      });
      
      // Mock images
      setImages([
        'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg',
        'https://images.pexels.com/photos/5474296/pexels-photo-5474296.jpeg'
      ]);
    }
  }, [isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, newTag: e.target.value }));
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
  
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This would normally send the data to an API
      console.log('Submitting listing data:', {
        ...formData,
        price: parseFloat(formData.price),
        images
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/marketplace');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      // This would normally send a delete request to an API
      console.log('Deleting listing with ID:', id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect after successful deletion
      navigate('/marketplace');
    } catch (error) {
      console.error('Error deleting listing:', error);
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getTypeIcon = (type: ListingType) => {
    switch (type) {
      case 'product':
        return <Package className="h-5 w-5 text-slate-400" />;
      case 'service':
        return <Briefcase className="h-5 w-5 text-slate-400" />;
      case 'equipment':
        return <Monitor className="h-5 w-5 text-slate-400" />;
      default:
        return <Package className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Listing' : 'Create New Listing'}</title>
        <meta name="description" content={isEditing ? 'Edit your marketplace listing' : 'Create a new listing in the marketplace'} />
      </Helmet>
      
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Link 
            to="/marketplace" 
            className="flex items-center text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {isEditing ? 'Edit Listing' : 'Create New Listing'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isEditing 
              ? 'Update your listing details below' 
              : 'Fill out the form below to create a new listing on the marketplace'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          {submitSuccess ? (
            <div className="p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-medium text-slate-900 dark:text-white">
                {isEditing ? 'Listing Updated Successfully!' : 'Listing Created Successfully!'}
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Redirecting you to the marketplace...
              </p>
            </div>
          ) : (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <BasicInfoSection 
                  formData={formData}
                  handleChange={handleChange}
                  getTypeIcon={getTypeIcon}
                  isSubmitting={isSubmitting}
                />
                
                <hr className="border-t border-slate-200 dark:border-slate-700" />
                
                <ImagesGallerySection 
                  images={images}
                  handleRemoveImage={handleRemoveImage}
                  isSubmitting={isSubmitting}
                />
                
                <hr className="border-t border-slate-200 dark:border-slate-700" />
                
                <TagsSection 
                  tags={formData.tags}
                  newTag={formData.newTag}
                  handleTagChange={handleTagChange}
                  handleAddTag={handleAddTag}
                  handleRemoveTag={handleRemoveTag}
                  isSubmitting={isSubmitting}
                />
                
                <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex space-x-4">
                    <Link
                      to="/marketplace"
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 
                                text-slate-700 dark:text-slate-300 rounded-md 
                                hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </Link>
                    
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md 
                                  hover:bg-red-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-orange-500 text-white rounded-md 
                              hover:bg-orange-600 transition-colors flex items-center gap-2
                              ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {formData.status === 'draft' 
                          ? 'Save as Draft' 
                          : formData.status === 'published' 
                            ? 'Publish Listing' 
                            : 'Archive Listing'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
