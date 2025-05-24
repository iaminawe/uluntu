import { useQuery } from '@tanstack/react-query';
import { addMonths } from 'date-fns';
import mockData, { MarketplaceItem } from '../data/mock/mockData';

// Extract data from mockData object
const { members, companies, events, groups, marketplaceItems, resources, newsArticles } = mockData;



// Helper function to simulate API calls with delay
const simulateApiCall = async <T>(data: T): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return data;
};

// Mock api functions to simulate backend calls
const fetchMembers = async () => {
  return simulateApiCall(members);
};

const fetchMemberById = async (id: number) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const member = members.find(m => m.id === id);
  if (!member) throw new Error('Member not found');
  return member;
};

const fetchCompanies = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return companies;
};

const fetchCompanyById = async (id: number) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const company = companies.find(c => c.id === id);
  if (!company) throw new Error('Company not found');
  return company;
};

const fetchEvents = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log('fetchEvents - Raw events data from mockData:', events);
  console.log('fetchEvents - Number of events in mock data:', events.length);
  
  // Log the status values that exist in the events array
  const statusValues = [...new Set(events.map(event => event.status))];
  console.log('fetchEvents - Status values in events:', statusValues);
  
  // Return all events regardless of status for debugging
  return events;
};

const fetchEventById = async (id: number) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const event = events.find(e => e.id === id);
  if (!event) throw new Error('Event not found');
  return event;
};

const fetchGroups = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return groups;
};

const fetchGroupById = async (id: number) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const group = groups.find(g => g.id === id);
  if (!group) throw new Error('Group not found');
  return group;
};

// React Query hooks

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers
  });
}

export function useMembersWithFilters(filters?: { search?: string; skills?: string[] }) {
  return useQuery({
    queryKey: ['members', 'filters', filters],
    queryFn: async () => {
      let filteredMembers = [...members];
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredMembers = filteredMembers.filter(member => 
          member.name.toLowerCase().includes(searchTerm) || 
          (member.title && member.title.toLowerCase().includes(searchTerm)) || 
          (member.company && member.company.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters?.skills && filters.skills.length > 0) {
        filteredMembers = filteredMembers.filter(member => 
          member.skills?.some(skill => filters.skills?.includes(skill))
        );
      }
      
      return simulateApiCall(filteredMembers);
    }
  });
}

export function useMember(id: number) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => fetchMemberById(id),
    enabled: !!id
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  });
}

export function useCompaniesWithFilters(filters?: { search?: string; industries?: string[] }) {
  return useQuery({
    queryKey: ['companies', 'filters', filters],
    queryFn: async () => {
      let filteredCompanies = [...companies];
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredCompanies = filteredCompanies.filter(company => 
          company.name.toLowerCase().includes(searchTerm) || 
          company.description.toLowerCase().includes(searchTerm) || 
          company.location.toLowerCase().includes(searchTerm) ||
          company.industry.some(ind => ind.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters?.industries && filters.industries.length > 0) {
        filteredCompanies = filteredCompanies.filter(company => 
          company.industry.some(ind => filters.industries?.some(filterInd => 
            ind.toLowerCase().includes(filterInd.toLowerCase())
          ))
        );
      }
      
      return simulateApiCall(filteredCompanies);
    }
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => fetchCompanyById(id),
    enabled: !!id
  });
}

export function useCompanyEmployees(companyId: number | undefined) {
  return useQuery({
    queryKey: ['companies', companyId, 'employees'],
    queryFn: async () => {
      if (!companyId) return [];
      
      const company = companies.find(c => c.id === companyId);
      if (!company || !company.employees || company.employees.length === 0) return [];
      
      // Get the employee details from the members array
      const employees = company.employees.map(employeeId => 
        members.find(member => member.id === employeeId)
      ).filter(Boolean); // Remove any undefined values
      
      return simulateApiCall(employees as typeof members);
    },
    enabled: !!companyId
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents
  });
}

export function useEventsWithFilters(filters?: { 
  search?: string; 
  types?: ('in-person' | 'online' | 'hybrid')[]; 
  dateRange?: 'upcoming' | 'month' | 'three-months' | 'all';
}) {
  return useQuery({
    queryKey: ['events', 'filters', filters],
    queryFn: async () => {
      let filteredEvents = [...events];
      
      // Filter by search term
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm) || 
          event.description.toLowerCase().includes(searchTerm) ||
          (event.location && event.location.toLowerCase().includes(searchTerm))
        );
      }
      
      // Filter by event types
      if (filters?.types && filters.types.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          filters.types?.includes(event.type)
        );
      }
      
      // Filter by date range
      if (filters?.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          
          switch (filters.dateRange) {
            case 'upcoming':
              return eventDate >= now;
            case 'month':
              const oneMonthLater = addMonths(now, 1);
              return eventDate >= now && eventDate <= oneMonthLater;
            case 'three-months':
              const threeMonthsLater = addMonths(now, 3);
              return eventDate >= now && eventDate <= threeMonthsLater;
            default:
              return true;
          }
        });
      }
      
      // Sort by date (closest first)
      filteredEvents.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      return simulateApiCall(filteredEvents);
    }
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEventById(id),
    enabled: id > 0 // Only fetch if ID is a positive number
  });
}

