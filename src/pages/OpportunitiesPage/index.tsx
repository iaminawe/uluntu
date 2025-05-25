import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import OpportunitiesList from '../../components/OpportunitiesList';
import { 
  Opportunity as OpportunityListItem,
  OpportunityType,
  OpportunityCategory,
  ExperienceLevel
} from '../../components/OpportunitiesList/types';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useOpportunities, Opportunity as SupabaseOpportunity } from '../../hooks/useOpportunityQueries';

// Adapter function to map API opportunity data to the format expected by OpportunitiesList
const mapToOpportunityListItem = (opportunity: SupabaseOpportunity): OpportunityListItem => {
  // Ensure the type is one of the valid OpportunityType values
  let opportunityType: OpportunityType;
  
  // Map the opportunity type to a valid OpportunityType
  switch(opportunity.type as string) {
    case 'full-time':
    case 'part-time':
    case 'contract':
    case 'volunteer':
    case 'internship':
      opportunityType = opportunity.type as OpportunityType;
      break;
    default:
      opportunityType = 'full-time'; // Default fallback
  }

  // Create a category (required by OpportunityListItem but not in Supabase Opportunity)
  const category: OpportunityCategory = 'other';
  
  // Create an experience level (required by OpportunityListItem but not in Supabase Opportunity)
  const experienceLevel: ExperienceLevel = 'mid';
  
  return {
    id: Number(opportunity.id), // Convert string ID to number
    title: opportunity.title || '',
    company: {
      id: 1, // Default ID
      name: opportunity.organization || 'Unknown Company',
      logo: opportunity.image || '/placeholder-logo.png',
    },
    type: opportunityType,
    category: category,
    experienceLevel: experienceLevel,
    location: opportunity.location || 'Remote',
    remote: opportunity.remote || false,
    description: opportunity.description || '',
    responsibilities: opportunity.responsibilities || [],
    requirements: opportunity.requirements || [],
    salary: opportunity.compensation || 'Competitive',
    postedDate: opportunity.created_at || new Date().toISOString(),
    deadline: opportunity.deadline || '',
    applyUrl: opportunity.website || '',
    featured: opportunity.featured || false,
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
  
  // Convert fallback opportunities to the Supabase Opportunity type
  const fallbackOpportunitiesConverted: SupabaseOpportunity[] = FALLBACK_OPPORTUNITIES.map(fallback => ({
    id: String(fallback.id),
    created_at: fallback.postedDate,
    updated_at: fallback.postedDate,
    title: fallback.title,
    description: fallback.description,
    organization: fallback.company.name,
    deadline: fallback.deadline || null,
    location: fallback.location,
    type: fallback.type,
    featured: fallback.featured || false,
    benefits: [],
    compensation: fallback.salary,
    contact_email: null,
    image: fallback.company.logo,
    requirements: [],
    responsibilities: [],
    posted_by: String(fallback.company.id),
    remote: fallback.remote,
    status: fallback.status || 'open',
    website: null
  }));

  // Use fallback data if no opportunities are fetched
  const opportunities = fetchedOpportunities.length > 0 ? fetchedOpportunities : fallbackOpportunitiesConverted;
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
