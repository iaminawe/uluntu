/**
 * Unified content URL utilities for generating slug-based URLs
 * Provides consistent URL generation for all content types
 */

// Content type interfaces with slug support
interface SlugEntity {
  id: string;
  slug?: string | null;
}

interface NewsArticle extends SlugEntity {
  title?: string;
}

interface Event extends SlugEntity {
  title?: string;
}

interface Opportunity extends SlugEntity {
  title?: string;
}

interface Gallery extends SlugEntity {
  title?: string;
}

interface Group extends SlugEntity {
  name?: string;
}

interface MarketplaceListing extends SlugEntity {
  title?: string;
}

interface Company extends SlugEntity {
  name?: string;
}

interface Resource extends SlugEntity {
  title?: string;
}

interface Topic extends SlugEntity {
  name?: string;
}

/**
 * Get news article URL using slug if available, fallback to ID
 */
export function getNewsArticleUrl(article: SlugEntity): string {
  return article.slug ? `/news/${article.slug}` : `/news/${article.id}`;
}

/**
 * Get event URL using slug if available, fallback to ID
 */
export function getEventUrl(event: SlugEntity): string {
  return event.slug ? `/events/${event.slug}` : `/events/${event.id}`;
}

/**
 * Get opportunity URL using slug if available, fallback to ID
 */
export function getOpportunityUrl(opportunity: SlugEntity): string {
  return opportunity.slug ? `/opportunities/${opportunity.slug}` : `/opportunities/${opportunity.id}`;
}

/**
 * Get gallery URL using slug if available, fallback to ID
 */
export function getGalleryUrl(gallery: SlugEntity): string {
  return gallery.slug ? `/galleries/${gallery.slug}` : `/galleries/${gallery.id}`;
}

/**
 * Get group URL using slug if available, fallback to ID
 */
export function getGroupUrl(group: SlugEntity): string {
  return group.slug ? `/groups/${group.slug}` : `/groups/${group.id}`;
}

/**
 * Get marketplace listing URL using slug if available, fallback to ID
 */
export function getMarketplaceListingUrl(listing: SlugEntity): string {
  return listing.slug ? `/marketplace/${listing.slug}` : `/marketplace/${listing.id}`;
}

/**
 * Get company URL using slug if available, fallback to ID
 */
export function getCompanyUrl(company: SlugEntity): string {
  return company.slug ? `/companies/${company.slug}` : `/companies/${company.id}`;
}

/**
 * Get resource URL using slug if available, fallback to ID
 */
export function getResourceUrl(resource: SlugEntity): string {
  return resource.slug ? `/resources/${resource.slug}` : `/resources/${resource.id}`;
}

/**
 * Get topic URL using slug if available, fallback to ID
 */
export function getTopicUrl(topic: SlugEntity): string {
  return topic.slug ? `/topics/${topic.slug}` : `/topics/${topic.id}`;
}

/**
 * Get group post URL - uses group slug/id and post id
 */
export function getGroupPostUrl(group: SlugEntity, postId: string): string {
  const groupPath = group.slug ? `/groups/${group.slug}` : `/groups/${group.id}`;
  return `${groupPath}/posts/${postId}`;
}

/**
 * Generic content URL generator based on content type
 */
export function getContentUrl(contentType: string, item: SlugEntity): string {
  switch (contentType) {
    case 'news':
      return getNewsArticleUrl(item);
    case 'events':
      return getEventUrl(item);
    case 'opportunities':
      return getOpportunityUrl(item);
    case 'galleries':
      return getGalleryUrl(item);
    case 'groups':
      return getGroupUrl(item);
    case 'marketplace':
      return getMarketplaceListingUrl(item);
    case 'companies':
      return getCompanyUrl(item);
    case 'resources':
      return getResourceUrl(item);
    case 'topics':
      return getTopicUrl(item);
    case 'directory':
    case 'members':
      // Import member URL function to avoid circular dependency
      return item.slug ? `/directory/${item.slug}` : `/directory/${item.id}`;
    default:
      // Fallback to ID-based URL
      return `/${contentType}/${item.id}`;
  }
}

/**
 * Parse content identifier to determine if it's a slug or ID
 */
export function parseContentIdentifier(identifier: string): { type: 'id' | 'slug'; value: string } {
  // UUID regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  return {
    type: uuidPattern.test(identifier) ? 'id' : 'slug',
    value: identifier
  };
}

/**
 * Lookup content by slug or ID
 * Generic helper for content lookups
 */
export async function lookupContent<T = any>(
  tableName: string,
  identifier: string,
  supabase: any
): Promise<{ data: T | null; foundBy: 'id' | 'slug' | null }> {
  const { type, value } = parseContentIdentifier(identifier);
  
  // First try as slug if it's not a UUID
  if (type === 'slug') {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('slug', value)
      .single();
    
    if (!error && data) {
      return { data, foundBy: 'slug' };
    }
  }
  
  // Try as ID (either because it's a UUID or slug lookup failed)
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', value)
    .single();
  
  if (!error && data) {
    return { data, foundBy: 'id' };
  }
  
  return { data: null, foundBy: null };
}