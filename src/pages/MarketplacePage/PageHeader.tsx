import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Marketplace"
      subtitle="Buy, sell, and exchange tech services, products, and equipment"
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.marketplace}
    />
  );
};

export default PageHeader;
