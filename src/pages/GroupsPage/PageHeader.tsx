import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <div className="groups-page-header">
      <SharedPageHeader
        title="Tech Community Groups"
        subtitle="Connect with like-minded tech professionals in your area of interest"
        isHero={true}
        backgroundImage={MOUNTAIN_BACKGROUNDS.groups}
      />
    </div>
  );
};

export default PageHeader;
