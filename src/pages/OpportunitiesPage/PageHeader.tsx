import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Opportunities"
      subtitle="Find jobs, volunteer roles, and other ways to contribute to the Uluntu community."
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.opportunities}
    />
  );
};

export default PageHeader;
