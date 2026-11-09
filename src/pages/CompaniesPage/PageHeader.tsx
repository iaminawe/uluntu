import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Organizations"
      subtitle="Discover businesses and organizations in the Uluntu community"
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.companies}
    />
  );
};

export default PageHeader;
