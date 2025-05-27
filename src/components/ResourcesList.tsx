'use client';

import { useState } from 'react';
import { Search, FileText, Video, Image, Link as LinkIcon, Presentation, Plus, X } from 'lucide-react';

type ResourceType = 'document' | 'video' | 'image' | 'link' | 'presentation';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  createdAt: string;
  createdBy: {
    name: string;
    image: string;
  };
  group?: {
    id: number;
    name: string;
  };
  event?: {
    id: number;
    name: string;
  };
}

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 1,
    title: 'Introduction to AI Ethics',
    description: 'A comprehensive guide to ethical considerations in AI development.',
    type: 'document',
    url: '#',
    createdAt: '2024-03-01',
    createdBy: {
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    group: {
      id: 1,
      name: 'AI Enthusiasts Kootenay'
    }
  },
  {
    id: 2,
    title: 'Machine Learning Workshop Recording',
    description: 'Recording of our February workshop on practical ML applications.',
    type: 'video',
    url: '#',
    createdAt: '2024-02-15',
    createdBy: {
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    event: {
      id: 1,
      name: 'ML Workshop February 2024'
    }
  }
];

interface ResourceModalProps {
  onClose: () => void;
}

function ResourceModal({ onClose }: ResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as ResourceType,
    url: '',
    groupId: '',
    eventId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle resource submission
    console.log('Resource submitted:', formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Add Resource</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="link">Link</option>
                <option value="presentation">Presentation</option>
              </select>
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="groupId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Associated Group (optional)
              </label>
              <select
                id="groupId"
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">None</option>
                <option value="1">AI Enthusiasts Kootenay</option>
                <option value="2">Kootenay Tech Organizers</option>
              </select>
            </div>
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Associated Event (optional)
              </label>
              <select
                id="eventId"
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">None</option>
                <option value="1">ML Workshop February 2024</option>
                <option value="2">AI Ethics Workshop March 2024</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Add Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResourcesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const isLoggedIn = true; // This would come from your auth context

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'presentation':
        return <Presentation className="h-5 w-5" />;
    }
  };

  const types: ResourceType[] = ['document', 'video', 'image', 'link', 'presentation'];

  const filteredResources = SAMPLE_RESOURCES.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          {isLoggedIn && (
            <button
              onClick={() => setShowModal(true)}
              className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Resource
            </button>
          )}
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
          <div key={resource.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg mr-4">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      {resource.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">{resource.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <img
                  src={resource.createdBy.image}
                  alt={resource.createdBy.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Added by {resource.createdBy.name} on {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              </div>

              {(resource.group || resource.event) && (
                <div className="mb-4 space-y-2">
                  {resource.group && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      Group: {resource.group.name}
                    </div>
                  )}
                  {resource.event && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      Event: {resource.event.name}
                    </div>
                  )}
                </div>
              )}

              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
              >
                View Resource
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ResourceModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}