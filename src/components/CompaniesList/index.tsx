import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import CompanyCard from './CompanyCard';
import { CompaniesListProps } from './types';
import { useFilteredCompaniesRedux } from '../../hooks/useCompaniesRedux';
import Pagination from '../Pagination'; // Import Pagination

const ITEMS_PER_PAGE = 9; // Number of companies per page

const CompaniesList = ({ 
  initialSearch = '',
  initialIndustry = ''
}: CompaniesListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  // Initialize the Redux filtered companies hook with initial filters
  const initialReduxFilters = {
    search: initialSearch,
    industries: initialIndustry ? [initialIndustry] : []
  };
  
  const { 
    companies: allCompanies, 
    isLoading, 
    isError, 
    error,
    updateFilters,
    setSearchTerm,
    setIndustries
  } = useFilteredCompaniesRedux(initialReduxFilters);
  
  // Update filters when props change
  useEffect(() => {
    setSearchTerm(initialSearch);
    setCurrentPage(1); // Reset page when search term changes
  }, [initialSearch]);
  
  useEffect(() => {
    if (initialIndustry) {
      setIndustries(initialIndustry ? [initialIndustry] : []);
      setCurrentPage(1); // Reset page when industry changes
    }
  }, [initialIndustry]);

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

  return (
    <div className="space-y-8">
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md mr-4"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium mb-2">Error loading companies</p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error || 'Please try again later.'}
          </p>
          <button
            onClick={() => updateFilters(initialReduxFilters)} // Retry with initial filters
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : totalCompanies === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full 
                        flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">No companies found matching your criteria.</p>
          {(initialSearch || (initialIndustry && initialIndustry.length > 0)) && (
            <button 
              onClick={() => { 
                setSearchTerm('');
                setIndustries([]);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCompaniesToDisplay.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
      
      {!isLoading && !isError && totalCompanies > 0 && (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Showing {currentCompaniesToDisplay.length} of {totalCompanies} {totalCompanies === 1 ? 'company' : 'companies'}
          {(initialSearch || (initialIndustry && initialIndustry.length > 0)) && ' matching your filters'}
        </div>
      )}
    </div>
  );
};

export default CompaniesList;
