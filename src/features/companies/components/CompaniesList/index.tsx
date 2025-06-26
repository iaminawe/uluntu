import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Building2, Grid3X3, List, Search } from 'lucide-react';

import CompanyCard from './CompanyCard';
import { CompaniesListProps } from './types';
import { useCompaniesHybrid } from '../../hooks/useCompaniesHybrid';
import { Company } from '../../types';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 9; // Number of companies per page

const CompaniesList = ({ 
  initialSearch = '',
  initialIndustry = ''
}: CompaniesListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Initialize the Redux filtered companies hook with initial filters
  const initialReduxFilters = useMemo(() => ({
    search: initialSearch,
    industries: initialIndustry ? [initialIndustry] : []
  }), [initialSearch, initialIndustry]);
  
  const { 
    companies: allCompanies, 
    isLoading, 
    isError, 
    error,
    updateFilters,
    setSearchTerm,
    setIndustries
  } = useCompaniesHybrid();
  
  // Apply initial filters
  useEffect(() => {
    updateFilters(initialReduxFilters);
  }, []);
  
  // Update filters when search term changes
  useEffect(() => {
    setSearchTerm(initialSearch);
    setCurrentPage(1); // Reset page when search term changes
  }, [initialSearch, setSearchTerm]);
  
  // Update filters when industry changes
  useEffect(() => {
    setIndustries(initialIndustry ? [initialIndustry] : []);
    setCurrentPage(1); // Reset page when industry changes
  }, [initialIndustry, setIndustries]);

  // Pagination logic
  const totalCompanies = allCompanies.length;
  const totalPages = Math.ceil(totalCompanies / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCompaniesToDisplay = allCompanies.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Effect to reset page if filters change directly (e.g. clear filters button)
  useEffect(() => {
    setCurrentPage(1);
  }, [initialSearch, initialIndustry]);
  
  // Add a one-time check for empty data
  useEffect(() => {
    // Only run once when the component mounts
    if (allCompanies.length === 0 && !isLoading) {
      updateFilters(initialReduxFilters);
    }
  }, []);  // Empty dependency array means this only runs once

  return (
    <div className="space-y-8">
      {/* View Mode Toggle & Results Count */}
      {!isLoading && !isError && totalCompanies > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">{totalCompanies}</span> 
            {totalCompanies === 1 ? ' company' : ' companies'} found
            {(initialSearch || initialIndustry) && ' matching your filters'}
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8" : "space-y-4"}>
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            viewMode === 'grid' ? <CompanyCardSkeleton key={i} /> : <CompanyListItemSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium mb-2">Error loading companies</p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error?.message || 'Please try again later.'}
          </p>
          <button
            onClick={() => updateFilters(initialReduxFilters)} // Retry with initial filters
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : totalCompanies === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full 
                        flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No companies found</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {(initialSearch || initialIndustry) 
              ? "We couldn't find any companies matching your search criteria. Try adjusting your filters."
              : "No companies have been added to the community yet. Be the first to add yours!"
            }
          </p>
          {(initialSearch || (initialIndustry && initialIndustry.length > 0)) && (
            <button 
              onClick={() => { 
                setSearchTerm('');
                setIndustries([]);
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              <Search className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {currentCompaniesToDisplay.map((company: Company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentCompaniesToDisplay.map((company: Company) => (
                <CompanyListItem key={company.id} company={company} />
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

// Skeleton loader for grid view
function CompanyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200 dark:bg-slate-700 relative">
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
          <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded"></div>
        </div>
      </div>
      <div className="p-6 pt-16">
        <div className="w-24 h-24 bg-slate-300 dark:bg-slate-600 rounded-2xl mx-auto -mt-28 mb-4"></div>
        <div className="space-y-2 text-center mb-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mx-auto"></div>
        </div>
        <div className="flex gap-2 justify-center">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for list view
function CompanyListItemSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-slate-300 dark:bg-slate-600 rounded-xl"></div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
            </div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
          </div>
          <div className="space-y-2 mt-3">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-16"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// List view component
function CompanyListItem({ company }: { company: Company }) {
  const memberCount = Math.floor(Math.random() * 50) + 5;
  
  return (
    <a
      href={`/companies/${company.id}`}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 flex items-center gap-6 group block"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-1.5 shadow-md flex-shrink-0 group-hover:shadow-lg transition-shadow">
        {company.logo ? (
          <img
            src={company.logo}
            alt={`${company.name} logo`}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
              {company.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {company.size}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {company.location}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {memberCount} members
              </span>
            </div>
          </div>
          {company.featured && (
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Featured
            </span>
          )}
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
          {company.description}
        </p>
        
        {company.industry && company.industry.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {company.industry.slice(0, 4).map((ind, index) => (
              <span
                key={`${ind}-${index}`}
                className="inline-flex items-center px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-md text-xs font-medium border border-orange-200 dark:border-orange-800"
              >
                {ind}
              </span>
            ))}
            {company.industry.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-xs font-medium">
                +{company.industry.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}

export default CompaniesList;