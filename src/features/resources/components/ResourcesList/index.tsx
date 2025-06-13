import { useState, useEffect } from 'react';
import { Resource } from '../../types';
import { getTypeIcon } from './utils';
import ResourceCard from './ResourceCard';
import ResourceModal from './ResourceModal';
import { useFilteredResourcesRedux } from '../../hooks/useResourcesRedux';
import { ResourceFilters } from '../../redux/slices/resourcesSlice';

interface ResourcesListProps {
  resources?: Resource[];
  useRedux?: boolean;
  initialFilters?: ResourceFilters;
}

const ResourcesList = ({ resources: propResources, useRedux = false, initialFilters }: ResourcesListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  
  // Connect to Redux if useRedux is true
  const {
    resources: reduxResources,
    updateFilters,
    getPaginatedResources,
    totalResources
  } = useFilteredResourcesRedux(initialFilters);
  
  // Determine which resources to use - props or redux
  const resources = useRedux ? reduxResources : propResources || [];
  // Use Resource['type'] for selectedType state and update available types
  const [selectedType, setSelectedType] = useState<Resource['type'] | 'all'>((initialFilters?.types?.[0] as Resource['type']) || 'all');
  const [showModal, setShowModal] = useState(false);

  // Define resource types based on the main application's Resource type
  const types: Resource['type'][] = ['document', 'video', 'guide', 'tool', 'article', 'link'];

  // Apply client-side filtering if not using Redux
  const filteredResources = useRedux ? resources : resources.filter(resource => {
    const matchesSearch = !searchQuery || 
                         resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Get pagination details
  const totalItems = useRedux ? totalResources : filteredResources.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get paginated resources (either from Redux hook or locally)
  const paginatedResources = useRedux 
    ? getPaginatedResources(currentPage, itemsPerPage) 
    : filteredResources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  // Update Redux filters when local state changes (if using Redux)
  useEffect(() => {
    if (useRedux) {
      const newFilters: ResourceFilters = {};
      
      if (searchQuery) {
        newFilters.search = searchQuery;
      }
      
      if (selectedType !== 'all') {
        newFilters.types = [selectedType];
      }
      
      updateFilters(newFilters);
    }
  }, [useRedux, searchQuery, selectedType]);

  return (
    <div>
      {/* Resource filters */}

      <div className="mb-6 space-y-4">
        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
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
              onClick={() => setSelectedType(type as Resource['type'])}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6"> {/* Adjusted grid for potentially 2 items per row with 10 items total for better layout consistency, can be tweaked further if needed */}
        {paginatedResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {showModal && (
        <ResourceModal onClose={() => setShowModal(false)} />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-700 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourcesList;
