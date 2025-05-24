// Types for CompanyDetailPage components
import { Company, Member } from '../../types';

export interface PageHeaderProps {
  id: string;
}

export interface CompanyInfoSectionProps {
  company: Company;
}

export interface SocialLinksSidebarProps {
  company: Company;
}

export interface CompanyDetailsProps {
  company: Company;
}

export interface EmployeesSectionProps {
  employees: Member[];
  isLoading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LoadingStateProps {
  // Can include any customization props in the future
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}
