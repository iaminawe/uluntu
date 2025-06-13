import { 
  Opportunity, 
  OpportunityType, 
  ExperienceLevel,
  FilterOptions 
} from '@/features/opportunities/components/OpportunitiesList/types';

// Format date string to a readable format (e.g., "May 10, 2025")
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate how many days are left until the deadline
export const calculateDaysLeft = (deadline?: string): number | null => {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  // Reset hours to compare dates only
  deadlineDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const differenceInTime = deadlineDate.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
  return differenceInDays > 0 ? differenceInDays : 0;
};

// Filter opportunities based on filter options
export const filterOpportunities = (
  opportunities: Opportunity[],
  filters: FilterOptions,
  companyId?: number
): Opportunity[] => {
  return opportunities.filter(opportunity => {
    // Filter by company if companyId is provided
    if (companyId && opportunity.company.id !== companyId) {
      return false;
    }
    
    // Filter by type
    if (filters.type !== 'all' && opportunity.type !== filters.type) {
      return false;
    }
    
    // Filter by experience level (if both filter and opportunity have experienceLevel)
    if (filters.experienceLevel && filters.experienceLevel !== 'all' && 
        opportunity.experienceLevel && opportunity.experienceLevel !== filters.experienceLevel) {
      return false;
    }
    
    // Filter by remote option
    if (filters.remote !== 'all' && opportunity.remote !== filters.remote) {
      return false;
    }
    
    // Filter by search term (check title, company name, and description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = (
        opportunity.title.toLowerCase().includes(searchLower) ||
        opportunity.company.name.toLowerCase().includes(searchLower) ||
        opportunity.description.toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    // If it passes all filters, include it
    return true;
  });
};

// Get color class for opportunity type badge
export const getTypeColor = (type: OpportunityType): string => {
  switch (type) {
    case 'full-time':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'part-time':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'contract':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    case 'volunteer':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'internship':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  }
};

// Get label for experience level
export const getExperienceLevelLabel = (level: ExperienceLevel): string => {
  switch (level) {
    case 'entry':
      return 'Entry Level';
    case 'mid':
      return 'Mid Level';
    case 'senior':
      return 'Senior Level';
    case 'lead':
      return 'Lead/Manager';
    case 'executive':
      return 'Executive';
    default:
      return level;
  }
};

// Sort opportunities by date (newest first)
export const sortOpportunitiesByDate = (opportunities: Opportunity[]): Opportunity[] => {
  return [...opportunities].sort((a, b) => {
    return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
  });
};

// Get readable text for opportunity type
export const getOpportunityTypeLabel = (type: OpportunityType): string => {
  switch (type) {
    case 'full-time':
      return 'Full-Time';
    case 'part-time':
      return 'Part-Time';
    case 'contract':
      return 'Contract';
    case 'volunteer':
      return 'Volunteer';
    case 'internship':
      return 'Internship';
    default:
      return type;
  }
};
