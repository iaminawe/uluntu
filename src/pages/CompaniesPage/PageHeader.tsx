import React from 'react';

const PageHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tech Companies</h1>
          <p className="text-xl text-white/90">
            Discover innovative companies and startups in the Kootenay region
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
