import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
import PageHeader from './PageHeader';
import OpportunityHero from './OpportunityHero';
import OpportunityInfo from './OpportunityInfo';
import ApplySidebar from './ApplySidebar';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { Opportunity as FeatureOpportunity } from '@/features/opportunities/types';
import { Opportunity as PageOpportunity, adaptMainOpportunityToDetailPage } from './types';
import { useOpportunitiesHybrid } from '@/features/opportunities/hooks/useOpportunitiesHybrid';

// Sample opportunity data has been replaced with data from the Redux store

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  
  // Use the hybrid hook to fetch opportunity data
  const { getOpportunity } = useOpportunitiesHybrid();
  const { data: rawOpportunity, isLoading, error } = getOpportunity(id || '');
  
  // Adapt the opportunity data to match the page's expected interface
  const opportunity: PageOpportunity | undefined = rawOpportunity ? {
    ...adaptMainOpportunityToDetailPage(rawOpportunity),
    // Add required fields that might be missing
    postedAt: rawOpportunity.postedDate,
    postedBy: {
      name: rawOpportunity.postedBy || rawOpportunity.company.name,
      image: rawOpportunity.company.logo || '',
      title: 'Organization',
      bio: ''
    },
    requirements: rawOpportunity.requirements || [],
    responsibilities: rawOpportunity.responsibilities || [],
    benefits: rawOpportunity.benefits || [],
    contactEmail: rawOpportunity.contactEmail || '',
    website: rawOpportunity.website || '',
    image: rawOpportunity.image || ''
  } as PageOpportunity : undefined;
  
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

  if (error || !opportunity) {
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
