import React from 'react';

const PageHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 shadow-md">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tech Community News</h1>
          <p className="text-xl text-white/90">
            Stay up-to-date with the latest articles, insights, and developments in our tech community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
