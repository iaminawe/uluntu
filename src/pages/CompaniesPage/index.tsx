import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import { Link } from 'react-router-dom';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { Company } from '../../types';
import { useCompaniesRedux } from '@/features/companies/hooks/useCompaniesRedux';

export default function CompaniesPage() {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  
  // Use Redux for companies data
  const { companies, isLoading, isError, error, loadCompanies } = useCompaniesRedux();
  
  // Load companies on mount
  useEffect(() => {
    console.log('[CompaniesPage] Loading companies via Redux...');
    loadCompanies();
  }, [loadCompanies]);
  
  // Filter companies based on search term and selected industries
  const filteredCompanies = companies.filter(company => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by industries
    const matchesIndustry = selectedIndustries.length === 0 || 
      (company.industry && selectedIndustries.some(industry => company.industry.includes(industry)));
    
    return matchesSearch && matchesIndustry;
  });
  
  return (
    <>
      <Helmet>
        <title>Tech Companies - Kootenay Tech Community</title>
        <meta name="description" content="Explore tech companies and startups in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          selectedIndustries={selectedIndustries}
          onIndustryChange={setSelectedIndustries}
        />
        
        {isLoading ? (
          <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : isError ? (
          <QueryError 
            error={error ? new Error(String(error)) : new Error('Failed to load companies')} 
            retry={loadCompanies} 
            message="We couldn't load the companies. Please try again."
          />
        ) : companies.length === 0 ? (
          <EmptyState
            title="No Companies Listed"
            description="There are no companies in the directory yet."
            primaryActionUrl="/companies/create"
            primaryAction={{
              text: "Add a Company",
              onClick: () => console.log('Navigate to add company')
            }}
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCompanies.map(company => (
                <Link 
                  to={`/companies/${company.id}`} 
                  key={company.id} 
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={`${company.name} logo`} 
                        className="w-16 h-16 object-contain rounded-md mr-4" 
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md mr-4 flex items-center justify-center">
                        <span className="text-slate-500 dark:text-slate-400 text-xl font-bold">
                          {company.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {company.name}
                      </h3>
                      {company.location && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {company.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {company.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                      {company.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {company.industry && company.industry.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
              Showing {filteredCompanies.length} of {companies.length} {companies.length === 1 ? 'company' : 'companies'}
              {(searchTerm || selectedIndustries.length > 0) && ' matching your filters'}
            </div>
          </div>
        )}
      </ContentContainer>
    </>
  );
}
