import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarketplaceListingByIdRedux, useMarketplaceListingsRedux } from '../../hooks/useMarketplaceRedux';
import BasicInfoSection from './BasicInfoSection';
import ImagesGallerySection from './ImagesGallerySection';
import TagsSection from './TagsSection';
import DeleteConfirmModal from './DeleteConfirmModal';
import FormHeader from './FormHeader';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
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
  
  // Redux hooks for marketplace listings
  const { 
    listing, 
    isLoading: fetchLoading, 
    isError: fetchError,
    fetchListing, 
    updateListing,
    deleteListing 
  } = useMarketplaceListingByIdRedux(id || '');
  
  const { 
    createListing 
  } = useMarketplaceListingsRedux();
  
  // State for delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch listing data if editing
  useEffect(() => {
    if (isEditing && id) {
      fetchListing();
    }
  }, [isEditing, id, fetchListing]);
  
  // Update form data when listing is loaded
  useEffect(() => {
    if (listing && isEditing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: typeof listing.price === 'number' ? String(listing.price) : '0',
        condition: listing.condition || 'new',
        location: listing.location || '',
        type: listing.type || 'product',
        status: listing.status || 'draft',
        featured: listing.featured || false,
        tags: listing.tags || [],
        newTag: ''
      });
    }
  }, [listing, isEditing]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert form data to API input format
      const listingData = {
        title: formData.title,
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
      
      if (isEditing && id) {
        // Update existing listing
        await updateListing(listingData);
      } else {
        // Create new listing
        await createListing(listingData);
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
      await deleteListing();
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
