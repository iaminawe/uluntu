// Export all public APIs from the opportunities feature
export * from './components';
export * from './hooks';
export { opportunitiesApi, type OpportunityInput } from './api';
export { 
  opportunitiesUISlice,
  type OpportunityFilters as OpportunitiesFilters,
  updateFilters as updateOpportunityFilters,
  clearFilters as clearOpportunityFilters,
  setSelectedOpportunity,
  setViewMode as setOpportunityViewMode,
  setSortBy as setOpportunitySortBy,
  setSortOrder as setOpportunitySortOrder,
  setShowRemoteOnly as toggleOpportunityRemoteOnly,
  toggleOpportunityExpanded,
  selectOpportunityFilters as selectOpportunitiesFilters,
  selectSelectedOpportunityId,
  selectOpportunitiesViewMode,
  selectOpportunitiesSortBy,
  selectOpportunitiesSortOrder,
  selectShowRemoteOnly,
  selectExpandedOpportunities
} from './store';
export * from './types';
