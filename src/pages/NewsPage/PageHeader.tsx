import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Community News"
      subtitle="Stay up-to-date with the latest articles, insights, and developments in our tech community."
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.news}
    />
  );
};

export default PageHeader;