export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => simulateApiCall(newsArticles)
  });
}

export function useNewsArticlesWithFilters(filters?: { search?: string; tags?: string[] }) {
  return useQuery({
    queryKey: ['newsArticles', 'filters', filters],
    queryFn: async () => {
      let filteredArticles = [...newsArticles];
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredArticles = filteredArticles.filter(article => 
          article.title.toLowerCase().includes(searchTerm) || 
          article.excerpt.toLowerCase().includes(searchTerm) || 
          article.content.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        filteredArticles = filteredArticles.filter(article => 
          article.tags?.some(tag => filters.tags?.includes(tag))
        );
      }
      
      return simulateApiCall(filteredArticles);
    }
  });
}

export function useNewsArticle(id: number | undefined) {
  return useQuery({
    queryKey: ['newsArticle', id],
    queryFn: () => id ? fetchNewsArticleById(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useRelatedNewsArticles(articleId: number | undefined) {
  return useQuery({
    queryKey: ['newsArticles', 'related', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      
      const currentArticle = newsArticles.find(a => a.id === articleId);
      if (!currentArticle) return [];
      
      // Find articles with matching tags, excluding the current article
      const relatedArticles = newsArticles
        .filter(article => 
          article.id !== articleId && 
          article.tags?.some(tag => currentArticle.tags?.includes(tag))
        )
        .slice(0, 2); // Limit to 2 related articles
      
      return simulateApiCall(relatedArticles);
    },
    enabled: !!articleId
  });
}

const fetchNewsArticleById = async (id: number) => {
  const article = newsArticles.find(a => a.id === id);
  if (!article) throw new Error('News article not found');
  return simulateApiCall(article);
};

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups
  });
}

export function useGroupsWithFilters(filters?: { search?: string; visibility?: ('open' | 'closed' | 'secret')[] }) {
  return useQuery({
    queryKey: ['groups', 'filters', filters],
    queryFn: async () => {
      let filteredGroups = [...groups];
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredGroups = filteredGroups.filter(group => 
          group.name.toLowerCase().includes(searchTerm) || 
          group.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters?.visibility && filters.visibility.length > 0) {
        filteredGroups = filteredGroups.filter(group => 
          filters.visibility?.includes(group.visibility)
        );
      }
      
      return simulateApiCall(filteredGroups);
    }
  });
}

export function useGroup(id: number) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => fetchGroupById(id),
    enabled: !!id
  });
}

export function useGroupEvents(groupId: number | undefined) {
  return useQuery({
    queryKey: ['groups', groupId, 'events'],
    queryFn: async () => {
      if (!groupId) return [];
      
      const group = groups.find(g => g.id === groupId);
      if (!group) return [];
      
      // Ensure we're returning an array
      const events = Array.isArray(group.events) ? group.events : [];
      return simulateApiCall(events);
    },
    enabled: !!groupId
  });
}

export function useGroupMembers(groupId: number | undefined) {
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: async () => {
      if (!groupId) return [];
      
      const group = groups.find(g => g.id === groupId);
      if (!group) return [];
      
      // Ensure we're returning an array
      const members = Array.isArray(group.members) ? group.members : [];
      return simulateApiCall(members);
    },
    enabled: !!groupId
  });
}

