import { Helmet } from 'react-helmet-async';
import { Users, Heart, Briefcase } from 'lucide-react';
import { useMembers } from '@/hooks/useMemberQueries';
import { useCompanies } from '@/hooks/useCompanyQueries';
import { useEvents } from '@/hooks/useEventQueries';
import { useNewsArticlesWithFilters } from '@/hooks/useNewsQueries';
import { useGroups } from '@/hooks/useGroupQueries';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import HeroSection from './HeroSection';
import FeaturedSection from './FeaturedSection';
import CalloutSection from './CalloutSection';
import NewsletterSection from './NewsletterSection';
import { FeaturedItems } from './FeaturedItems';
import { Member, Company, Event, Group, NewsArticle } from './types';

// Import the source types
import { Member as ApiMember } from '@/hooks/useMemberQueries';
import { Company as ApiCompany } from '../../types';
import { Event as ApiEvent } from '../../types';
import { Group as ApiGroup } from '../../types';
import { NewsArticle as ApiNewsArticle } from '../../types';

// Type guard to ensure a value is a string
function ensureString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

// Adapter functions to convert application types to HomePage types
function adaptMembersForHomePage(members: ApiMember[]): Member[] {
  return members.map(member => {
    const adaptedMember: Member = {
      id: member.id,
      name: member.name,
      title: ensureString(member.role || member.title || ''),
      company: typeof member.company === 'string' ? member.company : undefined,
      location: typeof member.location === 'string' ? member.location : undefined,
      image: member.image || '',
      bio: typeof member.bio === 'string' ? member.bio : undefined,
      skills: Array.isArray(member.skills) ? member.skills : [],
      joinDate: typeof member.joinDate === 'string' ? member.joinDate : 
                typeof member.created_at === 'string' ? member.created_at : 
                new Date().toISOString(),
      featured: member.featured === true,
      social: member.social || {}
    };
    return adaptedMember;
  });
}

function adaptCompaniesForHomePage(companies: ApiCompany[]): Company[] {
  return companies.map(company => {
    const adaptedCompany: Company = {
      id: company.id,
      name: company.name,
      description: company.description,
      logo: company.logo,
      coverImage: company.coverImage,
      industry: company.industry,
      size: company.size,
      founded: company.founded,
      location: company.location,
      featured: company.featured === true,
      website: company.website,
      social: company.social,
      employees: company.employees
    };
    return adaptedCompany;
  });
}

function adaptEventsForHomePage(events: ApiEvent[]): Event[] {
  return events.map(event => {
    const adaptedEvent: Event = {
      id: event.id,
      title: event.title,
      date: event.date,
      endDate: event.endDate,
      location: event.location,
      description: event.description,
      image: event.image,
      organizer: {
        id: event.organizer?.id || '',
        name: event.organizer?.name || '',
        image: event.organizer?.image || ''
      },
      attendees: event.attendees,
      type: event.type as 'in-person' | 'online' | 'hybrid',
      featured: event.featured === true,
      url: event.url
    };
    return adaptedEvent;
  });
}

function adaptGroupsForHomePage(groups: ApiGroup[]): Group[] {
  return groups.map(group => {
    // We need to adapt any nested events to HomePage Event type
    const adaptedEvents = group.events ? adaptEventsForHomePage(group.events) : undefined;
    
    const adaptedGroup: Group = {
      id: group.id,
      name: group.name,
      description: group.description,
      longDescription: group.longDescription,
      heroImage: group.heroImage,
      coverImage: group.coverImage,
      visibility: group.visibility,
      memberCount: group.memberCount,
      eventCount: group.eventCount,
      resourceCount: group.resourceCount,
      postCount: group.postCount,
      lastActive: group.lastActive,
      featured: group.featured === true,
      members: group.members,
      events: adaptedEvents,
      resources: group.resources,
      posts: group.posts
    };
    return adaptedGroup;
  });
}

function adaptNewsForHomePage(news: ApiNewsArticle[]): NewsArticle[] {
  return news.map(article => {
    const adaptedArticle: NewsArticle = {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      date: article.date,
      image: article.image,
      featured: article.featured === true,
      author: article.author,
      tags: article.tags || [],
      slug: article.slug || '',
      hero_image_alt: article.hero_image_alt
    };
    return adaptedArticle;
  });
}

