import React from 'react';

const PageHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tech Events</h1>
          <p className="text-xl text-white/90">
            Discover workshops, meetups, and conferences in the Kootenay tech community
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
