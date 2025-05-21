import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle } from 'lucide-react';

import OpportunityCard from './OpportunityCard';
import OpportunitiesFilters from './OpportunitiesFilters';
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

const OpportunitiesList = ({ initialCategory, companyId }: OpportunitiesListProps) => {
  // State for filter options
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    experienceLevel: 'all',
    remote: 'all',
    search: ''
  });
  
  // State for opportunities data
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtered opportunities based on current filters
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  
  // Fetch opportunities data (simulated)
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set initial category filter if provided
        if (initialCategory) {
          setFilters(prev => ({
            ...prev,
            category: initialCategory
          }));
        }
        
        // Set opportunities from sample data
        setOpportunities(SAMPLE_OPPORTUNITIES);
        setLoading(false);
      } catch (err) {
        setError('Failed to load opportunities. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOpportunities();
  }, [initialCategory]);
  
  // Apply filters when opportunities or filters change
  useEffect(() => {
    if (!opportunities.length) return;
    
    // Apply filters and sort by date
    const filtered = filterOpportunities(opportunities, filters, companyId);
    const sorted = sortOpportunitiesByDate(filtered);
    
    setFilteredOpportunities(sorted);
  }, [opportunities, filters, companyId]);
  
  // Show featured opportunities at the top
  const featuredOpportunities = filteredOpportunities.filter(opp => opp.featured);
  const regularOpportunities = filteredOpportunities.filter(opp => !opp.featured);
  
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
      {/* Header and post opportunity button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">
          Opportunities
          {companyId && <span className="text-lg font-normal ml-2">at this company</span>}
        </h2>
        
        <Link
          to="/opportunities/create"
          className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 
                 text-white rounded-md transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Post Opportunity
        </Link>
      </div>
      
      {/* Filters */}
      <OpportunitiesFilters 
        filters={filters} 
        setFilters={setFilters} 
        resultsCount={filteredOpportunities.length} 
        totalCount={opportunities.length} 
      />
      
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
          {/* Featured opportunities */}
          {featuredOpportunities.length > 0 && (
            <div className="space-y-4">
              {featuredOpportunities.map(opportunity => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity} 
                  featured={true} 
                />
              ))}
            </div>
          )}
          
          {/* Regular opportunities */}
          {regularOpportunities.length > 0 && (
            <div className="space-y-4">
              {regularOpportunities.map(opportunity => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
