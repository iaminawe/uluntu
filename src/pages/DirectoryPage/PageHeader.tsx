import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Community Directory"
      subtitle="Connect with tech professionals in the Kootenay region"
      isHero={true}
      backgroundImage={MOUNTAIN_BACKGROUNDS.directory}
    />
  );
};

export default PageHeader;
