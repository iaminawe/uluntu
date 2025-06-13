import React from 'react';
import FeatureItem from '@/shared/components/layout/AboutSection/FeatureItem';
import { FeatureItem as FeatureItemType } from '@/shared/components/layout/AboutSection/types';

interface AboutContentProps {
  features?: FeatureItemType[];
}

const AboutContent: React.FC<AboutContentProps> = ({ features = [] }) => {
  return (
    <div>
      <p className="text-lg text-slate-700 mb-6">
        The Kootenay AI Collective is a community-driven initiative bringing together 
        individuals passionate about artificial intelligence in the Kootenay region. 
        We believe in fostering an inclusive environment where knowledge sharing, 
        ethical discussions, and human-centric approaches to AI are prioritized.
      </p>
      <p className="text-lg text-slate-700 mb-6">
        Our monthly meetups feature presentations from local experts, open discussions, 
        and networking opportunities for professionals, enthusiasts, and the curious. 
        Whether you're an AI expert or just starting to explore this field, you're welcome to join us!
      </p>
      
      {features.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {features.map((feature, index) => (
            <FeatureItem 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AboutContent;
