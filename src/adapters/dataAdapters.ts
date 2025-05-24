import { Database } from '../types/supabase';

// Type aliases for easier use
type Tables = Database['public']['Tables'];
type Member = Tables['members']['Row'];
type Company = Tables['companies']['Row'];
type Event = Tables['events']['Row'];
type Group = Tables['groups']['Row'];
type Resource = Tables['resources']['Row'];
type MarketplaceItem = Tables['marketplace_listings']['Row'];
type Opportunity = Tables['opportunities']['Row'];

// Member adapters
export function adaptMemberFromSupabase(member: Member): any {
  return {
    id: member.id,
    name: member.name,
    title: member.title || '',
    intro: member.intro || '',
    bio: member.bio || '',
    location: member.location || '',
    image: member.image || '',
    website: member.website || '',
    employmentStatus: member.employment_status || '',
    openToVolunteering: member.open_to_volunteering || false,
    arrivedInNelson: member.arrived_in_nelson || '',
    status: member.status || 'published',
    featured: member.featured || false,
    createdAt: member.created_at || new Date().toISOString()
  };
}

export function adaptMemberToSupabase(member: any): Tables['members']['Insert'] {
  return {
    name: member.name,
    title: member.title,
    bio: member.bio,
    location: member.location,
    image: member.image,
    website: member.website,
    employment_status: member.employmentStatus,
    open_to_volunteering: member.openToVolunteering,
    arrived_in_nelson: member.arrivedInNelson,
    status: member.status,
    featured: member.featured
  };
}

// Company adapters
export function adaptCompanyFromSupabase(company: Company): any {
  return {
    id: company.id,
    name: company.name,
    description: company.description,
    logo: company.logo,
    coverImage: company.cover_image || '',
    industry: company.industry || [],
    size: company.size,
    founded: company.founded,
    location: company.location,
    website: company.website || '',
    status: company.status,
    featured: company.featured || false,
    createdAt: company.created_at || new Date().toISOString()
  };
}

export function adaptCompanyToSupabase(company: any): Tables['companies']['Insert'] {
  return {
    name: company.name,
    description: company.description,
    logo: company.logo,
    cover_image: company.coverImage,
    industry: company.industry,
    size: company.size,
    founded: company.founded,
    location: company.location,
    website: company.website,
    status: company.status,
    featured: company.featured
  };
}

// Event adapters
export function adaptEventFromSupabase(event: Event): any {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    endDate: event.end_date || '',
    location: event.location,
    address: event.address || '',
    image: event.image || '',
    type: event.type,
    url: event.url || '',
    maxAttendees: event.max_attendees || 0,
    currentAttendees: event.current_attendees || 0,
    organizerId: event.organizer_id,
    groupId: event.group_id || '',
    status: event.status,
    featured: event.featured || false,
    createdAt: event.created_at || new Date().toISOString()
  };
}

export function adaptEventToSupabase(event: any): Tables['events']['Insert'] {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    end_date: event.endDate,
    location: event.location,
    address: event.address,
    image: event.image,
    type: event.type,
    url: event.url,
    max_attendees: event.maxAttendees,
    current_attendees: event.currentAttendees,
    organizer_id: event.organizerId,
    group_id: event.groupId,
    status: event.status,
    featured: event.featured
  };
}

// Group adapters
export function adaptGroupFromSupabase(group: Group): any {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    longDescription: group.long_description || '',
    heroImage: group.hero_image || '',
    visibility: group.visibility,
    status: group.status,
    featured: group.featured || false,
    createdAt: group.created_at || new Date().toISOString()
  };
}

export function adaptGroupToSupabase(group: any): Tables['groups']['Insert'] {
  return {
    name: group.name,
    description: group.description,
    long_description: group.longDescription,
    hero_image: group.heroImage,
    visibility: group.visibility,
    status: group.status,
    featured: group.featured
  };
}

// Resource adapters
export function adaptResourceFromSupabase(resource: Resource): any {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    type: resource.type,
    url: resource.url,
    image: resource.image || '',
    status: resource.status,
    featured: resource.featured || false,
    contributorId: resource.contributor_id,
    groupId: resource.group_id || '',
    createdAt: resource.created_at || new Date().toISOString()
  };
}

export function adaptResourceToSupabase(resource: any): Tables['resources']['Insert'] {
  return {
    title: resource.title,
    description: resource.description,
    type: resource.type,
    url: resource.url,
    image: resource.image,
    status: resource.status,
    featured: resource.featured,
    contributor_id: resource.contributorId,
    group_id: resource.groupId
  };
}

// Marketplace item adapters
export function adaptMarketplaceItemFromSupabase(item: MarketplaceItem): any {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    price: item.price || 0,
    condition: item.condition || '',
    images: item.images || [],
    location: item.location,
    tags: item.tags || [],
    sellerId: item.seller_id,
    status: item.status,
    featured: item.featured || false,
    createdAt: item.created_at || new Date().toISOString()
  };
}

export function adaptMarketplaceItemToSupabase(item: any): Tables['marketplace_listings']['Insert'] {
  return {
    title: item.title,
    description: item.description,
    type: item.type,
    price: item.price,
    condition: item.condition,
    images: item.images,
    location: item.location,
    tags: item.tags,
    seller_id: item.sellerId,
    status: item.status,
    featured: item.featured
  };
}

// Opportunity adapters
export function adaptOpportunityFromSupabase(opportunity: Opportunity): any {
  return {
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description,
    type: opportunity.type,
    location: opportunity.location,
    remote: opportunity.remote,
    compensation: opportunity.compensation || '',
    deadline: opportunity.deadline || '',
    contactEmail: opportunity.contact_email || '',
    website: opportunity.website || '',
    image: opportunity.image || '',
    organization: opportunity.organization,
    postedBy: opportunity.posted_by,
    requirements: opportunity.requirements || [],
    responsibilities: opportunity.responsibilities || [],
    benefits: opportunity.benefits || [],
    status: opportunity.status,
    featured: opportunity.featured || false,
    createdAt: opportunity.created_at || new Date().toISOString()
  };
}

export function adaptOpportunityToSupabase(opportunity: any): Tables['opportunities']['Insert'] {
  return {
    title: opportunity.title,
    description: opportunity.description,
    type: opportunity.type,
    location: opportunity.location,
    remote: opportunity.remote,
    compensation: opportunity.compensation,
    deadline: opportunity.deadline,
    contact_email: opportunity.contactEmail,
    website: opportunity.website,
    image: opportunity.image,
    organization: opportunity.organization,
    posted_by: opportunity.postedBy,
    requirements: opportunity.requirements,
    responsibilities: opportunity.responsibilities,
    benefits: opportunity.benefits,
    status: opportunity.status,
    featured: opportunity.featured
  };
}

// Utility function to adapt arrays
export function adaptListFromSupabase<T, U>(
  items: T[],
  adapter: (item: T) => U
): U[] {
  return items.map(adapter);
}
