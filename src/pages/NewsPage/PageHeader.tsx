import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Community News"
      subtitle="Stay up-to-date with the latest articles, insights, and developments in our community."
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.news}
    />
  );
};

export default PageHeader;