export default function HomePage() {
  // Fetch data using Tanstack Query
  const { data: apiMembers = [] } = useMembers();
  const { data: apiCompanies = [] } = useCompanies();
  const { data: apiEvents = [] } = useEvents();
  const { data: newsData } = useNewsArticlesWithFilters();
  const apiNews = newsData || [];
  const { data: apiGroups = [] } = useGroups();

  // Convert API data to HomePage types
  const members = adaptMembersForHomePage(apiMembers);
  const companies = adaptCompaniesForHomePage(apiCompanies);
  const events = adaptEventsForHomePage(apiEvents);
  const groups = adaptGroupsForHomePage(apiGroups);
  const news = adaptNewsForHomePage(apiNews);

  // Get featured items
  const { 
    featuredCompanies, 
    featuredEvents, 
    activeGroups, 
    latestNews 
  } = FeaturedItems({ 
    members, 
    companies, 
    events, 
    groups, 
    news 
  });

  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Kootenay Tech Community</title>
          <meta name="description" content="Connecting tech and knowledge workers in the Kootenays" />
        </Helmet>
        
        <HeroSection />
        
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <ContentContainer>
            <SkeletonGrid count={3} columns={{ sm: 1, md: 2, lg: 3 }} />
          </ContentContainer>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Kootenay Tech Community</title>
          <meta name="description" content="Connecting tech and knowledge workers in the Kootenays" />
        </Helmet>
        
        <HeroSection />
        
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <ContentContainer>
            <QueryError 
              error={error} 
              retry={() => console.log('Retrying homepage data')} 
              message="We couldn't load the community data. Please try again."
            />
          </ContentContainer>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Kootenay Tech Community</title>
        <meta name="description" content="Connecting tech and knowledge workers in the Kootenays" />
      </Helmet>
      
      <HeroSection />
      
      {/* Callout Cards Section - Light Background */}
      <div className="bg-slate-50 dark:bg-slate-900 py-20">
        <ContentContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CalloutSection
              title="Join the Directory"
              description="Add your profile to connect with other tech professionals."
              buttonText="View Directory"
              buttonLink="/directory"
              icon={Users}
              bgColor="bg-blue-600"
            />
            <CalloutSection
              title="Tech Events"
              description="Discover workshops, meetups, and tech gatherings."
              buttonText="View Events"
              buttonLink="/events"
              icon={Heart}
              bgColor="bg-orange-600"
            />
            <CalloutSection
              title="Job Opportunities"
              description="Find your next role in the tech industry."
              buttonText="View Opportunities"
              buttonLink="/opportunities"
              icon={Briefcase}
              bgColor="bg-emerald-600"
            />
          </div>
        </ContentContainer>
      </div>

      {/* Companies Section - Dark Background */}
      {companies.length > 0 && (
        <div className="bg-white dark:bg-slate-800 py-20">
          <ContentContainer>
            <FeaturedSection
              title="Tech Companies"
              description="Discover tech companies in our region"
              link="/companies"
              items={featuredCompanies}
            />
          </ContentContainer>
        </div>
      )}

      {/* Events Section - Light Background */}
      {events.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <ContentContainer>
            <FeaturedSection
              title="Upcoming Events"
              description="Join tech events and connect with the community"
              link="/events"
              items={featuredEvents}
            />
          </ContentContainer>
        </div>
      )}

      {/* Groups Section - Dark Background */}
      {groups.length > 0 && (
        <div className="bg-white dark:bg-slate-800 py-20">
          <ContentContainer>
            <FeaturedSection
              title="Active Groups"
              description="Join tech groups and connect with like-minded professionals"
              link="/groups"
              items={activeGroups}
            />
          </ContentContainer>
        </div>
      )}

      {/* News Section - Light Background */}
      {news.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <ContentContainer>
            <FeaturedSection
              title="Latest News"
              description="Stay updated with the latest from our tech community"
              link="/news"
              items={latestNews}
            />
          </ContentContainer>
        </div>
      )}

      {/* Newsletter Section - Dark Background */}
      <div className="bg-white dark:bg-slate-800 py-20">
        <ContentContainer>
          <NewsletterSection />
        </ContentContainer>
      </div>
    </>
  );
}
