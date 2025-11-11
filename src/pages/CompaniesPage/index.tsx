import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { ContentContainer, EmptyState } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useCompaniesHybrid } from '@/features/companies/hooks/useCompaniesHybrid';
import CompanyCard from '@/features/companies/components/CompaniesList/CompanyCard';
import { useEnabledFeatures } from '@/hooks/useSettings';

export default function CompaniesPage() {
  // Check if companies feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const companiesEnabled = isFeatureEnabled('companies_listing');

  // Use hybrid approach: React Query for data, Redux for UI state
  const {
    companies,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    setSearchTerm,
    setIndustries
  } = useCompaniesHybrid();

  // Redirect if companies feature is disabled
  if (!featuresLoading && !companiesEnabled) {
    return <Navigate to="/" replace />;
  }

  // Show loading while checking features
  if (featuresLoading) {
    return <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />;
  }
  
  return (
    <>
      <Helmet>
        <title>Tech Companies - Kootenay Tech Community</title>
        <meta name="description" content="Explore tech companies and startups in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          searchTerm={filters.search || ''}
          onSearch={setSearchTerm}
          selectedIndustries={filters.industries || []}
          onIndustryChange={setIndustries}
        />
        
        {isLoading ? (
          <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : isError ? (
          <QueryError 
            error={error || new Error('Failed to load companies')} 
            retry={refetch} 
            message="We couldn't load the companies. Please try again."
          />
        ) : !companies || companies.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {(companies || []).map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
              Showing {(companies || []).length} {(companies || []).length === 1 ? 'company' : 'companies'}
              {(filters?.search || (filters?.industries && filters.industries.length > 0)) && ' matching your filters'}
            </div>
          </div>
        )}
      </ContentContainer>
    </>
  );
}
