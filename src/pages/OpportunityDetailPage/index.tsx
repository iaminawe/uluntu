import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
import PageHeader from './PageHeader';
import OpportunityHero from './OpportunityHero';
import OpportunityInfo from './OpportunityInfo';
import ApplySidebar from './ApplySidebar';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { Opportunity as PageOpportunity, adaptMainOpportunityToDetailPage } from './types';

// Sample opportunity data has been replaced with data from the Redux store

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  
  console.log('[OpportunityDetailPage] Component mounted with id:', id);
  
  // Use React Query directly to fetch the opportunity
  const { data: rawOpportunity, isLoading, error } = useQuery({
    queryKey: ['opportunities', id],
    queryFn: async () => {
      console.log('[OpportunityDetailPage] queryFn called with id:', id);
      if (!id) {
        console.log('[OpportunityDetailPage] No id provided, returning null');
        return null;
      }
      
      try {
        console.log('[OpportunityDetailPage] Importing opportunitiesApi...');
        const { opportunitiesApi } = await import('@/features/opportunities/api/opportunitiesApi');
        console.log('[OpportunityDetailPage] Calling opportunitiesApi.getById with id:', id);
        const result = await opportunitiesApi.getById(id);
        console.log('[OpportunityDetailPage] API result:', result);
        
        // If no result from API, try mock data
        if (!result) {
          console.log('[OpportunityDetailPage] No data from API, using mock data');
          // Mock opportunity for testing
          const mockOpportunity = {
            id: id,
            title: 'Senior Full Stack Developer',
            description: 'We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining our web applications using modern technologies.',
            company: {
              id: '1',
              name: 'Tech Innovators Inc.',
              logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop&q=80'
            },
            organization: 'Tech Innovators Inc.',
            type: 'full-time' as const,
            location: 'Nelson, BC',
            remote: true,
            salary: '$90,000 - $120,000',
            postedDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            contactEmail: 'careers@techinnovators.com',
            website: 'https://techinnovators.com/careers',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=600&fit=crop&q=80',
            requirements: [
              '5+ years of experience in full-stack development',
              'Strong proficiency in React, TypeScript, and Node.js',
              'Experience with cloud platforms (AWS, Azure, or GCP)',
              'Excellent problem-solving and communication skills'
            ],
            responsibilities: [
              'Design and develop scalable web applications',
              'Collaborate with cross-functional teams',
              'Mentor junior developers',
              'Participate in code reviews and architectural decisions'
            ],
            benefits: [
              'Competitive salary and equity',
              'Flexible work arrangements',
              'Health and dental benefits',
              'Professional development budget'
            ],
            featured: true,
            status: 'published' as const,
            created_at: new Date().toISOString()
          };
          console.log('[OpportunityDetailPage] Returning mock opportunity:', mockOpportunity);
          return mockOpportunity;
        }
        
        console.log('[OpportunityDetailPage] Returning API result:', result);
        return result;
      } catch (error) {
        console.error('[OpportunityDetailPage] Error fetching opportunity:', error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  console.log('[OpportunityDetailPage] Query state:', { 
    isLoading, 
    error, 
    hasData: !!rawOpportunity,
    rawOpportunity 
  });
  
  // Adapt the opportunity data to match the page's expected interface
  const opportunity: PageOpportunity | undefined = rawOpportunity ? {
    id: String(rawOpportunity.id),
    title: rawOpportunity.title,
    description: rawOpportunity.description || '',
    type: rawOpportunity.type === 'full-time' || rawOpportunity.type === 'part-time' || rawOpportunity.type === 'contract' ? 'job' : 
          rawOpportunity.type === 'volunteer' ? 'volunteer' :
          rawOpportunity.type === 'funding' ? 'funding' :
          rawOpportunity.type === 'community' ? 'community' : 'job',
    organization: rawOpportunity.organization || rawOpportunity.company?.name || 'Unknown Organization',
    location: rawOpportunity.location || 'Remote',
    compensation: rawOpportunity.salary || 'Competitive',
    deadline: rawOpportunity.deadline,
    contactEmail: rawOpportunity.contactEmail || 'contact@example.com',
    website: rawOpportunity.website || '',
    image: rawOpportunity.image || rawOpportunity.company?.logo || '',
    postedAt: rawOpportunity.postedDate || rawOpportunity.created_at || new Date().toISOString(),
    postedBy: {
      name: rawOpportunity.organization || rawOpportunity.company?.name || 'Unknown Organization',
      image: rawOpportunity.company?.logo || '',
      title: 'Hiring Team',
      bio: 'We are looking for talented individuals to join our team.'
    },
    requirements: rawOpportunity.requirements || [],
    responsibilities: rawOpportunity.responsibilities || [],
    benefits: rawOpportunity.benefits || [],
    status: rawOpportunity.status
  } : undefined;
  
  console.log('[OpportunityDetailPage] Adapted opportunity:', opportunity);
  
  const handleApply = () => {
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
      setApplicationSuccess(true);
    }, 1000);
  };

  if (isLoading) {
    console.log('[OpportunityDetailPage] Rendering LoadingState');
    return <LoadingState />;
  }

  if (error || !opportunity) {
    console.log('[OpportunityDetailPage] Rendering ErrorState', { error, hasOpportunity: !!opportunity });
    return <ErrorState />;
  }

  console.log('[OpportunityDetailPage] Rendering opportunity detail');
  return (
    <>
      <Helmet>
        <title>{opportunity.title} - Uluntu</title>
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
