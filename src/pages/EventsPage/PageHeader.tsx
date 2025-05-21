import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Events"
      subtitle="Discover workshops, meetups, and conferences in the Kootenay tech community"
      isHero={true}
      className="bg-gradient-to-r from-yellow-500 to-amber-500"
    />
  );
};

export default PageHeader;
