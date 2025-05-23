import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import OpportunityCard from './OpportunityCard';
import { 
  Opportunity, 
  OpportunitiesListProps, 
  FilterOptions, 
  SAMPLE_OPPORTUNITIES 
} from './types';
import { 
  filterOpportunities, 
  sortOpportunitiesByDate 
} from './utils';

const OpportunitiesList = ({ 
  initialCategory, 
  companyId, 
  opportunities: externalOpportunities,
  initialFilters
}: OpportunitiesListProps) => {
  // State for filter options
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {
    type: 'all',
    remote: 'all',
    search: ''
  });
  
  // Update filters when initialFilters changes
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);
  
  // State for opportunities data
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtered opportunities based on current filters
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  
  // Use external opportunities data or fetch from sample data
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        // Set initial category filter if provided
        if (initialCategory) {
          setFilters(prev => ({
            ...prev,
            category: initialCategory
          }));
        }
        
        // Use external opportunities if provided, otherwise use sample data
        if (externalOpportunities && externalOpportunities.length > 0) {
          console.log('OpportunitiesList - Using external opportunities data:', externalOpportunities);
          console.log('OpportunitiesList - Number of external opportunities:', externalOpportunities.length);
          console.log('OpportunitiesList - First opportunity:', externalOpportunities[0]);
          setOpportunities(externalOpportunities);
        } else {
          // In a real app, this would be an API call
          // Simulate API delay for sample data
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('OpportunitiesList - Using sample opportunities data');
          console.log('OpportunitiesList - Number of sample opportunities:', SAMPLE_OPPORTUNITIES.length);
          setOpportunities(SAMPLE_OPPORTUNITIES);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load opportunities. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOpportunities();
  }, [initialCategory, externalOpportunities]);
  
  // Apply filters when opportunities or filters change
  useEffect(() => {
    if (!opportunities.length) {
      console.log('OpportunitiesList - No opportunities to filter');
      return;
    }
    
    console.log('OpportunitiesList - Filtering opportunities:', opportunities);
    console.log('OpportunitiesList - Using filters:', filters);
    
    // Apply filters and sort by date
    const filtered = filterOpportunities(opportunities, filters, companyId);
    console.log('OpportunitiesList - Filtered opportunities:', filtered);
    
    const sorted = sortOpportunitiesByDate(filtered);
    console.log('OpportunitiesList - Sorted opportunities:', sorted);
    
    setFilteredOpportunities(sorted);
  }, [opportunities, filters, companyId]);
  
  // Show featured opportunities at the top
  console.log('OpportunitiesList - filteredOpportunities before splitting:', filteredOpportunities);
  const featuredOpportunities = filteredOpportunities.filter(opp => opp.featured);
  const regularOpportunities = filteredOpportunities.filter(opp => !opp.featured);
  console.log('OpportunitiesList - featuredOpportunities:', featuredOpportunities);
  console.log('OpportunitiesList - regularOpportunities:', regularOpportunities);
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-orange-200 dark:bg-orange-700 rounded-full mb-4"></div>
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                    rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Opportunities</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Opportunities content */}
      
      {/* Results */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
                      rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full 
                        flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No opportunities found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={() => setFilters({
              type: 'all',
              experienceLevel: 'all',
              remote: 'all',
              search: ''
            })}
            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 
                     text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 
                     dark:hover:bg-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured opportunities - 2-up grid */}
          {featuredOpportunities.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Featured Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredOpportunities.map(opportunity => (
                  <OpportunityCard 
                    key={opportunity.id} 
                    opportunity={opportunity} 
                    featured={true} 
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Regular opportunities - 3-up grid */}
          {regularOpportunities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">All Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularOpportunities.map(opportunity => (
                  <OpportunityCard 
                    key={opportunity.id} 
                    opportunity={opportunity} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
