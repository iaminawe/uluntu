import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Marketplace"
      subtitle="Buy, sell, and exchange services, products, and equipment with community members"
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.marketplace}
    />
  );
};

export default PageHeader;
