import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Events"
      subtitle="Discover workshops, meetups, and conferences in the Kootenay tech community"
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.events}
    />
  );
};

export default PageHeader;
