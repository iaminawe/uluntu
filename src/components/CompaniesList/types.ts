// Types for CompaniesList component
import { EntityStatus } from '../../data/mock/mockData';

export interface CompanyEmployee {
  id: number;
  name: string;
  title?: string;
  image?: string;
}

export interface CompanySocial {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface Company {
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
  social?: CompanySocial;
  employees?: number[]; // IDs of employees
  status?: EntityStatus;
}

export interface CompaniesListProps {
  initialSearch?: string;
  initialIndustry?: string;
}

export interface FilterOptions {
  search: string;
  industries: string[];
}

// Common industry options for filter
export const INDUSTRY_OPTIONS = [
  'Software Development', 
  'Web Development', 
  'Data Science', 
  'AI/ML',
  'Hardware', 
  'IoT', 
  'Design', 
  'Consulting', 
  'Education', 
  'E-commerce'
];
