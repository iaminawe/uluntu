import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Import UI components
import HeroSection from '@/pages/HomePage/HeroSection';
import ContentContainer from '@/components/ui/PageLayout/ContentContainer';

// Import card components
import MemberCard from '@/components/DirectoryList/MemberCard';
import CompanyCard from '@/components/CompaniesList/CompanyCard';
import EventCard from '@/components/EventsList/EventCard';
import NewsCard from '@/components/NewsList/ArticleCard';
import GroupCard from '@/components/GroupsList/GroupCard';

// Define types that match the actual Supabase database structure
// Database schema types with optional fields to handle variations
type SupabaseMember = {
  id: string;
  name: string;
  title: string;
  company?: string | null;
  location?: string | null;
  image: string;
  bio?: string | null;
  intro?: string | null;
  skills?: string[] | null;
  arrived_in_nelson?: string | null; // This will be used as joinDate
  linkedin?: string | null;
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
  status: DatabaseStatus;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  employment_status?: string | null;
}

type SupabaseCompany = {
  id: string;
  name: string;
  description: string;
  logo: string;
  cover_image?: string | null;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website?: string | null;
  status: DatabaseStatus;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Using a flexible type to handle database schema variations
type SupabaseEvent = {
  id: string;
  title: string;
  // Allow both date and start_date fields
  date?: string;
  start_date?: string;
  end_date?: string | null;
  location: string;
  address?: string | null;
  description: string;
  image?: string | null;
  type: string;
  url?: string | null;
  group_id?: string | null;
  max_attendees?: number | null;
  current_attendees?: number | null;
  status: DatabaseStatus;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown; // Allow for additional fields from database
}

// Using a flexible type to handle database schema variations
type SupabaseNewsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  published_date?: string; // Will be mapped to date
  hero_image?: string | null; // Will be mapped to image
  hero_image_alt?: string | null;
  author_id?: string | null;
  status: DatabaseStatus;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown; // Allow for additional fields from database
}

