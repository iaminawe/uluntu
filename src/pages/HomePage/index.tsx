import { Helmet } from 'react-helmet-async';
import { Users, Heart, Briefcase, Star } from 'lucide-react';
import { useMembers, useCompanies, useEvents, useNews, useGroups } from '../../hooks/useQueries';
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
  const { data: news = [] } = useNews();
  const { data: groups = [] } = useGroups();

  // Get featured items
  const { 
    featuredMembers, 
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

  const hasFeaturedItems = (
    members.some(item => item.featured) || 
    events.some(item => item.featured) || 
    companies.some(item => item.featured) || 
    groups.some(item => item.featured)
  );

  // Track loading and error states
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
        
        <div className="bg-slate-50 dark:bg-slate-900 py-16">
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
        
        <div className="bg-slate-50 dark:bg-slate-900 py-16">
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
      
      <div className="bg-slate-50 dark:bg-slate-900">
        <ContentContainer className="py-16 space-y-16">
          {/* Featured Entities */}
          {hasFeaturedItems && (
            <div>
              <div className="flex items-center mb-6">
                <div className="mr-3 p-2 bg-orange-100 dark:bg-orange-500/20 rounded-full">
                  <Star className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.filter(m => m.featured).length > 0 && featuredMembers[0]}
                {companies.filter(c => c.featured).length > 0 && featuredCompanies[0]}
                {events.filter(e => e.featured).length > 0 && featuredEvents[0]}
              </div>
            </div>
          )}
          
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
          
          {/* Members */}
          {members.length > 0 && (
            <FeaturedSection
              title="Community Members"
              description="Connect with tech professionals in the Kootenay region"
              link="/directory"
              items={featuredMembers}
            />
          )}

          {/* Companies */}
          {companies.length > 0 && (
            <FeaturedSection
              title="Tech Companies"
              description="Discover tech companies in our region"
              link="/companies"
              items={featuredCompanies}
            />
          )}

          {/* Events */}
          {events.length > 0 && (
            <FeaturedSection
              title="Upcoming Events"
              description="Join tech events and connect with the community"
              link="/events"
              items={featuredEvents}
            />
          )}

          {/* Groups */}
          {groups.length > 0 && (
            <FeaturedSection
              title="Active Groups"
              description="Join tech groups and connect with like-minded professionals"
              link="/groups"
              items={activeGroups}
            />
          )}

          {/* News */}
          {news.length > 0 && (
            <FeaturedSection
              title="Latest News"
              description="Stay updated with the latest from our tech community"
              link="/news"
              items={latestNews}
            />
          )}

          {/* Newsletter Signup */}
          <NewsletterSection />
        </ContentContainer>
      </div>
    </>
  );
}
