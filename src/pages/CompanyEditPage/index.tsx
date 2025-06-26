import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCompany } from '@/hooks/useCompanyQueries';
import { supabase } from '@/lib/supabase'; 
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { FormData } from './types';
import { initialFormData } from './data';
import BasicInfoSection from './BasicInfoSection';
import IndustrySection from './IndustrySection';
import SocialSection from './SocialSection';
import { convertFormDataToInsert, convertFormDataToUpdate } from './adapters';
// Import ContentStatus for proper typing
import { ContentStatus } from '../../types/common';

// Define an extended company type that includes the optional fields we need
interface ExtendedCompany {
  name: string;
  description: string;
  logo?: string | null;
  coverImage?: string | null;
  industry?: string[];
  size: string;
  founded: string;
  location: string;
  website?: string | null;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  status?: string;
  featured?: boolean;
}

// Helper function to validate ContentStatus values
const validateContentStatus = (status: string | null | undefined): ContentStatus | undefined => {
  const validStatuses: ContentStatus[] = ['draft', 'published', 'archived', 'pending'];
  return status && validStatuses.includes(status as ContentStatus)
    ? status as ContentStatus
    : undefined;
};

export default function CompanyEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  // Use string ID consistently instead of converting to number
  const companyId = id || undefined;
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
  } = useCompany(id);
  
  // Populate form with company data when in edit mode
  useEffect(() => {
    if (isEditMode && company) {
      // Create a properly typed object from the DB response
      const typedCompany: ExtendedCompany = {
        name: company.name,
        description: company.description,
        logo: company.logo || null,
        coverImage: company.coverImage || null,
        industry: company.industry || [],
        size: company.size,
        founded: company.founded,
        location: company.location,
        website: company.website || null,
        // Social is not directly on the company object from DB
        social: {
          linkedin: '',
          twitter: '',
          github: ''
        },
        // Validate status is a valid ContentStatus value
        status: validateContentStatus(company.status) || initialFormData.status,
        featured: company.featured !== null ? company.featured : initialFormData.featured
      };
      
      setFormData({
        name: typedCompany.name,
        description: typedCompany.description,
        logo: typedCompany.logo || '',
        coverImage: typedCompany.coverImage || '',
        industry: typedCompany.industry || [],
        size: typedCompany.size,
        founded: typedCompany.founded,
        location: typedCompany.location,
        website: typedCompany.website || '',
        social: {
          linkedin: typedCompany.social?.linkedin || '',
          twitter: typedCompany.social?.twitter || '',
          github: typedCompany.social?.github || ''
        },
        // Ensure proper ContentStatus typing
        status: typedCompany.status as ContentStatus || initialFormData.status,
        featured: typedCompany.featured !== undefined ? typedCompany.featured : initialFormData.featured
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
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof errors];
        return newErrors;
      });
    }
  };
  
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setLogoFile(event.target.files[0]);
      // Preview the image
      setFormData(prev => ({ ...prev, logo: URL.createObjectURL(event.target.files![0]) }));
    }
  };
  
  const handleCoverImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCoverImageFile(event.target.files[0]);
      // Preview the image
      setFormData(prev => ({ ...prev, coverImage: URL.createObjectURL(event.target.files![0]) }));
    }
  };
  
  const handleAddIndustry = () => {
    if (!newIndustry.trim()) {
      setErrors(prev => ({ ...prev, industry: 'Industry cannot be empty' }));
      return;
    }
    
    if (formData.industry.includes(newIndustry.trim())) {
      setErrors(prev => ({ ...prev, industry: 'Industry already exists' }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      industry: [...prev.industry, newIndustry.trim()]
    }));
    setNewIndustry('');
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.industry;
      return newErrors;
    });
  };
  
  const handleRemoveIndustry = (industryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      industry: prev.industry.filter(industry => industry !== industryToRemove)
    }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'social', string>> = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.size.trim()) {
      newErrors.size = 'Company size is required';
    }
    
    if (!formData.founded.trim()) {
      newErrors.founded = 'Founded year is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    // Industry validation
    if (formData.industry.length === 0) {
      newErrors.industry = 'At least one industry is required';
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

      // 3. Perform database operation using our adapter functions
      let dbOperationError = null;
      let companyData = null;
      
      if (isEditMode && id) {
        // Use adapter function for update operations
        const updateData = convertFormDataToUpdate(currentFormData);
        
        const { data, error } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        dbOperationError = error;
        companyData = data;
      } else {
        // Use adapter function for insert operations
        const insertData = convertFormDataToInsert(currentFormData);
        
        const { data, error } = await supabase
          .from('companies')
          .insert(insertData)
          .select()
          .single();
          
        dbOperationError = error;
        companyData = data;
      }

      if (dbOperationError) {
        throw new Error(`Database operation failed: ${dbOperationError.message}`);
      }

      // 4. Success handling
      setSubmitSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        // If we have a slug, navigate to the company detail page with slug
        if (companyData?.slug) {
          navigate(`/companies/${companyData.slug}`);
        } else if (companyData?.id) {
          navigate(`/companies/${companyData.id}`);
        } else {
          navigate('/companies');
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting company:', error);
      setErrors(prev => ({ 
        ...prev, 
        form: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Company' : 'Add Company'} | Nelson Tech Community</title>
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center">
            <Link 
              to="/companies" 
              className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
              {isEditMode ? 'Edit Company' : 'Add New Company'}
            </h1>
          </div>
          
          {companyLoading && isEditMode ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
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
