import { useState } from 'react';
import { Search } from 'lucide-react';
import { Resource, ResourceType, SAMPLE_RESOURCES } from './types';
import { getTypeIcon } from './utils';
import ResourceCard from './ResourceCard';
import ResourceModal from './ResourceModal';

const ResourcesList = () => {
  const [resources, setResources] = useState<Resource[]>(SAMPLE_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Resources</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
        >
          Add Resource
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>

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
