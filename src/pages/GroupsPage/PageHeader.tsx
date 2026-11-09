import React from 'react';
import { PageHeader as SharedPageHeader } from '@/shared/components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <div className="groups-page-header">
      <SharedPageHeader
        title="Community Groups"
        subtitle="Connect with like-minded people around shared interests"
        isHero={true}
        backgroundImage={MOUNTAIN_BACKGROUNDS.groups}
      />
    </div>
  );
};

export default PageHeader;
