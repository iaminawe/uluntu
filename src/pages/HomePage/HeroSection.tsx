import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageLayout';

const HeroSection: React.FC = () => {
  const actionButtons = (
    <div className="flex flex-wrap gap-4 mt-8">
      <Link
        to="/directory"
        className="px-6 py-3 bg-white text-orange-500 hover:bg-white/90 transition-colors rounded-lg font-medium"
      >
        View Directory
      </Link>
      <Link
        to="/events"
        className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors rounded-lg font-medium"
      >
        Upcoming Events
      </Link>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 py-24">
      <PageHeader
        title="Connecting Kootenay Tech Professionals"
        subtitle="Join our growing tech community to connect, collaborate, and grow together."
        isHero={true}
        className="text-white"
        actions={actionButtons}
      />
    </div>
  );
};

export default HeroSection;
