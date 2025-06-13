import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Companies"
      subtitle="Discover innovative companies and startups in the Kootenay region"
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.companies}
    />
  );
};

export default PageHeader;
