import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import CompaniesList from '../../components/CompaniesList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useCompanies } from '../../hooks/useSupabaseQueries';


export default function CompaniesPage() {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  
  // Use the useCompanies hook to fetch companies data
  const { data: companies = [], isLoading, error } = useCompanies();
  const hasCompanies = companies.length > 0;
  
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
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying companies query')} 
            message="We couldn't load the companies. Please try again."
          />
        ) : !hasCompanies ? (
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
          <CompaniesList 
            initialSearch={searchTerm} 
            initialIndustry={selectedIndustries.length === 1 ? selectedIndustries[0] : ''} 
          />
        )}
      </ContentContainer>
    </>
  );
}
