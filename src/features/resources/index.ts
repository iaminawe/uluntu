// Export all public APIs from the resources feature
export * from './components';
export * from './hooks';
export { resourcesApi, type ResourceInput } from './api';
export { 
  resourcesUISlice,
  type ResourceFilters,
  updateFilters as updateResourceFilters,
  clearFilters as clearResourceFilters,
  setSelectedResource,
  setViewMode as setResourceViewMode,
  setSortBy as setResourceSortBy,
  setSortOrder as setResourceSortOrder,
  selectResourcesFilters,
  selectSelectedResourceId,
  selectResourcesViewMode,
  selectResourcesSortBy,
  selectResourcesSortOrder
} from './store';
export * from './types';
