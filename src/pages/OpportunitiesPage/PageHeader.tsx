import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Opportunities"
      subtitle="Discover jobs, projects, and volunteer positions in the Kootenay tech community"
      isHero={true}
      className="bg-gradient-to-r from-blue-500 to-cyan-500"
    />
  );
};

export default PageHeader;
