import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  membersApi, 
  companiesApi, 
  eventsApi, 
  groupsApi, 
  resourcesApi, 
  marketplaceApi, 
  opportunitiesApi 
} from '../api/supabaseApi';

// Configuration to switch between mock and real data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// If not using Supabase, fall back to mock queries
import * as mockQueries from './useQueries';

// Members hooks
export function useMembers() {
  if (!USE_SUPABASE) return mockQueries.useMembers();
  
  return useQuery({
    queryKey: ['members'],
    queryFn: () => membersApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMembersWithFilters(filters?: { search?: string; skills?: string[] }) {
  if (!USE_SUPABASE) return mockQueries.useMembersWithFilters(filters);
  
  return useQuery({
    queryKey: ['members', 'filtered', filters],
    queryFn: () => membersApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMember(id: number | string) {
  if (!USE_SUPABASE) return mockQueries.useMember(typeof id === 'string' ? parseInt(id) : id);
  
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => membersApi.getById(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: membersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => membersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', id] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: membersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

// Companies hooks
export function useCompanies() {
  if (!USE_SUPABASE) return mockQueries.useCompanies();
  
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompaniesWithFilters(filters?: { search?: string; industries?: string[] }) {
  if (!USE_SUPABASE) return mockQueries.useCompaniesWithFilters(filters);
  
  return useQuery({
    queryKey: ['companies', 'filtered', filters],
    queryFn: () => companiesApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompany(id: number | string) {
  if (!USE_SUPABASE) return mockQueries.useCompany(typeof id === 'string' ? parseInt(id) : id);
  
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => companiesApi.getById(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: companiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => companiesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', id] });
    },
  });
}

// Events hooks
export function useEvents() {
  if (!USE_SUPABASE) return mockQueries.useEvents();
  
  return useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventsWithFilters(filters?: { 
  search?: string; 
  types?: ('in-person' | 'online' | 'hybrid')[]; 
  dateRange?: 'upcoming' | 'month' | 'three-months' | 'all';
}) {
  if (!USE_SUPABASE) return mockQueries.useEventsWithFilters(filters);
  
  return useQuery({
    queryKey: ['events', 'filtered', filters],
    queryFn: () => eventsApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEvent(id: number | string) {
  if (!USE_SUPABASE) return mockQueries.useEvent(typeof id === 'string' ? parseInt(id) : id);
  
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.getById(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eventsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}

// Groups hooks
export function useGroups() {
  if (!USE_SUPABASE) return mockQueries.useGroups();
  
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGroupsWithFilters(filters?: { search?: string; visibility?: ('open' | 'closed' | 'secret')[] }) {
  if (!USE_SUPABASE) return mockQueries.useGroupsWithFilters(filters);
  
  return useQuery({
    queryKey: ['groups', 'filtered', filters],
    queryFn: () => groupsApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGroup(id: number | string) {
  if (!USE_SUPABASE) return mockQueries.useGroup(typeof id === 'string' ? parseInt(id) : id);
  
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.getById(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => groupsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
    },
  });
}

// News hooks
export function useNewsArticlesWithFilters(filters?: { search?: string; tags?: string[] }) {
  return mockQueries.useNewsArticlesWithFilters(filters);
}

export function useNewsArticle(id: number | string) {
  return mockQueries.useNewsArticle(typeof id === 'string' ? parseInt(id) : id);
}

export function useRelatedNewsArticles(articleId: number | string, _limit: number = 3) {
  return mockQueries.useRelatedNewsArticles(typeof articleId === 'string' ? parseInt(articleId) : articleId);
}

export function useCreateNewsArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => Promise.resolve(data), // Mock implementation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useUpdateNewsArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data }: { id: string; data: any }) => Promise.resolve(data), // Mock implementation
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news', id] });
    },
  });
}

export function useDeleteNewsArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (_id: string) => Promise.resolve(), // Mock implementation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

// Resources hooks
export function useResources() {
  if (!USE_SUPABASE) return mockQueries.useResources();
  
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => resourcesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useResourcesWithFilters(_filters?: { search?: string; types?: string[]; categories?: string[] }) {
  return mockQueries.useResources(); // Use basic resources query since filtered version doesn't exist
}

export function useResource(_id: number | string) {
  return mockQueries.useResources(); // Use basic resources query since individual resource query doesn't exist
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resourcesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => resourcesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources', id] });
    },
  });
}

// Marketplace hooks
export function useMarketplaceItemsWithFilters(filters?: { 
  search?: string; 
  type?: string; 
  condition?: string; 
  priceRange?: string; 
  tags?: string[]; 
  sellerId?: number; 
  types?: ('event' | 'product' | 'service' | 'equipment')[]; 
  categories?: string[] 
}) {
  if (!USE_SUPABASE) return mockQueries.useMarketplaceItemsWithFilters(filters);
  
  return useQuery({
    queryKey: ['marketplaceItems', 'filtered', filters],
    queryFn: () => marketplaceApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketplaceItems() {
  if (!USE_SUPABASE) return mockQueries.useMarketplaceItems();
  
  return useQuery({
    queryKey: ['marketplace'],
    queryFn: () => marketplaceApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketplaceItem(id: number | string) {
  if (!USE_SUPABASE) return mockQueries.useMarketplaceItem(typeof id === 'string' ? parseInt(id) : id);
  
  return useQuery({
    queryKey: ['marketplace', id],
    queryFn: () => marketplaceApi.getById(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedMarketplaceItems(itemId: number | string, limit: number = 3) {
  if (!USE_SUPABASE) return mockQueries.useRelatedMarketplaceItems(typeof itemId === 'string' ? parseInt(itemId) : itemId);
  
  return useQuery({
    queryKey: ['marketplace', 'related', itemId, limit],
    queryFn: () => marketplaceApi.getRelated(String(itemId), limit),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMarketplaceItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: marketplaceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useUpdateMarketplaceItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketplaceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', id] });
    },
  });
}

// Opportunities hooks
export function useOpportunities() {
  if (!USE_SUPABASE) return mockQueries.useOpportunities();
  
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: () => opportunitiesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOpportunitiesWithFilters(_filters?: { search?: string; types?: string[]; locations?: string[]; remote?: boolean }) {
  return mockQueries.useOpportunities(); // Use basic opportunities query since filtered version doesn't exist
}

export function useOpportunity(_id: number | string) {
  return mockQueries.useOpportunities(); // Use basic opportunities query since individual opportunity query doesn't exist
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: opportunitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => opportunitiesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities', id] });
    },
  });
}

// Export all mock queries as fallback
export * from './useQueries';
