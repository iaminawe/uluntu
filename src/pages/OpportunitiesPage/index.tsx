import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import OpportunitiesList from '@/features/opportunities/components/OpportunitiesList';
import { 
  Opportunity as OpportunityListItem,
  OpportunityType,
  OpportunityCategory,
  ExperienceLevel
} from '@/features/opportunities/components/OpportunitiesList/types';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useOpportunitiesHybrid } from '@/features/opportunities/hooks/useOpportunitiesHybrid';

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
  
  // Generate a unique numeric ID from the string ID
  const numericId = opportunity.id ? 
    (parseInt(opportunity.id) || opportunity.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) : 
    Math.floor(Math.random() * 100000);
    
  return {
    id: numericId, // Convert to number as required by type
    originalId: opportunity.id, // Preserve original string ID for routing
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
      id: '550e8400-e29b-41d4-a716-446655440001',
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
      id: '550e8400-e29b-41d4-a716-446655440002',
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
      id: '550e8400-e29b-41d4-a716-446655440003',
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

  // Use the hybrid hook to fetch opportunities data
  const { opportunities: fetchedOpportunities, isLoading, error, refetch } = useOpportunitiesHybrid();
  
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
  
  // Map API opportunities to the format expected by OpportunitiesList
  const mappedOpportunities = opportunities.map(opportunity => {
    // Ensure opportunity is treated as SupabaseOpportunity
    const supabaseOpportunity = opportunity as SupabaseOpportunity;
    const mapped = mapToOpportunityListItem(supabaseOpportunity);
    return mapped;
  });
  
  
  return (
    <>
      <Helmet>
        <title>Opportunities - Uluntu</title>
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
            retry={refetch} 
            message="We couldn't load the opportunities. Please try again."
          />
        ) : !hasOpportunities ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full 
                          flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No opportunities yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              The opportunities board is empty, but that's about to change! Be the first to post a position and help grow our tech community.
            </p>
            <a 
              href="/opportunities/create" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
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
