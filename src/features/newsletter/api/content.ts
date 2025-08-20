import { supabase } from '@/lib/supabase';
import { 
  CuratedContent, 
  ContentRule, 
  ContentType, 
  CurationOptions,
  EventContent,
  NewsContent,
  OpportunityContent,
  MarketplaceContent,
  MemberContent,
  CompanyContent,
  DateRange,
  SelectionCriteria
} from '@/types/newsletter';
import { 
  getEventUrl, 
  getNewsArticleUrl, 
  getOpportunityUrl, 
  getMarketplaceListingUrl, 
  getCompanyUrl,
  getContentUrl
} from '@/utils/contentUrlUtils';
import { memberToAuthorData } from '@/utils/authorUtils';

class NewsletterContentAPI {
  /**
   * Generate curated content for newsletter based on rules
   */
  async generateCuratedContent(options: CurationOptions = {}): Promise<CuratedContent | null> {
    try {
      const dateRange = options.date_range || this.getDefaultDateRange();
      const contentTypes = options.content_types || ['events', 'news', 'opportunities', 'marketplace', 'members'];
      
      // Check cache first unless force refresh
      if (!options.force_refresh) {
        const cached = await this.getCachedContent(contentTypes, dateRange);
        if (cached) return cached;
      }

      // Get content rules
      const rules = await this.getActiveContentRules();
      
      // Generate content for each type
      const content: CuratedContent = {
        events: [],
        news: [],
        opportunities: [],
        marketplace: [],
        members: [],
        companies: [],
        custom_sections: []
      };

      // Process each content type
      for (const contentType of contentTypes) {
        const typeRules = rules.filter(rule => rule.content_type === contentType);
        
        switch (contentType) {
          case 'events':
            content.events = await this.curateEvents(typeRules, dateRange);
            break;
          case 'news':
            content.news = await this.curateNews(typeRules, dateRange);
            break;
          case 'opportunities':
            content.opportunities = await this.curateOpportunities(typeRules, dateRange);
            break;
          case 'marketplace':
            content.marketplace = await this.curateMarketplace(typeRules, dateRange);
            break;
          case 'members':
            content.members = await this.curateMembers(typeRules);
            break;
          case 'companies':
            content.companies = await this.curateCompanies(typeRules);
            break;
        }
      }

      // Cache the generated content
      await this.cacheContent(contentTypes, dateRange, content);

      return content;
    } catch (error) {
      console.error('Error generating curated content:', error);
      return null;
    }
  }

