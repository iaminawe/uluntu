import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Opportunities"
      subtitle="Find your next role in the Kootenay tech ecosystem. From startups to established companies, discover positions that match your skills and passion."
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.opportunities}
    />
  );
};

export default PageHeader;
