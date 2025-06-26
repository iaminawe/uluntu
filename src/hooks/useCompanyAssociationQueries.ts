import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Event, Resource } from '../types';
import { Photo, Gallery } from '@/features/gallery/types';
import { eventsApi } from '@/features/events/api/eventsApi';
import { resourcesApi } from '@/features/resources/api/resourcesApi';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { IS_SUPABASE_ENABLED } from '@/config/env';
import { logger } from '@/utils/logger';
import { useCompanyEmployees } from './useCompanyQueries';

const USE_SUPABASE = IS_SUPABASE_ENABLED;

/**
 * Hook to fetch events associated with a company (hosted or sponsored)
 * @param companyId - The ID of the company
 * @returns Events associated with the company
 */
export function useCompanyEvents(companyId?: string): UseQueryResult<Event[], Error> {
  return useQuery<Event[], Error>({
    queryKey: ['company', companyId, 'events', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<Event[]> => {
      if (!companyId) {
        return [];
      }

      try {
        if (USE_SUPABASE) {
          // For now, we'll fetch all events and filter by company
          // In the future, we should add a company filter to the events API
          const allEvents = await eventsApi.getAll();
          
          // Filter events where the company is the organizer or sponsor
          const companyEvents = allEvents.filter(event => {
            // Check if event has company association
            // This logic will depend on how company associations are stored in events
            // For now, we'll use a placeholder check
            return (event as any).organizer_id === companyId || 
                   (event as any).sponsor_ids?.includes(companyId);
          });
          
          logger.debug('Company events fetched', 'COMPANY_ASSOCIATIONS', { 
            companyId, 
            eventsCount: companyEvents.length 
          });
          
          return companyEvents as Event[];
        } else {
          // Mock implementation
          const mockEvents: Event[] = [
            {
              id: `event-${companyId}-1`,
              title: 'Tech Innovation Summit',
              description: 'Annual technology conference hosted by the company',
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'Nelson Convention Center',
              type: 'in-person',
              status: 'published',
              organizer: {
                id: companyId,
                name: 'Tech Company',
                image: 'https://via.placeholder.com/150'
              },
              max_attendees: 200,
              current_attendees: 0,
              image: 'https://via.placeholder.com/400x200',
              created_at: new Date().toISOString(),
              featured: true
            },
            {
              id: `event-${companyId}-2`,
              title: 'Developer Workshop',
              description: 'Hands-on workshop for developers',
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'Online',
              type: 'online',
              status: 'published',
              organizer: {
                id: companyId,
                name: 'Tech Company',
                image: 'https://via.placeholder.com/150'
              },
              max_attendees: 50,
              current_attendees: 0,
              image: 'https://via.placeholder.com/400x200',
              created_at: new Date().toISOString()
            }
          ];
          
          return mockEvents;
        }
      } catch (error) {
        logger.apiError('useCompanyEvents', error);
        return [];
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch resources (articles, tools) associated with a company
 * @param companyId - The ID of the company
 * @returns Resources associated with the company
 */
export function useCompanyResources(companyId?: string): UseQueryResult<Resource[], Error> {
  return useQuery<Resource[], Error>({
    queryKey: ['company', companyId, 'resources', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<Resource[]> => {
      if (!companyId) {
        return [];
      }

      try {
        if (USE_SUPABASE) {
          // For now, we'll fetch all resources and filter by company
          // In the future, we should add a company filter to the resources API
          const allResources = await resourcesApi.getAll();
          
          // Filter resources where the company is the author or contributor
          const companyResources = allResources.filter(resource => {
            // Check if resource has company association
            // This logic will depend on how company associations are stored
            return (resource as any).author_company_id === companyId;
          });
          
          logger.debug('Company resources fetched', 'COMPANY_ASSOCIATIONS', { 
            companyId, 
            resourcesCount: companyResources.length 
          });
          
          return companyResources as Resource[];
        } else {
          // Mock implementation
          const mockResources: Resource[] = [
            {
              id: `resource-${companyId}-1`,
              title: 'Best Practices in Software Development',
              description: 'A comprehensive guide to modern software development practices',
              type: 'article',
              url: 'https://example.com/article1',
              tags: ['software', 'development', 'best-practices'],
              status: 'published',
              featured: true,
              created_at: new Date().toISOString(),
              dateAdded: new Date().toISOString(),
              contributor: {
                id: companyId,
                name: 'Tech Company Team'
              }
            },
            {
              id: `resource-${companyId}-2`,
              title: 'Open Source Toolkit',
              description: 'Collection of open source tools developed by our team',
              type: 'tool',
              url: 'https://github.com/example/toolkit',
              tags: ['open-source', 'tools', 'development'],
              status: 'published',
              created_at: new Date().toISOString(),
              dateAdded: new Date().toISOString(),
              contributor: {
                id: companyId,
                name: 'Tech Company'
              }
            },
            {
              id: `resource-${companyId}-3`,
              title: 'Cloud Architecture Patterns',
              description: 'Learn about scalable cloud architecture patterns',
              type: 'article',
              url: 'https://example.com/cloud-patterns',
              tags: ['cloud', 'architecture', 'scalability'],
              status: 'published',
              created_at: new Date().toISOString(),
              dateAdded: new Date().toISOString(),
              contributor: {
                id: companyId,
                name: 'Tech Company Engineering'
              }
            }
          ];
          
          return mockResources;
        }
      } catch (error) {
        logger.apiError('useCompanyResources', error);
        return [];
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch galleries associated with a company
 * @param companyId - The ID of the company
 * @returns Galleries associated with the company
 */
export function useCompanyGalleries(companyId?: string): UseQueryResult<Gallery[], Error> {
  return useQuery<Gallery[], Error>({
    queryKey: ['company', companyId, 'galleries', USE_SUPABASE ? 'supabase' : 'mock'],
    queryFn: async (): Promise<Gallery[]> => {
      if (!companyId) {
        return [];
      }

      try {
        if (USE_SUPABASE) {
          // Fetch galleries owned by the company
          const response = await galleryApi.getAllGalleries({
            ownerType: 'company',
            ownerId: companyId
          });
          
          logger.debug('Company galleries fetched', 'COMPANY_ASSOCIATIONS', { 
            companyId, 
            galleriesCount: response.galleries.length 
          });
          
          return response.galleries;
        } else {
          // Mock implementation
          const mockGalleries: Gallery[] = [
            {
              id: `gallery-${companyId}-1`,
              user_id: companyId,
              owner_type: 'company',
              owner_id: companyId,
              title: 'Company Events 2024',
              description: 'Photos from our company events throughout the year',
              slug: 'company-events-2024',
              privacy_level: 'public',
              visibility: 'visible',
              sort_order: 0,
              photo_count: 12,
              view_count: 150,
              is_featured: true,
              tags: ['events', 'company', '2024'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              cover_photo_url: 'https://via.placeholder.com/600x400',
              photos: []
            },
            {
              id: `gallery-${companyId}-2`,
              user_id: companyId,
              owner_type: 'company',
              owner_id: companyId,
              title: 'Product Showcase',
              description: 'Our latest products and innovations',
              slug: 'product-showcase',
              privacy_level: 'public',
              visibility: 'visible',
              sort_order: 1,
              photo_count: 8,
              view_count: 200,
              is_featured: false,
              tags: ['products', 'innovation'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              cover_photo_url: 'https://via.placeholder.com/600x400',
              photos: []
            }
          ];
          
          return mockGalleries;
        }
      } catch (error) {
        logger.apiError('useCompanyGalleries', error);
        return [];
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Combined hook to fetch all company associations at once
 * @param companyId - The ID of the company
 * @returns All associations data with loading states
 */
export function useCompanyAssociations(companyId?: string) {
  const employeesQuery = useCompanyEmployees(companyId);
  const eventsQuery = useCompanyEvents(companyId);
  const resourcesQuery = useCompanyResources(companyId);
  const galleriesQuery = useCompanyGalleries(companyId);

  return {
    employees: {
      data: employeesQuery.data || [],
      isLoading: employeesQuery.isLoading,
      error: employeesQuery.error
    },
    events: {
      data: eventsQuery.data || [],
      isLoading: eventsQuery.isLoading,
      error: eventsQuery.error
    },
    resources: {
      data: resourcesQuery.data || [],
      isLoading: resourcesQuery.isLoading,
      error: resourcesQuery.error
    },
    galleries: {
      data: galleriesQuery.data || [],
      isLoading: galleriesQuery.isLoading,
      error: galleriesQuery.error
    },
    isLoading: employeesQuery.isLoading || eventsQuery.isLoading || 
               resourcesQuery.isLoading || galleriesQuery.isLoading,
    refetch: () => {
      employeesQuery.refetch();
      eventsQuery.refetch();
      resourcesQuery.refetch();
      galleriesQuery.refetch();
    }
  };
}