export function useGroupResources(groupId: number | undefined) {
  return useQuery({
    queryKey: ['groups', groupId, 'resources'],
    queryFn: async () => {
      if (!groupId) return [];
      
      const group = groups.find(g => g.id === groupId);
      if (!group) return [];
      
      // Ensure we're returning an array
      const resources = Array.isArray(group.resources) ? group.resources : [];
      return simulateApiCall(resources);
    },
    enabled: !!groupId
  });
}

export function useGroupPosts(groupId: number | undefined) {
  return useQuery({
    queryKey: ['groups', groupId, 'posts'],
    queryFn: async () => {
      if (!groupId) return [];
      
      const group = groups.find(g => g.id === groupId);
      if (!group) return [];
      
      // Ensure we're returning an array
      const posts = Array.isArray(group.posts) ? group.posts : [];
      return simulateApiCall(posts);
    },
    enabled: !!groupId
  });
}

// Marketplace types and data fetching functions
export function fetchMarketplaceItems() {
  return simulateApiCall(marketplaceItems);
}

// Mapper function to convert MarketplaceItem to the expected Listing structure
function mapMarketplaceItemToListing(item: MarketplaceItem) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type as 'product' | 'service' | 'equipment',
    price: item.price || 0, // Default to 0 if price is undefined
    images: item.image ? [item.image] : [], // Convert single image to array
    createdAt: item.datePosted,
    seller: item.seller,
    location: 'Kootenay Region, BC', // Default location
    tags: ['technology', 'services'], // Default tags
    condition: 'good' as 'new' | 'like-new' | 'good' | 'fair' | 'poor', // Default condition
  };
}

export function fetchMarketplaceItemById(id: number) {
  const item = marketplaceItems.find((item: MarketplaceItem) => item.id === id);
  if (!item) throw new Error('Marketplace item not found');
  return simulateApiCall(mapMarketplaceItemToListing(item));
}

export function useMarketplaceItems() {
  return useQuery({
    queryKey: ['marketplaceItems'],
    queryFn: () => fetchMarketplaceItems()
  });
}

// Unified implementation of filtered marketplace items
export function useMarketplaceItemsWithFilters(options?: {
  search?: string;
  type?: string;
  condition?: string;
  priceRange?: string;
  tags?: string[];
  sellerId?: number;
  types?: ('product' | 'service' | 'equipment' | 'event')[];
  categories?: string[];
}) {
  return useQuery({
    queryKey: ['marketplaceItems', 'filtered', options],
    queryFn: async () => {
      const items = await fetchMarketplaceItems();
      
      // Filter items based on options
      let filtered = [...items];
      
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(searchLower) || 
          item.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (options?.type && options.type !== 'all') {
        filtered = filtered.filter(item => item.type === options.type);
      }
      
      if (options?.types && options.types.length > 0) {
        filtered = filtered.filter(item => options.types?.includes(item.type));
      }
      
      if (options?.categories && options.categories.length > 0) {
        filtered = filtered.filter(item => options.categories?.includes(item.category));
      }
      
      if (options?.sellerId) {
        filtered = filtered.filter(item => item.seller.id === options.sellerId);
      }
      
      // Map to the Listing structure expected by components
      return filtered.map(mapMarketplaceItemToListing);
    }
  });
}

export function useMarketplaceItem(id: number | undefined) {
  return useQuery({
    queryKey: ['marketplaceItems', id],
    queryFn: () => id ? fetchMarketplaceItemById(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useRelatedMarketplaceItems(itemId: number | undefined) {
  return useQuery({
    queryKey: ['marketplaceItems', 'related', itemId],
    queryFn: async () => {
      if (!itemId) return [];
      
      const currentItem = marketplaceItems.find((i: MarketplaceItem) => i.id === itemId);
      if (!currentItem) return [];
      
      // Find items of the same type or category, excluding the current item
      const relatedItems = marketplaceItems
        .filter((item: MarketplaceItem) => 
          item.id !== itemId && 
          (item.type === currentItem.type || item.category === currentItem.category)
        )
        .slice(0, 3) // Limit to 3 related items
        .map(mapMarketplaceItemToListing); // Map each item to the correct structure
      
      return simulateApiCall(relatedItems);
    },
    enabled: !!itemId
  });
}

// Resources hooks
const fetchResources = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log('fetchResources - Raw resources data from mockData:', resources);
  console.log('fetchResources - Number of resources in mock data:', resources.length);
  return resources;
};

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources
  });
}

