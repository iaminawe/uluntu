import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import OpportunitiesList from '../../components/OpportunitiesList';
import PageHeader from './PageHeader';
import FilterTabs from './FilterTabs';
import ActionBar from './ActionBar';

// Define Opportunity type based on migration plan
interface Opportunity {
  id: number;
  title: string;
  company: {
    id: number;
    name: string;
    logo: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  location: string;
  remote: boolean;
  description: string;
  salary?: string;
  postedDate: string;
  deadline?: string;
}

export default function OpportunitiesPage() {
  // These would normally come from a Tanstack Query hook like useOpportunities()
  const isLoading = false;
  const error = null;
  const opportunities: Opportunity[] = []; // Would be populated from Tanstack Query
  const hasOpportunities = opportunities.length > 0;
  
  return (
    <>
      <Helmet>
        <title>Opportunities - Kootenay Tech Community</title>
        <meta name="description" content="Tech opportunities, jobs, and volunteer positions in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <FilterTabs />
        <ActionBar />
        
        {isLoading ? (
          <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying opportunities query')} 
            message="We couldn't load the opportunities. Please try again."
          />
        ) : !hasOpportunities ? (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No opportunities available</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Be the first to post an opportunity for the community!</p>
            <a href="/opportunities/create" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Post New Opportunity
            </a>
          </div>
        ) : (
          <OpportunitiesList />
        )}
      </ContentContainer>
    </>
  );
}
