import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import OpportunitiesList from '../../components/OpportunitiesList';
import { 
  Opportunity as OpportunityListItem,
  OpportunityType
} from '../../components/OpportunitiesList/types';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useOpportunities } from '../../hooks/useQueries';

// Adapter function to map API opportunity data to the format expected by OpportunitiesList
const mapToOpportunityListItem = (opportunity: Opportunity): OpportunityListItem => {
  // Ensure the type is one of the valid OpportunityType values
  let opportunityType: OpportunityType;
  
  // Map the opportunity type to a valid OpportunityType
  switch(opportunity.type) {
    case 'full-time':
    case 'part-time':
    case 'contract':
    case 'volunteer':
    case 'internship':
      opportunityType = opportunity.type;
      break;
    default:
      // Default to full-time if the type is not recognized
      console.warn(`Unknown opportunity type: ${opportunity.type}, defaulting to full-time`);
      opportunityType = 'full-time';
  }
  
  return {
    id: opportunity.id,
    title: opportunity.title,
    company: {
      id: opportunity.company.id,
      name: opportunity.company.name,
      logo: opportunity.company.logo,
      location: ''
    },
    type: opportunityType,
    category: 'engineering', // Default category
    experienceLevel: 'mid', // Default experience level
    location: opportunity.location,
    remote: opportunity.remote,
    description: opportunity.description,
    responsibilities: [],
    requirements: [],
    salary: opportunity.salary,
    postedDate: opportunity.postedDate,
    deadline: opportunity.deadline,
    featured: opportunity.featured || false
  };
};

// Define Opportunity type based on migration plan
interface Opportunity {
  id: number;
  title: string;
  company: {
    id: number;
    name: string;
    logo: string;
  };
  type: string; // Allow any string type from mock data
  location: string;
  remote: boolean;
  description: string;
  salary?: string;
  postedDate: string;
  deadline?: string;
  status: string;
  featured?: boolean;
}

export default function OpportunitiesPage() {
  // State for filters from ActionBar
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<OpportunityType | 'all'>('all');
  const [remoteFilter, setRemoteFilter] = useState<boolean | 'all'>('all');
  
  // Fallback sample data in case the mock data isn't working
  const FALLBACK_OPPORTUNITIES = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      company: {
        id: 1,
        name: 'Mountain Tech Solutions',
        logo: 'https://images.pexels.com/photos/3183172/pexels-photo-3183172.jpeg'
      },
      type: 'full-time',
      location: 'Nelson, BC',
      remote: true,
      description: 'We\'re looking for a talented Full Stack Developer to join our growing team.',
      salary: '$90,000 - $120,000',
      postedDate: '2025-04-15',
      deadline: '2025-06-15',
      status: 'published',
      featured: true
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      company: {
        id: 2,
        name: 'Creative Solutions',
        logo: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg'
      },
      type: 'contract',
      location: 'Kelowna, BC',
      remote: true,
      description: 'Looking for a talented UX/UI designer to help create engaging user experiences.',
      salary: '$40-60/hour',
      postedDate: '2025-05-01',
      deadline: '2025-06-01',
      status: 'published'
    },
    {
      id: 3,
      title: 'Community Outreach Coordinator',
      company: {
        id: 3,
        name: 'Kootenay Tech Association',
        logo: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg'
      },
      type: 'volunteer',
      location: 'Remote',
      remote: true,
      description: 'Help us connect with the local tech community and organize events.',
      postedDate: '2025-04-20',
      status: 'published'
    }
  ];

  // Use the useOpportunities hook to fetch opportunities data
  const { data: fetchedOpportunities = [], isLoading, error } = useOpportunities();
  console.log('OpportunitiesPage - Raw opportunities from useOpportunities:', fetchedOpportunities);
  console.log('OpportunitiesPage - Number of opportunities:', fetchedOpportunities.length);
  
  // Use fallback data if no opportunities are fetched
  const opportunities = fetchedOpportunities.length > 0 ? fetchedOpportunities : FALLBACK_OPPORTUNITIES;
  const hasOpportunities = opportunities.length > 0;
  console.log('OpportunitiesPage - Using fallback data:', fetchedOpportunities.length === 0);
  console.log('OpportunitiesPage - hasOpportunities:', hasOpportunities);
  
  // Map API opportunities to the format expected by OpportunitiesList
  const mappedOpportunities = opportunities.map(opportunity => {
    console.log('OpportunitiesPage - Mapping opportunity:', opportunity);
    const mapped = mapToOpportunityListItem(opportunity);
    console.log('OpportunitiesPage - Mapped opportunity:', mapped);
    return mapped;
  });
  
  console.log('OpportunitiesPage - Final mappedOpportunities length:', mappedOpportunities.length);
  
  return (
    <>
      <Helmet>
        <title>Opportunities - Kootenay Tech Community</title>
        <meta name="description" content="Tech opportunities, jobs, and volunteer positions in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          remoteFilter={remoteFilter}
          onRemoteFilterChange={setRemoteFilter}
        />
        
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
          <OpportunitiesList 
            opportunities={mappedOpportunities} 
            initialFilters={{
              search: searchTerm,
              type: selectedType,
              remote: remoteFilter
            }}
          />
        )}
      </ContentContainer>
    </>
  );
}
