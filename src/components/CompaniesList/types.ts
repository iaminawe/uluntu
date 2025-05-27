// Types for CompaniesList component
import { Company as MainCompany } from '../../types';

// Use the main application's Company type directly
export type Company = MainCompany;

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
