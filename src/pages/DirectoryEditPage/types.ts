// Types for DirectoryEditPage components
import { ContentStatus } from '../../types/common';

export interface FormData {
  name: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  image: string;
  bio: string;
  skills: string[];
  interests: string[];
  joinDate: string;
  status: ContentStatus;
  featured: boolean;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface MemberData {
  id: number;
  name: string;
  title?: string;
  company?: string;
  location?: string;
  image: string;
  bio?: string;
  skills?: string[];
  joinDate: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface BasicInfoSectionProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData | 'social', string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (file: File | null) => void;
  isSubmitting: boolean;
}

export interface SkillsSectionProps {
  skills: string[];
  newSkill: string;
  setNewSkill: (value: string) => void;
  onAdd: () => void;
  onRemove: (skill: string) => void;
  isSubmitting: boolean;
  error?: string;
}

export interface SocialSectionProps {
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Partial<Record<string, string>>;
  isSubmitting: boolean;
}
