// Mock data index - imports from individual entity files
import { companies } from './companies';
import { groups } from './groups';
import { members } from './members';
import { newsArticles } from './newsArticles';
import { opportunities } from './opportunities';
import { events } from './events';
import { resources } from './resources';
import { marketplaceListings } from './marketplaceListings';

// Re-export named exports
export { companies, type Company } from './companies';
export { groups, type Group, type GroupMember, type GroupEvent, type GroupResource, type GroupPost } from './groups';
export { members, type Member } from './members';
export { newsArticles, type NewsArticle } from './newsArticles';
export { opportunities, type Opportunity } from './opportunities';
export { events, type Event, type EventPresenter, type EventSession, type EventSessionResource } from './events';
export { resources, type Resource } from './resources';
export { marketplaceListings } from './marketplaceListings';

// Import types from centralized marketplace types
import { MarketplaceListing } from '../../types/marketplace';
export type { MarketplaceListing };

// Re-export common types from centralized location
export type {
  BaseEntity,
  ContentStatus,
  SocialLinks,
  Location,
  DateRange
} from '../../types/common';

// Default export object containing all mock data
const mockData = {
  members,
  companies,
  events,
  groups,
  newsArticles,
  opportunities,
  marketplaceListings,
  resources
};

export default mockData;
