import React from 'react';

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title }) => {
  return (
    <div className="flex items-center text-indigo-600">
      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
        {icon}
      </div>
      <span className="font-medium">{title}</span>
    </div>
  );
};

export default FeatureItem;
