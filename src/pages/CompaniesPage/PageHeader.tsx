import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Companies"
      subtitle="Discover innovative companies and startups in the Kootenay region"
      isHero={true}
      className="bg-gradient-to-r from-purple-600 to-indigo-600"
    />
  );
};

export default PageHeader;
