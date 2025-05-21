import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Community News"
      subtitle="Stay up-to-date with the latest articles, insights, and developments in our tech community."
      isHero={true}
      className="bg-gradient-to-r from-orange-500 to-red-500"
    />
  );
};

export default PageHeader;