  /**
   * Get specific content type with custom options
   */
  async getCuratedContentByType(
    contentType: ContentType, 
    maxItems: number = 5,
    customCriteria?: Record<string, unknown>
  ): Promise<unknown[]> {
    try {
      const dateRange = this.getDefaultDateRange();
      
      switch (contentType) {
        case 'events':
          return await this.curateEvents([], dateRange, maxItems, customCriteria);
        case 'news':
          return await this.curateNews([], dateRange, maxItems, customCriteria);
        case 'opportunities':
          return await this.curateOpportunities([], dateRange, maxItems, customCriteria);
        case 'marketplace':
          return await this.curateMarketplace([], dateRange, maxItems, customCriteria);
        case 'members':
          return await this.curateMembers([], maxItems, customCriteria);
        case 'companies':
          return await this.curateCompanies([], maxItems, customCriteria);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error curating ${contentType}:`, error);
      return [];
    }
  }

  /**
   * Get content rules
   */
  async getContentRules(): Promise<ContentRule[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_content_rules')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      return (data || []).map(rule => ({
        ...rule,
        id: rule.id,
        name: rule.name,
        description: rule.description || '',
        content_type: rule.content_type || 'events' as ContentType,
        selection_criteria: rule.selection_criteria || {} as SelectionCriteria,
        max_items: rule.max_items || 5,
        priority: rule.priority || 0,
        is_active: rule.is_active || false,
        created_at: rule.created_at || new Date().toISOString(),
        updated_at: rule.updated_at || new Date().toISOString()
      })) as ContentRule[];
    } catch (error) {
      console.error('Error getting content rules:', error);
      return [];
    }
  }

  /**
   * Update content rule
   */
  async updateContentRule(id: string, updates: Partial<ContentRule>): Promise<ContentRule | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_content_rules')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? {
        ...data,
        id: data.id,
        name: data.name,
        description: data.description || '',
        content_type: data.content_type || 'events' as ContentType,
        selection_criteria: data.selection_criteria || {} as SelectionCriteria,
        max_items: data.max_items || 5,
        priority: data.priority || 0,
        is_active: data.is_active || false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      } as ContentRule : null;
    } catch (error) {
      console.error('Error updating content rule:', error);
      return null;
    }
  }

  /**
   * Test content rule to see what content it would generate
   */
  async testContentRule(rule: ContentRule): Promise<unknown[]> {
    try {
      const dateRange = this.getDefaultDateRange();
      
      switch (rule.content_type) {
        case 'events':
          return await this.curateEvents([rule], dateRange);
        case 'news':
          return await this.curateNews([rule], dateRange);
        case 'opportunities':
          return await this.curateOpportunities([rule], dateRange);
        case 'marketplace':
          return await this.curateMarketplace([rule], dateRange);
        case 'members':
          return await this.curateMembers([rule]);
        case 'companies':
          return await this.curateCompanies([rule]);
        default:
          return [];
      }
    } catch (error) {
      console.error('Error testing content rule:', error);
      return [];
    }
  }

  // Private content curation methods

  private async curateEvents(
    rules: ContentRule[], 
    dateRange: DateRange, 
    maxItems?: number,
    customCriteria?: Record<string, unknown>
  ): Promise<EventContent[]> {
    try {
      const rule = rules[0] || { max_items: maxItems || 5, selection_criteria: customCriteria || {} };
      const criteria = rule.selection_criteria;

      let query = supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          date,
          end_date,
          location,
          type,
          url,
          featured,
          current_attendees,
          max_attendees,
          organizer:members(name)
        `);

      // Status filter
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Date filtering
      if (criteria.date_filter === 'upcoming') {
        const now = new Date().toISOString();
        const maxWeeksAhead = criteria.max_weeks_ahead || 4;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (maxWeeksAhead * 7));
        
        query = query
          .gte('date', now)
          .lte('date', futureDate.toISOString());
      }

      // Featured first
      if (criteria.featured_first) {
        query = query.order('featured', { ascending: false });
      }

      // Sort by date or creation
      const sortBy = criteria.sort_by || 'date';
      query = query.order(sortBy, { ascending: true });

      // Limit results
      query = query.limit(rule.max_items);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(event => {
        const result: EventContent = {
          id: event.id,
          title: event.title,
          description: event.description || '',
          date: event.date,
          location: event.location,
          type: (event.type as 'in-person' | 'online' | 'hybrid') || 'in-person',
          featured: event.featured || false
        };
        if (event.end_date) result.end_date = event.end_date;
        if (event.url) result.url = event.url;
        if ((event as any).hero_image) result.image = (event as any).hero_image;
        else if ((event as any).image) result.image = (event as any).image;
        result.registration_url = getEventUrl(event);
        if (event.current_attendees !== null) result.attendee_count = event.current_attendees;
        if (event.max_attendees !== null) result.max_attendees = event.max_attendees;
        return result;
      });
    } catch (error) {
      console.error('Error curating events:', error);
      return [];
    }
  }

  private async curateNews(
    rules: ContentRule[], 
    dateRange: DateRange, 
    maxItems?: number,
    customCriteria?: Record<string, unknown>
  ): Promise<NewsContent[]> {
    try {
      const rule = rules[0] || { max_items: maxItems || 3, selection_criteria: customCriteria || {} };
      const criteria = rule.selection_criteria;

      let query = supabase
        .from('news')
        .select(`
          id,
          title,
          excerpt,
          content,
          hero_image,
          created_at,
          featured,
          tags,
          author:member_id!inner(name)
        `);

      // Status filter
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Date filtering for recent news
      if (criteria.date_filter === 'recent') {
        const maxDaysOld = criteria.max_days_old || 14;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld);
        
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      // Featured first
      if (criteria.featured_first) {
        query = query.order('featured', { ascending: false });
      }

      // Sort by created date
      const sortBy = criteria.sort_by === 'published_at' ? 'created_at' : (criteria.sort_by || 'created_at');
      query = query.order(sortBy, { ascending: false });

      // Limit results
      query = query.limit(rule.max_items);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(article => {
        const result: NewsContent = {
          id: article.id,
          title: article.title,
          content: article.content,
          author: (article as any).author?.name || 'Community',
          published_at: article.created_at || new Date().toISOString(),
          read_more_url: getNewsArticleUrl(article),
          tags: article.tags || [],
          featured: article.featured || false
        };
        if (article.excerpt) result.excerpt = article.excerpt;
        if (article.hero_image) result.hero_image = article.hero_image;
        return result;
      });
    } catch (error) {
      console.error('Error curating news:', error);
      return [];
    }
  }

  private async curateOpportunities(
    rules: ContentRule[], 
    dateRange: DateRange, 
    maxItems?: number,
    customCriteria?: Record<string, unknown>
  ): Promise<OpportunityContent[]> {
    try {
      const rule = rules[0] || { max_items: maxItems || 3, selection_criteria: customCriteria || {} };
      const criteria = rule.selection_criteria;

      let query = supabase
        .from('opportunities')
        .select(`
          id,
          title,
          description,
          requirements,
          location,
          remote,
          deadline,
          featured,
          created_at
        `);

      // Status filter  
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Active only filter
      if (criteria.active_only) {
        const now = new Date().toISOString();
        query = query.or(`deadline.is.null,deadline.gte.${now}`);
      }

      // Date filtering for recent opportunities
      if (criteria.date_filter === 'recent') {
        const maxDaysOld = criteria.max_days_old || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld);
        
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      // Featured first
      if (criteria.featured_first) {
        query = query.order('featured', { ascending: false });
      }

      // Sort by creation date
      const sortBy = criteria.sort_by || 'created_at';
      query = query.order(sortBy, { ascending: false });

      // Limit results
      query = query.limit(rule.max_items);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(opp => {
        const result: OpportunityContent = {
          id: opp.id,
          title: opp.title,
          company: 'Community', // TODO: Add company lookup
          type: opp.title.toLowerCase().includes('volunteer') ? 'volunteer' : 'job',
          remote: opp.remote || false,
          description: opp.description || '',
          requirements: opp.requirements || [],
          application_url: getOpportunityUrl(opp),
          featured: opp.featured || false
        };
        if (opp.location) result.location = opp.location;
        if (opp.deadline) result.deadline = opp.deadline;
        return result;
      });
    } catch (error) {
      console.error('Error curating opportunities:', error);
      return [];
    }
  }

  private async curateMarketplace(
    rules: ContentRule[], 
    dateRange: DateRange, 
    maxItems?: number,
    customCriteria?: Record<string, unknown>
  ): Promise<MarketplaceContent[]> {
    try {
      const rule = rules[0] || { max_items: maxItems || 2, selection_criteria: customCriteria || {} };
      const criteria = rule.selection_criteria;

      let query = supabase
        .from('marketplace_listings')
        .select(`
          id,
          title,
          description,
          price,
          condition,
          images,
          location,
          featured,
          seller_id
        `);

      // Status filter
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Featured only (check if property exists in criteria)
      if ((criteria as any).featured_only) {
        query = query.eq('featured', true);
      }

      // Recent listings
      if (criteria.date_filter === 'recent') {
        const maxDaysOld = criteria.max_days_old || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld);
        
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      // Sort by featured date or creation
      const sortBy = criteria.sort_by || 'created_at';
      query = query.order(sortBy, { ascending: false });

      // Limit results
      query = query.limit(rule.max_items);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(listing => {
        const result: MarketplaceContent = {
          id: listing.id,
          title: listing.title,
          description: listing.description || '',
          images: listing.images || [],
          seller: 'Seller', // TODO: Add seller lookup
          contact_url: getMarketplaceListingUrl(listing),
          featured: listing.featured || false
        };
        if (listing.price !== null) result.price = listing.price;
        if (listing.condition) result.condition = listing.condition;
        if (listing.location) result.location = listing.location;
        return result;
      });
    } catch (error) {
      console.error('Error curating marketplace:', error);
      return [];
    }
  }

  private async curateMembers(
    rules: ContentRule[], 
    maxItems?: number,
    customCriteria?: Record<string, unknown>
  ): Promise<MemberContent[]> {
    try {
      const rule = rules[0] || { max_items: maxItems || 1, selection_criteria: customCriteria || {} };
      const criteria = rule.selection_criteria;

      let query = supabase
        .from('members')
        .select(`
          id,
          name,
          title,
          bio,
          image,
          location,
          featured
        `);

      // Status filter
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Featured only (check if property exists in criteria)
      if ((criteria as any).featured_only) {
        query = query.eq('featured', true);
      }

      // New members (last 30 days)
      if (criteria.new_members) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      // Random selection or by creation date
      if (criteria.sort_by === 'random') {
        // Get random members by ordering by a random function
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Limit results
      query = query.limit(rule.max_items);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(member => ({
        id: member.id,
        name: member.name,
        title: member.title || undefined,
        bio: member.bio || '',
        image: member.image || undefined,
        location: member.location || undefined,
        skills: [],
        profile_url: memberToAuthorData(member).profileUrl,
        featured: member.featured || false
      }));
    } catch (error) {
      console.error('Error curating members:', error);
      return [];
    }
  }

  private async curateCompanies(
    rules: ContentRule[], 
    maxItems?: number,
    customCriteria?: Record<string, unknown>
  ): Promise<CompanyContent[]> {
    try {
      const rule = rules[0] || { max_items: maxItems || 1, selection_criteria: customCriteria || {} };
      const criteria = rule.selection_criteria;

      let query = supabase
        .from('companies')
        .select(`
          id,
          name,
          description,
          industry,
          logo,
          website,
          featured
        `);

      // Status filter
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Featured only (check if property exists in criteria)
      if ((criteria as any).featured_only) {
        query = query.eq('featured', true);
      }

      // Sort by creation date
      query = query.order('created_at', { ascending: false });

      // Limit results
      query = query.limit(rule.max_items);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(company => ({
        id: company.id,
        name: company.name,
        description: company.description || '',
        industry: Array.isArray(company.industry) ? company.industry.join(', ') : (company.industry || ''),
        logo: company.logo || undefined,
        website: company.website || undefined,
        employee_count: (company as any).employee_count || undefined,
        profile_url: getCompanyUrl(company),
        featured: company.featured || false
      }));
    } catch (error) {
      console.error('Error curating companies:', error);
      return [];
    }
  }

  // Helper methods

  private async getActiveContentRules(): Promise<ContentRule[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_content_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return (data || []).map(rule => ({
        ...rule,
        id: rule.id,
        name: rule.name,
        description: rule.description || '',
        content_type: rule.content_type || 'events' as ContentType,
        selection_criteria: rule.selection_criteria || {} as SelectionCriteria,
        max_items: rule.max_items || 5,
        priority: rule.priority || 0,
        is_active: rule.is_active || false,
        created_at: rule.created_at || new Date().toISOString(),
        updated_at: rule.updated_at || new Date().toISOString()
      })) as ContentRule[];
    } catch (error) {
      console.error('Error getting active content rules:', error);
      return [];
    }
  }

  private getDefaultDateRange(): DateRange {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    const fourWeeksFromNow = new Date(now.getTime() + (28 * 24 * 60 * 60 * 1000));

    return {
      start: twoWeeksAgo.toISOString(),
      end: fourWeeksFromNow.toISOString()
    };
  }

  private async getCachedContent(contentTypes: ContentType[], dateRange: DateRange): Promise<CuratedContent | null> {
    try {
      const cacheKey = contentTypes.join(',');
      const { data, error } = await supabase
        .from('newsletter_content_cache')
        .select('content')
        .eq('content_type', cacheKey)
        .eq('date_range_start', dateRange.start.split('T')[0])
        .eq('date_range_end', dateRange.end.split('T')[0])
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data?.content as unknown) as CuratedContent || null;
    } catch (error) {
      console.error('Error getting cached content:', error);
      return null;
    }
  }

  private async cacheContent(contentTypes: ContentType[], dateRange: DateRange, content: CuratedContent): Promise<void> {
    try {
      const cacheKey = contentTypes.join(',');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6); // Cache for 6 hours

      await supabase
        .from('newsletter_content_cache')
        .upsert({
          content_type: cacheKey,
          date_range_start: dateRange.start.split('T')[0],
          date_range_end: dateRange.end.split('T')[0],
          content: content as any,
          expires_at: expiresAt.toISOString()
        });
    } catch (error) {
      console.error('Error caching content:', error);
    }
  }
}

export const newsletterContentApi = new NewsletterContentAPI();