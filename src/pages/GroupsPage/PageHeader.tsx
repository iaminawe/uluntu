import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Community Groups"
      subtitle="Connect with like-minded tech professionals in your area of interest"
      isHero={true}
      className="bg-gradient-to-r from-teal-500 to-emerald-500"
    />
  );
};

export default PageHeader;
