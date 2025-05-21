import React from 'react';
import { PageHeader as SharedPageHeader } from '../../components/ui/PageLayout';

const PageHeader: React.FC = () => {
  return (
    <SharedPageHeader
      title="Tech Marketplace"
      subtitle="Buy, sell, and exchange tech services, products, and equipment"
      isHero={true}
      className="bg-gradient-to-r from-green-500 to-emerald-500"
    />
  );
};

export default PageHeader;
