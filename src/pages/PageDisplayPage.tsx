import React from 'react';
import { PageDetail } from '@/features/pages';

const PageDisplayPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageDetail showActions={false} />
    </div>
  );
};

export default PageDisplayPage;