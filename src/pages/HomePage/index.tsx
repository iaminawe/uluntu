import React, { useMemo, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Calendar, 
  Users, 
  Briefcase, 
  Building
} from 'lucide-react';
import { useHomePageData } from '@/hooks/useHomePageData';
import { useEnabledFeatures } from '@/hooks/useSettings';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';

// Import visual components
import { 
  DynamicHero, 
  ImageCard, 
  GlassCard, 
  FeatureCard,
  ImageSection,
  ImageGallery,
  DetailedCard
} from '@/shared/components/visual';

// Lazy load heavy sections to improve initial load
const DataSections = lazy(() => import('./DataSections'));

export default function HomePage() {
  // Use optimized home page data hook
  const { stats, isLoading, error } = useHomePageData();
  const { isFeatureEnabled } = useEnabledFeatures();


  // Hero images configuration
  const heroImages = useMemo(() => [
    {
      src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=2400&h=1600&fit=crop",
      alt: "Community members working together"
    },
    {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2400&h=1600&fit=crop",
      alt: "People collaborating around a table"
    },
    {
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=2400&h=1600&fit=crop",
      alt: "Community meetup"
    }
  ], []);

  // Feature cards configuration with stats
  const features = useMemo(() => [
    {
      icon: Users,
      title: "Member Directory",
      description: `Connect with ${stats.members}+ members of the Uluntu community`,
      link: "/directory",
      feature: "members_directory" as const,
      color: "blue" as const
    },
    {
      icon: Calendar,
      title: "Events",
      description: `Join ${stats.events}+ workshops, meetups, and conferences happening locally`,
      link: "/events",
      feature: "events_system" as const,
      color: "orange" as const
    },
    {
      icon: Briefcase,
      title: "Job Board",
      description: "Find jobs, volunteer roles, and other ways to get involved",
      link: "/opportunities",
      feature: "opportunities_board" as const,
      color: "emerald" as const
    },
    {
      icon: Building,
      title: "Companies",
      description: `Explore ${stats.companies}+ local businesses and organizations`,
      link: "/companies",
      feature: "companies_listing" as const,
      color: "purple" as const
    }
  ], [stats]);

  // Don't link to sections an admin has switched off
  const enabledFeatures = features.filter(({ feature }) => isFeatureEnabled(feature));



  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Uluntu Community - Connecting People Who Make Things Happen</title>
          <meta name="description" content="Join the Uluntu community. Connect with members, discover events, join groups, and share what you know." />
        </Helmet>
        
        <DynamicHero
          title="Uluntu Community"
          subtitle="I am because we are"
          description="A place for members to connect, share, and build community together"
          images={heroImages}
          height="large"
          actions={[
            { label: "Join the Community", href: "/directory", variant: "primary" },
            { label: "Explore Events", href: "/events", variant: "secondary" },
            { label: "✨ AI Editor Demo", href: "/ai-editor", variant: "secondary" }
          ]}
        />
        
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <ContentContainer>
            <SkeletonGrid count={4} columns={{ sm: 1, md: 2, lg: 4 }} />
          </ContentContainer>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Uluntu Community - Connecting People Who Make Things Happen</title>
          <meta name="description" content="Join the Uluntu community. Connect with members, discover events, join groups, and share what you know." />
        </Helmet>
        
        <DynamicHero
          title="Uluntu Community"
          subtitle="I am because we are"
          description="A place for members to connect, share, and build community together"
          images={heroImages}
          height="large"
          actions={[
            { label: "Join the Community", href: "/directory", variant: "primary" },
            { label: "Explore Events", href: "/events", variant: "secondary" },
            { label: "✨ AI Editor Demo", href: "/ai-editor", variant: "secondary" }
          ]}
        />
        
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <ContentContainer>
            <QueryError 
              error={error} 
              retry={() => {
                // Data will automatically refetch with React Query
                window.location.reload();
              }} 
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
        <title>Uluntu Community - Connecting People Who Make Things Happen</title>
        <meta name="description" content="Join the Uluntu community. Connect with members, discover events, join groups, and share what you know." />
      </Helmet>

      {/* Dynamic Hero Section */}
      <DynamicHero
        title="Uluntu Community"
        subtitle="I am because we are"
        description="A place for members to connect, share, and build community together"
        images={heroImages}
        height="large"
        actions={[
          { label: "Join the Community", href: "/directory", variant: "primary" },
          { label: "Explore Events", href: "/events", variant: "secondary" }
        ]}
      />


      {/* Feature Cards Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Your gateway to the Uluntu community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enabledFeatures.map(({ feature: _feature, ...card }, index) => (
              <FeatureCard
                key={index}
                {...card}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lazy load data-heavy sections after initial render */}
      <Suspense fallback={
        <div className="py-20 bg-slate-50 dark:bg-slate-900">
          <ContentContainer>
            <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
          </ContentContainer>
        </div>
      }>
        <DataSections />
      </Suspense>


      {/* Stats Section with Glass Cards */}
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
                <div className="text-white/80">Organizations</div>
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
        description="Become part of the Uluntu community"
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