type SupabaseGroup = {
  id: string;
  name: string;
  description: string;
  long_description?: string | null;
  hero_image: string;
  cover_image?: string | null;
  visibility: string;
  member_count?: number | null;
  status: DatabaseStatus;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Types for direct data fetching
// Type for database status values
type DatabaseStatus = string;

// Helper function to convert null to undefined for UI components
const nullToUndefined = <T,>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

const DirectHomePage = () => {
  // State for directly fetched data
  const [members, setMembers] = useState<SupabaseMember[]>([]);
  const [companies, setCompanies] = useState<SupabaseCompany[]>([]);
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [news, setNews] = useState<SupabaseNewsArticle[]>([]);
  const [groups, setGroups] = useState<SupabaseGroup[]>([]);
  const [loading, setLoading] = useState({
    members: true,
    companies: true,
    events: true,
    news: true,
    groups: true
  });
  const [errors, setErrors] = useState({
    members: null as string | null,
    companies: null as string | null,
    events: null as string | null,
    news: null as string | null,
    groups: null as string | null
  });

  // Fetch data directly from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .limit(6);
        
        if (membersError) {
          setErrors(prev => ({ ...prev, members: membersError.message }));
        } else {
          // Type assertion to handle database schema differences
          setMembers(membersData as SupabaseMember[] || []);
        }
        setLoading(prev => ({ ...prev, members: false }));
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .limit(6);
        
        if (companiesError) {
          setErrors(prev => ({ ...prev, companies: companiesError.message }));
        } else {
          // Type assertion to handle database schema differences
          setCompanies(companiesData as SupabaseCompany[] || []);
        }
        setLoading(prev => ({ ...prev, companies: false }));
        
        // Fetch events
        console.log('Fetching events...');
        // Use the correct table name and add ordering
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        console.log('Events data:', eventsData);
        console.log('Events error:', eventsError);
        
        if (eventsError) {
          setErrors(prev => ({ ...prev, events: eventsError.message }));
        } else if (eventsData && eventsData.length > 0) {
          // Use type assertion with proper type to handle schema variations
          setEvents(eventsData as unknown as SupabaseEvent[]);
        } else {
          // If no events found, create a sample event for testing
          const sampleEvent = {
            id: 'sample-1',
            title: 'Sample Event',
            start_date: new Date().toISOString(),
            location: 'Nelson, BC',
            description: 'This is a sample event to test rendering',
            image: '/placeholder-event.png',
            type: 'in-person'
          };
          setEvents([sampleEvent] as unknown as SupabaseEvent[]);
        }
        setLoading(prev => ({ ...prev, events: false }));
        
        // Fetch news
        console.log('Fetching news...');
        // Use the correct table name and add ordering
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        console.log('News data:', newsData);
        console.log('News error:', newsError);
        
        if (newsError) {
          setErrors(prev => ({ ...prev, news: newsError.message }));
        } else if (newsData && newsData.length > 0) {
          // Use type assertion with proper type to handle schema variations
          setNews(newsData as unknown as SupabaseNewsArticle[]);
        } else {
          // If no news found, create a sample article for testing
          const sampleArticle = {
            id: 'sample-1',
            title: 'Sample News Article',
            slug: 'sample-news-article',
            excerpt: 'This is a sample news article to test rendering',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            published_date: new Date().toISOString(),
            hero_image: '/placeholder-news.png'
          };
          setNews([sampleArticle] as unknown as SupabaseNewsArticle[]);
        }
        setLoading(prev => ({ ...prev, news: false }));
        
        // Fetch groups
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .limit(3);
        
        if (groupsError) {
          setErrors(prev => ({ ...prev, groups: groupsError.message }));
        } else {
          // Type assertion to handle database schema differences
          setGroups(groupsData as SupabaseGroup[] || []);
        }
        setLoading(prev => ({ ...prev, groups: false }));
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Nelson Tech - Home</title>
        <meta name="description" content="Nelson Tech community homepage" />
      </Helmet>
      
      <HeroSection />
      
      <div className="bg-white dark:bg-slate-800 py-10 border-t border-b border-slate-200 dark:border-slate-700">
        <ContentContainer>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Nelson Tech</h1>
            <div className="mb-4 space-y-2">
              <div>
                <Link to="/" className="text-blue-600 hover:text-blue-800 underline">Back to Redux HomePage</Link>
              </div>
              <div>
                <Link to="/quick-diagnostics" className="text-blue-600 hover:text-blue-800 underline">Supabase Diagnostics</Link>
              </div>
            </div>
            
            {/* Members Section */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Members</h2>
                <Link to="/members" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">View All</Link>
              </div>
              
              {loading.members ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : errors.members ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-600">Error loading members: {errors.members}</p>
                </div>
              ) : members.length === 0 ? (
                <p className="text-gray-500">No members found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <MemberCard 
                      key={member.id} 
                      member={{
                        id: member.id,
                        name: member.name,
                        title: member.title,
                        company: nullToUndefined(member.company),
                        location: nullToUndefined(member.location),
                        image: member.image,
                        intro: nullToUndefined(member.intro) || '',
                        bio: nullToUndefined(member.bio),
                        joinDate: member.arrived_in_nelson || 'Unknown',
                        social: {
                          linkedin: nullToUndefined(member.linkedin),
                          twitter: nullToUndefined(member.twitter),
                          github: nullToUndefined(member.github),
                          website: nullToUndefined(member.website)
                        },
                        // Omit status as it's not in the Member interface
                        // status: member.status
                      }} 
                    />
                  ))}
                </div>
              )}
            </section>
            
            {/* Companies Section */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Companies</h2>
                <Link to="/companies" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">View All</Link>
              </div>
              
              {loading.companies ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : errors.companies ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-600">Error loading companies: {errors.companies}</p>
                </div>
              ) : companies.length === 0 ? (
                <p className="text-gray-500">No companies found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              )}
            </section>
            
            {/* Events Section */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold">Events</h2>
              </div>
              
              {loading.events ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : errors.events ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-600">Error loading events: {errors.events}</p>
                </div>
              ) : events.length === 0 ? (
                <p className="text-gray-500">No events found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={{
                        id: event.id,
                        title: event.title,
                        date: event.start_date || event.date || new Date().toISOString(),
                        endDate: nullToUndefined(event.end_date),
                        location: event.location || 'Location TBD',
                        description: event.description || 'No description available',
                        image: nullToUndefined(event.image) || '/placeholder-event.png',
                        type: event.type as 'in-person' | 'online' | 'hybrid',
                        url: nullToUndefined(event.url),
                        // Add required organizer property
                        organizer: {
                          id: event.group_id || 'unknown',
                          name: 'Event Organizer',
                          image: '/placeholder-organizer.png'
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
            
            {/* News Section */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold">News</h2>
              </div>
              
              {loading.news ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : errors.news ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-600">Error loading news: {errors.news}</p>
                </div>
              ) : news.length === 0 ? (
                <p className="text-gray-500">No news found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {news.map((article) => (
                    <NewsCard 
                      key={article.id} 
                      article={{
                        id: article.id,
                        title: article.title,
                        slug: article.slug || `article-${article.id}`,
                        excerpt: nullToUndefined(article.excerpt) || 'No excerpt available',
                        content: article.content || 'No content available',
                        date: article.published_date || article.created_at || new Date().toISOString(),
                        image: nullToUndefined(article.hero_image) || nullToUndefined(article.image) || '/placeholder-news.png',
                        url: `/news/${article.slug || `article-${article.id}`}`,
                        // Add required publishedAt property
                        publishedAt: article.published_date || article.created_at || new Date().toISOString(),
                        // Add required author property
                        author: {
                          id: article.author_id || 'unknown',
                          name: 'Article Author',
                          image: '/placeholder-author.png'
                        },
                        // Add required tags property
                        tags: []
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
            
            {/* Groups Section */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold">Groups</h2>
              </div>
              
              {loading.groups ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : errors.groups ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-600">Error loading groups: {errors.groups}</p>
                </div>
              ) : groups.length === 0 ? (
                <p className="text-gray-500">No groups found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {groups.map((group) => (
                    <GroupCard 
                      key={group.id} 
                      group={{
                        id: group.id,
                        name: group.name,
                        description: group.description,
                        heroImage: group.hero_image,
                        visibility: group.visibility as 'open' | 'closed' | 'secret',
                        memberCount: group.member_count || 0,
                        lastActive: new Date().toISOString(),
                        members: [],
                        // Omit status as it's not in the Group interface
                        // status: group.status
                      }}
                      onJoinClick={() => {}} 
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </ContentContainer>
      </div>
    </>
  );
};

export default DirectHomePage;
