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
  formData: FormData;
  errors: Partial<Record<keyof FormData | 'social', string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isSubmitting: boolean;
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
