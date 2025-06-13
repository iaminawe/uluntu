import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Resources"
      subtitle="Helpful tools, guides, and learning materials for the tech community"
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.resources}
    />
  );
};

export default PageHeader;
