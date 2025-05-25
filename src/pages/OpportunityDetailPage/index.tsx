import { useState } from 'react';
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
import { useOpportunity } from '../../hooks/useOpportunityQueries';

// This would normally come from a hook like useOpportunity
const SAMPLE_OPPORTUNITY: Opportunity = {
  id: 1,
  title: 'Senior Full Stack Developer',
  description: 'Looking for an experienced developer to join our growing team. We are a fast-paced startup working on innovative solutions for the tech industry. The ideal candidate will have a strong background in modern web technologies and a passion for creating high-quality software.',
  type: 'job',
  organization: 'Mountain Tech Solutions',
  location: 'Nelson, BC',
  compensation: '$90,000 - $120,000/year',
  deadline: '2025-04-30',
  contactEmail: 'jobs@mountaintech.com',
  website: 'https://mountaintech.com',
  image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
  postedAt: '2025-03-01',
  postedBy: {
    name: 'Sarah Johnson',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    title: 'HR Manager',
    bio: 'Passionate about building great tech teams in the Kootenays.'
  },
  requirements: [
    '5+ years of full-stack development experience',
    'Strong knowledge of React and Node.js',
    'Experience with cloud platforms (AWS/GCP)',
    'Excellent communication skills'
  ],
  responsibilities: [
    'Lead development of new features',
    'Mentor junior developers',
    'Contribute to technical architecture decisions',
    'Collaborate with product and design teams'
  ],
  benefits: [
    'Flexible remote work options',
    'Extended health benefits',
    'Professional development budget',
    'Regular team events'
  ]
};

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  
  // This would normally come from a hook like useOpportunity(opportunityId)
  const opportunity = SAMPLE_OPPORTUNITY;
  const isLoading = false;
  const error = null;
  
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