// Opportunities hooks
const fetchOpportunities = async () => {
  try {
    console.log('fetchOpportunities - Starting to fetch opportunities');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Import opportunities directly to ensure we get the latest data
    console.log('fetchOpportunities - About to import mockData');
    const mockDataModule = await import('../data/mock/mockData');
    console.log('fetchOpportunities - mockData imported successfully');
    console.log('Available exports from mockData:', Object.keys(mockDataModule));
    
    if (!mockDataModule.opportunities || !Array.isArray(mockDataModule.opportunities)) {
      console.error('Opportunities data is missing or not an array:', mockDataModule.opportunities);
      // Fallback to hardcoded opportunities if the import fails
      return [
        {
          id: 1,
          title: 'Emergency Fallback: Senior Developer',
          company: {
            id: 1,
            name: 'Fallback Tech Solutions',
            logo: 'https://images.pexels.com/photos/3183172/pexels-photo-3183172.jpeg'
          },
          type: 'full-time' as 'full-time',
          location: 'Nelson, BC',
          remote: true,
          description: 'This is a fallback opportunity because the mock data failed to load.',
          postedDate: '2025-04-15',
          status: 'published',
          featured: true
        }
      ];
    }
    
    console.log('fetchOpportunities - Raw opportunities data from mockData:', mockDataModule.opportunities);
    console.log('fetchOpportunities - Number of opportunities in mock data:', mockDataModule.opportunities.length);
    return mockDataModule.opportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    // Return fallback data in case of error
    return [
      {
        id: 1,
        title: 'Error Fallback: Senior Developer',
        company: {
          id: 1,
          name: 'Error Recovery Solutions',
          logo: 'https://images.pexels.com/photos/3183172/pexels-photo-3183172.jpeg'
        },
        type: 'full-time' as 'full-time',
        location: 'Nelson, BC',
        remote: true,
        description: 'This is a fallback opportunity because there was an error loading the mock data.',
        postedDate: '2025-04-15',
        status: 'published',
        featured: true
      }
    ];
  }
};

export function useOpportunities() {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: fetchOpportunities
  });
}

// Mock Delete Hooks
export function useDeleteCompany() {
  return {
    mutateAsync: async (id: string): Promise<boolean> => {
      console.log(`Mock: Deleting Company with id ${id}. This is a mock, no real data changed.`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return true; // Simulate successful deletion
    },
    status: 'idle' as const,
    data: undefined as boolean | undefined,
    error: null as Error | null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
  };
}

export function useDeleteEvent() {
  return {
    mutateAsync: async (id: string): Promise<boolean> => {
      console.log(`Mock: Deleting Event with id ${id}. This is a mock, no real data changed.`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    },
    status: 'idle' as const,
    data: undefined as boolean | undefined,
    error: null as Error | null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
  };
}

export function useDeleteGroup() {
  return {
    mutateAsync: async (id: string): Promise<boolean> => {
      console.log(`Mock: Deleting Group with id ${id}. This is a mock, no real data changed.`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    },
    status: 'idle' as const,
    data: undefined as boolean | undefined,
    error: null as Error | null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
  };
}

export function useDeleteResource() {
  return {
    mutateAsync: async (id: string): Promise<boolean> => {
      console.log(`Mock: Deleting Resource with id ${id}. This is a mock, no real data changed.`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    },
    status: 'idle' as const,
    data: undefined as boolean | undefined,
    error: null as Error | null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
  };
}

export function useDeleteMarketplaceItem() {
  return {
    mutateAsync: async (id: string): Promise<boolean> => {
      console.log(`Mock: Deleting MarketplaceItem with id ${id}. This is a mock, no real data changed.`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    },
    status: 'idle' as const,
    data: undefined as boolean | undefined,
    error: null as Error | null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
  };
}

export function useDeleteOpportunity() {
  return {
    mutateAsync: async (id: string): Promise<boolean> => {
      console.log(`Mock: Deleting Opportunity with id ${id}. This is a mock, no real data changed.`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    },
    status: 'idle' as const,
    data: undefined as boolean | undefined,
    error: null as Error | null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
  };
}
