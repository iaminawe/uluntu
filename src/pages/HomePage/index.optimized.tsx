import React, { Suspense, lazy, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Calendar, 
  Users, 
  Briefcase, 
  Building
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { newsApi } from '@/features/news/api/newsApi';
import { groupsApi } from '@/features/groups/api/groupsApi';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';

// Import visual components
import { 
  DynamicHero, 
  GlassCard, 
  FeatureCard,
  ImageSection
} from '@/shared/components/visual';

// Lazy load heavy sections
const UpcomingEventsSection = lazy(() => import('./sections/UpcomingEventsSection'));
const CommunityMomentsSection = lazy(() => import('./sections/CommunityMomentsSection'));
const ActiveGroupsSection = lazy(() => import('./sections/ActiveGroupsSection'));
const NewCompaniesSection = lazy(() => import('./sections/NewCompaniesSection'));
const NewMembersSection = lazy(() => import('./sections/NewMembersSection'));

export default function HomePage() {
  // Critical data only - load minimal data for initial render
  const { data: stats = { members: 0, companies: 0, events: 0, groups: 0 } } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      // This should be a dedicated endpoint that returns just counts
      // For now, we'll use existing endpoints but only count
      const [membersRes, companiesRes, eventsRes, groupsRes] = await Promise.all([
        fetch('/api/members?limit=1').then(r => r.json()),
        fetch('/api/companies?limit=1').then(r => r.json()),
        fetch('/api/events?limit=1').then(r => r.json()),
        groupsApi.getAll({ limit: 1 })
      ]);
      
      return {
        members: membersRes.total || 50,
        companies: companiesRes.total || 20,
        events: eventsRes.total || 15,
        groups: groupsRes.length || 10
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Hero images configuration
  const heroImages = useMemo(() => [
    {
      src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=2400&h=1600&fit=crop",
      alt: "Tech professionals working with mountain view"
    },
    {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2400&h=1600&fit=crop",
      alt: "Collaborative tech workspace"
    },
    {
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=2400&h=1600&fit=crop",
      alt: "Tech meetup event"
    }
  ], []);

  // Feature cards configuration with dynamic stats
  const features = useMemo(() => [
    {
      icon: Users,
      title: "Member Directory",
      description: `Connect with ${stats.members}+ tech professionals in the Kootenay region`,
      link: "/directory",
      color: "blue" as const
    },
    {
      icon: Calendar,
      title: "Tech Events",
      description: `Join ${stats.events}+ workshops, meetups, and conferences happening locally`,
      link: "/events",
      color: "orange" as const
    },
    {
      icon: Briefcase,
      title: "Job Board",
      description: "Find your next opportunity with local tech companies",
      link: "/opportunities",
      color: "emerald" as const
    },
    {
      icon: Building,
      title: "Companies",
      description: `Explore ${stats.companies}+ innovative tech companies in our region`,
      link: "/companies",
      color: "purple" as const
    }
  ], [stats]);

  return (
    <>
      <Helmet>
        <title>Nelson Tech Community - Connecting Kootenay Tech Professionals</title>
        <meta name="description" content="Join the thriving tech community in Nelson and the Kootenays. Connect with professionals, discover events, and explore opportunities." />
      </Helmet>

      {/* Dynamic Hero Section - Always show immediately */}
      <DynamicHero
        title="Nelson Tech Community"
        subtitle="Kootenay Innovation Hub"
        description="Connecting tech professionals in the heart of British Columbia's mountain paradise"
        images={heroImages}
        height="large"
        actions={[
          { label: "Join the Community", href: "/directory", variant: "primary" },
          { label: "Explore Events", href: "/events", variant: "secondary" }
        ]}
      />

      {/* Feature Cards Section - Show with minimal stats */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Your gateway to the Kootenay tech ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lazy load all data-heavy sections */}
      <Suspense fallback={
        <div className="py-20 bg-slate-50 dark:bg-slate-900">
          <ContentContainer>
            <SkeletonGrid count={3} columns={{ sm: 1, md: 2, lg: 3 }} />
          </ContentContainer>
        </div>
      }>
        <UpcomingEventsSection />
      </Suspense>

      <Suspense fallback={
        <div className="py-20 bg-white dark:bg-slate-800">
          <ContentContainer>
            <SkeletonGrid count={3} columns={{ sm: 1, md: 2, lg: 3 }} />
          </ContentContainer>
        </div>
      }>
        <CommunityMomentsSection />
      </Suspense>

      <Suspense fallback={
        <div className="py-20 bg-slate-50 dark:bg-slate-900">
          <ContentContainer>
            <SkeletonGrid count={3} columns={{ sm: 1, md: 2, lg: 3 }} />
          </ContentContainer>
        </div>
      }>
        <ActiveGroupsSection />
      </Suspense>

      <Suspense fallback={
        <div className="py-20 bg-white dark:bg-slate-800">
          <ContentContainer>
            <SkeletonGrid count={3} columns={{ sm: 1, md: 2, lg: 3 }} />
          </ContentContainer>
        </div>
      }>
        <NewCompaniesSection />
      </Suspense>

      <Suspense fallback={
        <div className="py-20 bg-slate-50 dark:bg-slate-900">
          <ContentContainer>
            <SkeletonGrid count={3} columns={{ sm: 1, md: 2, lg: 3 }} />
          </ContentContainer>
        </div>
      }>
        <NewMembersSection />
      </Suspense>

      {/* Stats Section - Use cached stats */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{stats.members}+</div>
                <div className="text-white/80">Active Members</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{stats.companies}+</div>
                <div className="text-white/80">Tech Companies</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{stats.events}+</div>
                <div className="text-white/80">Events</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{stats.groups}+</div>
                <div className="text-white/80">Active Groups</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <ImageSection
        title="Ready to Join?"
        description="Become part of the Kootenay's fastest growing tech community"
        background={{
          src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=2400&h=800&fit=crop",
          alt: "Join us background"
        }}
        overlay={{
          gradient: {
            colors: ['from-slate-900/90', 'to-slate-900/60'],
            direction: 'to-top'
          }
        }}
        theme="dark"
        padding="xl"
        align="center"
      >
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <a
            href="/directory"
            className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Get Started Today
          </a>
          <a
            href="/about"
            className="px-8 py-4 bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300"
          >
            Learn More
          </a>
        </div>
      </ImageSection>
    </>
  );
}