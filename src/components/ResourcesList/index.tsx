import { useState } from 'react';
import { ResourceType, SAMPLE_RESOURCES } from './types';
import { getTypeIcon } from './utils';
import ResourceCard from './ResourceCard';
import ResourceModal from './ResourceModal';

const ResourcesList = () => {
  const resources = SAMPLE_RESOURCES;
  const searchQuery = '';
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);

  const types: ResourceType[] = ['document', 'video', 'image', 'link', 'presentation'];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Resource filters */}

      <div className="mb-6 space-y-4">

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${selectedType === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            All Types
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center
                ${selectedType === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              {getTypeIcon(type)}
              <span className="ml-2 capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {showModal && (
        <ResourceModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default ResourcesList;
