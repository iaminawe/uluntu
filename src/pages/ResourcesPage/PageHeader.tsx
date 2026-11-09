import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Resources"
      subtitle="Helpful tools, guides, and learning materials shared by the community"
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.resources}
    />
  );
};

export default PageHeader;
