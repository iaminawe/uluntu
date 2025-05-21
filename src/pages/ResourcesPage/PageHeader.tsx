import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Resources"
      subtitle="Helpful tools, guides, and learning materials for the tech community"
      isHero={true}
      className="bg-gradient-to-r from-blue-500 to-indigo-500"
    />
  );
};

export default PageHeader;
