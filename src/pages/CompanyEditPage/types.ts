// Types for CompanyEditPage components

export interface FormData {
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  status: string;
  featured: boolean;
}

export interface CompanyData {
  id: number;
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
}

export interface BasicInfoSectionProps {
  formData: Pick<FormData, 'name' | 'description' | 'logo' | 'coverImage' | 'size' | 'founded' | 'location' | 'website' | 'status' | 'featured'>;
  errors: Partial<Record<keyof Pick<FormData, 'name' | 'description' | 'logo' | 'coverImage' | 'size' | 'founded' | 'location' | 'status' | 'featured'>, string>>;
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
