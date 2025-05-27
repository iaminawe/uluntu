import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import PageHeader from './PageHeader';
import OpportunityHero from './OpportunityHero';
import OpportunityInfo from './OpportunityInfo';
import ApplySidebar from './ApplySidebar';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { Opportunity } from './types';
import { useOpportunityRedux } from '../../hooks/useOpportunitiesRedux';

// Sample opportunity data has been replaced with data from the Redux store

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  
  // Use the Redux hook to fetch opportunity data
  const { opportunity, isLoading, isError, error } = useOpportunityRedux(id);
  
  const handleApply = () => {
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
      setApplicationSuccess(true);
    }, 1000);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !opportunity) {
    return <ErrorState />;
  }

  return (
    <>
      <Helmet>
        <title>{opportunity.title} - Kootenay Tech Community</title>
        <meta name="description" content={opportunity.description.substring(0, 160)} />
      </Helmet>
      
      <ContentContainer>
          <PageHeader id={id || ''} />
          
          <Card className="overflow-hidden">
            <OpportunityHero opportunity={opportunity} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <OpportunityInfo opportunity={opportunity} />
              </div>
              
              <ApplySidebar 
                opportunity={opportunity}
                isApplying={isApplying}
                applicationSuccess={applicationSuccess}
                handleApply={handleApply}
              />
            </div>
          </Card>
      </ContentContainer>
    </>
  );
}
