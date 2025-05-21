import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import BasicInfoSection from './BasicInfoSection';
import ImagesGallerySection from './ImagesGallerySection';
import TagsSection from './TagsSection';
import DeleteConfirmModal from './DeleteConfirmModal';
import FormHeader from './FormHeader';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import { FormData } from './types';

export default function MarketplaceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '0',
    condition: 'new',
    location: '',
    type: 'product', // Using valid ListingType
    status: 'draft',
    featured: false,
    tags: [],
    newTag: ''
  });
  
  // State for delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError] = useState(false);
  
  // Mock data loading for editing
  useState(() => {
    if (isEditing) {
      // Simulate API call
      setTimeout(() => {
        setFormData({
          title: 'Sample Marketplace Item',
          description: 'This is a sample marketplace item description.',
          price: '99.99',
          condition: 'good', // Using valid ListingCondition
          location: 'San Francisco, CA',
          type: 'product', // Using valid ListingType
          status: 'published',
          featured: true,
          tags: ['electronics', 'gadget', 'used'],
          newTag: ''
        });
        setIsLoading(false);
      }, 1000);
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/marketplace');
    }, 1500);
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
  const handleDelete = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/marketplace');
    }, 1500);
  };
  
  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="mb-4">Failed to load marketplace item data.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Marketplace Listing' : 'Create New Listing'} | Nelson Tech</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            {/* Header */}
            <FormHeader isEditing={isEditing} />
            
            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Basic Info Section */}
                <BasicInfoSection
                  formData={formData}
                  handleChange={handleBasicInfoChange}
                  getTypeIcon={(type) => <span>{type}</span>}
                  isSubmitting={isSubmitting}
                />
                
                {/* Tags Section */}
                <TagsSection
                  tags={formData.tags}
                  handleTagsChange={handleTagsChange}
                  isSubmitting={isSubmitting}
                />
                
                {/* Images Gallery Section */}
                <ImagesGallerySection
                  images={[]}
                  handleImageChange={handleImageChange}
                  handleRemoveImage={(index) => console.log('Remove image at index:', index)}
                  isSubmitting={isSubmitting}
                />
                
                {/* Form Actions */}
                <FormActions
                  isEditing={isEditing}
                  isSubmitting={isSubmitting}
                  formData={formData}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                />
              </div>
            </form>
          </div>
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
