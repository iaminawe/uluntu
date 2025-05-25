import { Helmet } from 'react-helmet-async';
import { Users, Heart, Briefcase } from 'lucide-react';
import { useMembers } from '../../hooks/useMemberQueries';
import { useCompanies } from '../../hooks/useCompanyQueries';
import { useEvents } from '../../hooks/useEventQueries';
import { useNewsArticlesWithFilters } from '../../hooks/useNewsQueries';
import { useGroups } from '../../hooks/useGroupQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import HeroSection from './HeroSection';
import FeaturedSection from './FeaturedSection';
import CalloutSection from './CalloutSection';
import NewsletterSection from './NewsletterSection';
import { FeaturedItems } from './FeaturedItems';

export default function HomePage() {
  // Fetch data using Tanstack Query
  const { data: members = [] } = useMembers();
  const { data: companies = [] } = useCompanies();
  const { data: events = [] } = useEvents();
  const { data: newsData } = useNewsArticlesWithFilters();
  const news = newsData?.articles || [];
  const { data: groups = [] } = useGroups();

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
