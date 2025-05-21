import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import CompanyCard from './CompanyCard';
import CompaniesFilters from './CompaniesFilters';
import { CompaniesListProps, FilterOptions } from './types';
import { useCompaniesWithFilters } from '../../hooks/useQueries';

const CompaniesList = ({ 
  initialSearch = '',
  initialIndustry = ''
}: CompaniesListProps) => {
  // State for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialSearch,
    industries: initialIndustry ? [initialIndustry] : []
  });
  
  // Fetch companies using Tanstack Query
  const { 
    data: companies = [], 
    isLoading, 
    error,
    refetch
  } = useCompaniesWithFilters({
    search: filters.search,
    industries: filters.industries.length > 0 ? filters.industries : undefined
  });

  return (
    <div className="space-y-8">
      {/* Filters */}
      <CompaniesFilters 
        filters={filters} 
        setFilters={setFilters} 
      />
      
      {/* Companies List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
      ) : error ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium mb-2">Error loading companies</p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : companies.length === 0 ? (
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
          {(filters.search || filters.industries.length > 0) && (
            <button 
              onClick={() => setFilters({ search: '', industries: [] })}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
      
      {/* Results summary */}
      {!isLoading && !error && companies.length > 0 && (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Showing {companies.length} {companies.length === 1 ? 'company' : 'companies'}
          {(filters.search || filters.industries.length > 0) && ' matching your filters'}
        </div>
      )}
    </div>
  );
};

export default CompaniesList;
