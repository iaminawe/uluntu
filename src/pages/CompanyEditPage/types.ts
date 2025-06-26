// Types for CompanyEditPage components
import { Company as MainCompany } from '../../types';
import { ContentStatus } from '../../types/common';

// FormData interface for the edit form
export interface FormData {
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string; // Make required for the form
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website: string; // Make required for the form
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  status: ContentStatus; // Use the proper ContentStatus type
  featured: boolean;
}

// CompanyData represents the structure of a company with ID
export interface CompanyData {
  id: string; // Updated to use string consistently across the application
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  status?: ContentStatus;
  featured?: boolean;
}

// Adapter function to convert between MainCompany and CompanyData
export const adaptMainCompanyToCompanyData = (company: MainCompany): CompanyData => {
  return {
    id: String(company.id), // Ensure ID is always a string
    name: company.name,
    description: company.description,
    logo: company.logo,
    coverImage: company.coverImage,
    industry: company.industry,
    size: company.size,
    founded: company.founded,
    location: company.location,
    website: company.website,
    social: company.social,
    status: company.status,
    // Convert null to undefined for featured property
    featured: company.featured === null ? undefined : company.featured
  };
};

// Adapter function to convert CompanyData back to MainCompany format
export const adaptCompanyDataToMainCompany = (companyData: CompanyData): MainCompany => {
  return {
    id: companyData.id.toString(),
    name: companyData.name,
    description: companyData.description,
    logo: companyData.logo,
    coverImage: companyData.coverImage,
    industry: companyData.industry,
    size: companyData.size,
    founded: companyData.founded,
    location: companyData.location,
    website: companyData.website,
    social: companyData.social,
    status: companyData.status,
    featured: companyData.featured
  };
};

export interface BasicInfoSectionProps {
  formData: Pick<FormData, 'name' | 'slug' | 'description' | 'logo' | 'coverImage' | 'size' | 'founded' | 'location' | 'website' | 'status' | 'featured'>;
  errors: Partial<Record<keyof Pick<FormData, 'name' | 'slug' | 'description' | 'logo' | 'coverImage' | 'size' | 'founded' | 'location' | 'status' | 'featured'>, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isSubmitting: boolean;
  logoFile: File | null;
  coverImageFile: File | null;
  onLogoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IndustrySectionProps {
  industries: string[];
  newIndustry: string;
  setNewIndustry: (value: string) => void;
  onAdd: () => void;
  onRemove: (industry: string) => void;
  isSubmitting: boolean;
  error?: string;
}

export interface SocialSectionProps {
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Partial<Record<string, string>>;
  isSubmitting: boolean;
}
