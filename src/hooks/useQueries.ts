/**
 * @deprecated This file is being phased out in favor of specialized query files.
 * Please use the following files instead:
 * - useMemberQueries.ts for member-related queries
 * - useCompanyQueries.ts for company-related queries
 * - useEventQueries.ts for event-related queries
 * - useGroupQueries.ts for group-related queries
 * - useResourceQueries.ts for resource-related queries
 * - useMarketplaceQueries.ts for marketplace-related queries
 * - useNewsQueries.ts for news-related queries
 * - useOpportunityQueries.ts for opportunity-related queries
 */

import mockData from '../data/mock/mockData';

// Export mockData for backward compatibility
export { mockData };



/**
 * @deprecated This utility function is kept for backward compatibility.
 * Please use the specialized query files for data fetching.
 */
export const simulateApiCall = async <T>(data: T): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return data;
};

/**
 * @deprecated All query hooks have been moved to specialized files.
 * Please import from the appropriate specialized query file instead:
 * 
 * - Member queries: import from './useMemberQueries'
 * - Company queries: import from './useCompanyQueries'
 * - Event queries: import from './useEventQueries'
 * - Group queries: import from './useGroupQueries'
 * - Resource queries: import from './useResourceQueries'
 * - Marketplace queries: import from './useMarketplaceQueries'
 * - News queries: import from './useNewsQueries'
 * - Opportunity queries: import from './useOpportunityQueries'
 */

// Re-export specialized query hooks for backward compatibility
import { useMembers, useMembersWithFilters, useMemberById } from './useMemberQueries';
import { useCompanies, useCompaniesWithFilters, useCompany, useCompanyEmployees } from './useCompanyQueries';
import { useEvents, useEventsWithFilters, useEvent } from './useEventQueries';
import { useGroups, useGroupsWithFilters, useGroup, useGroupEvents, useGroupMembers } from './useGroupQueries';
import { useResources, useResourcesWithFilters, useResource } from './useResourceQueries';
import { useOpportunities, useOpportunity } from './useOpportunityQueries';

// Re-export for backward compatibility
export {
  useMembers, useMembersWithFilters, useMemberById as useMember,
  useCompanies, useCompaniesWithFilters, useCompany, useCompanyEmployees,
  useEvents, useEventsWithFilters, useEvent,
  useGroups, useGroupsWithFilters, useGroup, useGroupEvents, useGroupMembers,
  useResources, useResourcesWithFilters, useResource,
  useOpportunities, useOpportunity
};

// Import and re-export marketplace hooks from the dedicated file
import {
  useMarketplaceItemsWithFilters,
  useMarketplaceItems,
  useMarketplaceItem,
  useRelatedMarketplaceItems,
  useCreateMarketplaceItem,
  useUpdateMarketplaceItem,
  useDeleteMarketplaceItem,
} from './useMarketplaceQueries';

// Import and re-export news hooks from the dedicated file
import {
  useNewsArticlesWithFilters,
  useNewsArticle,
  useCreateNewsArticle,
  useUpdateNewsArticle,
  useDeleteNewsArticle,
} from './useNewsQueries';

// Re-export for backward compatibility
export {
  useMarketplaceItemsWithFilters,
  useMarketplaceItems,
  useMarketplaceItem,
  useRelatedMarketplaceItems,
  useCreateMarketplaceItem,
  useUpdateMarketplaceItem,
  useDeleteMarketplaceItem,
  useNewsArticlesWithFilters,
  useNewsArticle,
  useCreateNewsArticle,
  useUpdateNewsArticle,
  useDeleteNewsArticle,
};

/**
 * @deprecated These mock delete hooks have been moved to their respective specialized query files.
 * Please import them from the appropriate files instead.
 */

// Import and re-export delete hooks from specialized files
import { useDeleteCompany } from './useCompanyQueries';
import { useDeleteEvent } from './useEventQueries';
import { useDeleteGroup } from './useGroupQueries';
import { useDeleteResource } from './useResourceQueries';
import { useDeleteOpportunity } from './useOpportunityQueries';

// Re-export for backward compatibility
export {
  useDeleteCompany,
  useDeleteEvent,
  useDeleteGroup,
  useDeleteResource,
  useDeleteOpportunity
};
