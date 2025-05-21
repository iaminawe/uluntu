import { useQuery } from '@tanstack/react-query';
import { addMonths } from 'date-fns';
import { members, companies, events, groups, EntityStatus } from '../data/mock/mockData';

// Import or define newsArticles data
const newsArticles = [
  {
    id: 1,
    title: 'Kootenay Tech Scene Continues to Grow',
    excerpt: 'The Kootenay region\'s technology sector is experiencing unprecedented growth, with new companies and startups choosing the area as their home base.',
    content: 'The Kootenay region\'s technology sector is experiencing unprecedented growth, with new companies and startups choosing the area as their home base.\n\nOver the past year, the number of tech companies in the region has increased by 25%, bringing new jobs and opportunities to local communities. This growth is attributed to the region\'s high quality of life, affordable housing compared to major tech hubs, and the increasing viability of remote work.\n\n"We\'re seeing a significant influx of tech professionals who want to enjoy the lifestyle benefits of the Kootenays while maintaining their careers in the tech industry," says Sarah Johnson, director of the Kootenay Tech Association. "The pandemic has accelerated this trend, as more companies embrace remote work policies."\n\nLocal initiatives like coding bootcamps, tech meetups, and startup incubators are also contributing to the ecosystem\'s development. The Nelson Innovation Centre has supported over 15 new startups in the past year alone.\n\nAs the sector continues to grow, community leaders are focusing on infrastructure improvements, including better internet connectivity in rural areas and co-working spaces to support the distributed workforce.',
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
    date: '2025-03-15',
    author: {
      id: 1,
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    tags: ['Community', 'Growth', 'Startups'],
    status: 'published' as EntityStatus,
    featured: true
  },
  {
    id: 2,
    title: 'Local AI Startup Secures Major Funding',
    excerpt: 'A Nelson-based artificial intelligence startup has secured $2.5 million in seed funding to develop innovative solutions for environmental monitoring.',
    content: 'A Nelson-based artificial intelligence startup has secured $2.5 million in seed funding to develop innovative solutions for environmental monitoring.\n\nEcoAI, founded by former Silicon Valley engineer Michael Chen, uses machine learning algorithms to analyze data from remote sensors, helping forestry companies and environmental agencies monitor ecosystem health and detect potential issues before they become critical.\n\n"This funding will allow us to expand our team and accelerate the development of our technology," says Chen. "We\'re particularly excited about deploying our solutions in the Kootenay region, which has such diverse and valuable ecosystems."\n\nThe funding round was led by Vancouver-based Emerald Tech Ventures, with participation from several angel investors who have backgrounds in both technology and environmental conservation.\n\n"What attracted us to EcoAI was their unique approach to combining cutting-edge AI with practical environmental applications," says Jennifer Wong, partner at Emerald Tech Ventures. "Their technology has the potential to revolutionize how we monitor and protect natural resources."\n\nThe company plans to hire 10 new employees over the next year, including data scientists, software engineers, and environmental specialists. They\'re also partnering with Selkirk College to provide internship opportunities for students in relevant programs.',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    date: '2025-03-10',
    author: {
      id: 2,
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    tags: ['AI', 'Funding', 'Environment'],
    status: 'published' as EntityStatus,
    featured: false
  },
  {
    id: 3,
    title: 'Tech Education Program Launches for Rural Youth',
    excerpt: 'A new initiative aims to bring coding and digital skills education to young people in the rural communities of the Kootenay region.',
    content: 'A new initiative aims to bring coding and digital skills education to young people in the rural communities of the Kootenay region.\n\nThe "Digital Futures" program, launched by the Kootenay Tech Association in partnership with local schools and libraries, will provide free coding workshops, equipment loans, and mentorship opportunities to students aged 12-18 in communities outside the major centers.\n\n"We want to ensure that young people throughout the Kootenays have access to the skills and knowledge they\'ll need for the future job market, regardless of where they live," explains program director Alex Rodriguez. "Many rural communities have limited access to tech education, and we\'re working to bridge that gap."\n\nThe program will feature a mobile tech lab that travels to different communities, offering workshops on coding, digital design, and robotics. Additionally, online resources and virtual mentorship will provide ongoing support between in-person sessions.\n\nFunding for the initiative comes from a combination of government grants, corporate sponsorships, and community donations. Local tech professionals are also volunteering their time to serve as instructors and mentors.\n\n"We\'ve been overwhelmed by the positive response from both students and parents," says Rodriguez. "There\'s clearly a strong demand for these opportunities in our rural communities."',
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg',
    date: '2025-03-05',
    author: {
      id: 3,
      name: 'Alex Rodriguez',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    },
    tags: ['Education', 'Youth', 'Rural'],
    status: 'published' as EntityStatus,
    featured: false
  }
];

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
    enabled: !!id
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
