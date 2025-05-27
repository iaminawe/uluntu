// Type aliases for easier use
// All Supabase-specific table row type aliases have been moved to their respective adapter files (e.g., companyAdapter.ts, eventAdapter.ts, resourceAdapter.ts, marketplaceAdapters.ts)
// type Member = Tables['members']['Row']; // Moved to memberAdapter.ts
// type Company = Tables['companies']['Row']; // Moved to companyAdapter.ts
// type Event = Tables['events']['Row']; // Moved to eventAdapter.ts
// type Resource = Tables['resources']['Row']; // Moved to resourceAdapter.ts
// type MarketplaceItem = Tables['marketplace_listings']['Row']; // Moved to marketplaceAdapters.ts
// type Opportunity = Tables['opportunities']['Row']; // Moved to opportunityAdapter.ts

// Company adapters moved to companyAdapter.ts

// Event adapters moved to eventAdapter.ts

// Resource adapters moved to resourceAdapter.ts

// Marketplace item adapters moved to marketplaceAdapters.ts

// Opportunity adapters removed - now consolidated in opportunityAdapter.ts

// News Article adapters moved to newsAdapter.ts

// Utility function to adapt arrays
export function adaptListFromSupabase<T, U>(
  items: T[],
  adapter: (item: T) => U
): U[] {
  return items.map(adapter);
}
