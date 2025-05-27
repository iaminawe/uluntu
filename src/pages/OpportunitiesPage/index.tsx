import { useState, useEffect } from 'react';
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
import { useOpportunitiesRedux } from '../../hooks/useOpportunitiesRedux';

// Define the SupabaseOpportunity type based on the Supabase schema
type SupabaseOpportunity = {
  id: string;
  title: string;
  description: string | null;
  organization: string | null;
  location: string | null;
  type: string | null;
  remote: boolean | null;
  image: string | null;
  compensation: string | null;
  deadline: string | null;
  created_at: string | null;
  updated_at: string | null;
  featured: boolean | null;
  status: string | null;
  posted_by: string | null;
  website: string | null;
  contact_email: string | null;
  benefits: string[] | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
};

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

// Note: We're using the SupabaseOpportunity type imported from '../../types'

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

  // Use the Redux-based hook to fetch opportunities data
  const { opportunities: fetchedOpportunities, loadOpportunities, isLoading, isError, error } = useOpportunitiesRedux();
  
  // Load opportunities on component mount
  useEffect(() => {
    loadOpportunities();
  }, []);
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
    benefits: [] as string[] | null,
    compensation: fallback.salary || null,
    contact_email: null,
    image: fallback.company.logo,
    requirements: [] as string[] | null,
    responsibilities: [] as string[] | null,
    posted_by: String(fallback.company.id),
    remote: fallback.remote,
    status: fallback.status || null,
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
    // Ensure opportunity is treated as SupabaseOpportunity
    const supabaseOpportunity = opportunity as SupabaseOpportunity;
    const mapped = mapToOpportunityListItem(supabaseOpportunity);
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
        ) : isError ? (
          <QueryError 
            error={error ? new Error(error) : new Error('Failed to load opportunities')} 
            retry={() => loadOpportunities()} 
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
