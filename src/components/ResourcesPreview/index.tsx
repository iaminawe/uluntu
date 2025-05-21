import React from 'react';
import { Link } from 'react-router-dom';
import { ResourcesPreviewProps } from './types';
import ResourceCard from './ResourceCard';
import { ArrowRight } from 'lucide-react';
import { Resource } from '../../data/mock/mockData';

// Sample resources data
const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    description: 'A comprehensive guide to modern web development practices and technologies.',
    type: 'guide',
    url: 'https://example.com/web-dev-guide',
    dateAdded: '2025-01-15',
    contributor: {
      id: 1,
      name: 'Sarah Johnson'
    }
  },
  {
    id: 2,
    title: 'Getting Started with React',
    description: 'Learn the fundamentals of React and component-based architecture.',
    type: 'article',
    url: 'https://example.com/react-fundamentals',
    dateAdded: '2025-02-20',
    contributor: {
      id: 2,
      name: 'Michael Chen'
    }
  },
  {
    id: 3,
    title: 'Accessible Web Design',
    description: 'Best practices for creating accessible web applications for all users.',
    type: 'video',
    url: 'https://example.com/accessibility-video',
    dateAdded: '2025-03-10',
    contributor: {
      id: 3,
      name: 'Emma Rodriguez'
    }
  }
];

const ResourcesPreview: React.FC<ResourcesPreviewProps> = ({
  title = "Resources",
  resources = SAMPLE_RESOURCES,
  maxResources = 3
}) => {
  // Limit the number of resources to display
  const displayedResources = resources.slice(0, maxResources);
  
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <Link 
            to="/resources" 
            className="flex items-center text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesPreview;
