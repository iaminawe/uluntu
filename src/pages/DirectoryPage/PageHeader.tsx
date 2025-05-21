import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Community Directory"
      subtitle="Connect with tech professionals in the Kootenay region"
      isHero={true}
      className="bg-gradient-to-r from-blue-500 to-teal-500"
    />
  );
};

export default PageHeader;
