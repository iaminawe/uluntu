import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCompany } from '../../hooks/useSupabaseQueries';
import { supabase } from '../../lib/supabase'; 
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { FormData } from './types';
import { initialFormData } from './data';
import BasicInfoSection from './BasicInfoSection';
import IndustrySection from './IndustrySection';
import SocialSection from './SocialSection';

export default function CompanyEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const companyId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newIndustry, setNewIndustry] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'social', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  
  const { 
    data: company,
    isLoading: companyLoading
  } = useCompany(companyId as number);
  
  // Populate form with company data when in edit mode
  useEffect(() => {
    if (isEditMode && company) {
      setFormData({
        name: company.name,
        description: company.description,
        logo: company.logo || '',
        coverImage: company.coverImage || '',
        industry: company.industry || [],
        size: company.size,
        founded: company.founded,
        location: company.location,
        website: company.website || '',
        social: {
          linkedin: company.social?.linkedin || '',
          twitter: company.social?.twitter || '',
          github: company.social?.github || ''
        },
        status: (company as any).status || initialFormData.status, // Assuming company might have status
        featured: (company as any).featured !== undefined ? (company as any).featured : initialFormData.featured // Assuming company might have featured
      });
    }
  }, [isEditMode, company]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoFile(file);
      setFormData(prev => ({ ...prev, logo: '' })); // Clear existing URL if new file selected
      if (errors.logo) setErrors(prev => ({ ...prev, logo: undefined }));
    } else {
      setLogoFile(null);
    }
  };

  const handleCoverImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setCoverImageFile(file);
      setFormData(prev => ({ ...prev, coverImage: '' })); // Clear existing URL
      if (errors.coverImage) setErrors(prev => ({ ...prev, coverImage: undefined }));
    } else {
      setCoverImageFile(null);
    }
  };
  
  const handleAddIndustry = () => {
    if (newIndustry.trim() && !formData.industry.includes(newIndustry.trim())) {
      setFormData(prev => ({
        ...prev,
        industry: [...prev.industry, newIndustry.trim()]
      }));
      setNewIndustry('');
      
      // Clear industry error if it exists
      if (errors.industry) {
        setErrors(prev => ({ ...prev, industry: undefined }));
      }
    }
  };
  
  const handleRemoveIndustry = (industryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      industry: prev.industry.filter(industry => industry !== industryToRemove)
    }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'social', string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.logo.trim() && !logoFile) { // Check for existing URL or new file
      newErrors.logo = 'Logo is required (either URL or new upload)';
    }
    // Note: Cover image is optional, so no validation error if not provided
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.industry.length) {
      newErrors.industry = 'At least one industry tag is required';
    }
    
    if (!formData.size) {
      newErrors.size = 'Company size is required';
    }
    
    if (!formData.founded.trim()) {
      newErrors.founded = 'Founded year is required';
    } else if (!/^\d{4}$/.test(formData.founded)) {
      newErrors.founded = 'Please enter a valid year (e.g., 2023)';
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
    let currentFormData = { ...formData }; // Renamed to avoid confusion, will be reassigned

    try {
      // 1. Upload Logo if a new file is selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo_${companyId || 'new'}_${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('company_logos') // Ensure this bucket exists and is public
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Logo upload failed: ${uploadError.message}`);
        }
        const { data: urlData } = supabase.storage.from('company_logos').getPublicUrl(filePath);
        currentFormData = { ...currentFormData, logo: urlData.publicUrl };
      }

      // 2. Upload Cover Image if a new file is selected
      if (coverImageFile) {
        const fileExt = coverImageFile.name.split('.').pop();
        const fileName = `cover_${companyId || 'new'}_${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('company-cover-image') // Ensure this bucket exists and is public
          .upload(filePath, coverImageFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Cover image upload failed: ${uploadError.message}`);
        }
        const { data: urlData } = supabase.storage.from('company-cover-image').getPublicUrl(filePath);
        currentFormData = { ...currentFormData, coverImage: urlData.publicUrl };
      }

      // 3. Prepare data for Supabase submission
      const dataForSupabase = {
        name: currentFormData.name,
        description: currentFormData.description,
        logo: currentFormData.logo || null, // Ensure null if empty
        cover_image_url: currentFormData.coverImage || null, // Map and ensure null if empty
        industry: currentFormData.industry,
        size: currentFormData.size,
        founded: currentFormData.founded,
        location: currentFormData.location,
        website: currentFormData.website || null, // Ensure null if empty
        status: currentFormData.status,
        featured: currentFormData.featured
      };

      console.log('Submitting to Supabase:', dataForSupabase);

      // 4. Perform Supabase database operation
      let dbOperationError = null;
      if (isEditMode && companyId) {
        const { error } = await supabase
          .from('companies')
          .update(dataForSupabase)
          .eq('id', companyId)
          .select(); // .select() can be useful for getting back the updated row or for RLS
        dbOperationError = error;
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([dataForSupabase]) // insert expects an array of objects
          .select();
        dbOperationError = error;
      }

      if (dbOperationError) {
        throw new Error(`Database operation failed: ${dbOperationError.message}`);
      }
      
      setSubmitSuccess(true);
      setLogoFile(null); // Clear file states on success
      setCoverImageFile(null);
      
      setTimeout(() => {
        navigate(isEditMode && companyId ? `/companies/${companyId}` : '/companies');
      }, 1000);
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      let errorMessage = 'Submission failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    setErrors(prev => ({ ...prev, form: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Company' : 'Add Company'}</title>
        <meta name="description" content={isEditMode ? 'Edit company information' : 'Add a new company to the directory'} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <Link
            to="/companies"
            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Companies
          </Link>
          
          <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Company' : 'Add Company'}
          </h1>
          
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isEditMode 
              ? 'Update company information in the directory'
              : 'Add a new company to the community directory'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {companyLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading company information...</p>
            </div>
          ) : submitSuccess ? (
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
                {isEditMode ? 'Company Updated Successfully!' : 'Company Added Successfully!'}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                You will be redirected to the companies page shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <BasicInfoSection 
                  formData={formData} 
                  errors={errors} 
                  onChange={handleChange} 
                  isSubmitting={isSubmitting} 
                  logoFile={logoFile}
                  coverImageFile={coverImageFile}
                  onLogoFileChange={handleLogoFileChange}
                  onCoverImageFileChange={handleCoverImageFileChange}
                />
              
              <hr className="border-t border-slate-200 dark:border-slate-700" />
              
              <IndustrySection 
                industries={formData.industry}
                newIndustry={newIndustry}
                setNewIndustry={setNewIndustry}
                onAdd={handleAddIndustry}
                onRemove={handleRemoveIndustry}
                isSubmitting={isSubmitting}
                error={errors.industry}
              />
              
              <hr className="border-t border-slate-200 dark:border-slate-700" />
              
              <SocialSection 
                social={formData.social}
                onChange={handleChange}
                errors={errors}
                isSubmitting={isSubmitting}
              />
              
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => navigate(isEditMode ? `/companies/${id}` : '/companies')}
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
                      className="px-6 py-2 border border-red-300 text-red-600 rounded-lg 
                                hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-5 w-5" />
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
                    {isSubmitting ? 'Saving...' : 'Save Company'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
