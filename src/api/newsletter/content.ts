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
  DateRange
} from '@/types/newsletter';

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
    customCriteria?: any
  ): Promise<any[]> {
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
      return data || [];
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
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating content rule:', error);
      return null;
    }
  }

  /**
   * Test content rule to see what content it would generate
   */
  async testContentRule(rule: ContentRule): Promise<any[]> {
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
    customCriteria?: any
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

      return (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: event.date,
        end_date: event.end_date,
        location: event.location,
        type: event.type,
        url: event.url,
        registration_url: `/events/${event.id}`,
        attendee_count: event.current_attendees,
        max_attendees: event.max_attendees,
        featured: event.featured || false
      }));
    } catch (error) {
      console.error('Error curating events:', error);
      return [];
    }
  }

  private async curateNews(
    rules: ContentRule[], 
    dateRange: DateRange, 
    maxItems?: number,
    customCriteria?: any
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
          published_at,
          featured,
          tags,
          author:members(name)
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
        
        query = query.gte('published_at', cutoffDate.toISOString());
      }

      // Featured first
      if (criteria.featured_first) {
        query = query.order('featured', { ascending: false });
      }

      // Sort by published date
      const sortBy = criteria.sort_by || 'published_at';
      query = query.order(sortBy, { ascending: false });

      // Limit results
      query = query.limit(rule.max_items);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || '',
        content: article.content,
        hero_image: article.hero_image,
        author: article.author?.name || 'Community',
        published_at: article.published_at,
        read_more_url: `/news/${article.id}`,
        tags: article.tags || [],
        featured: article.featured || false
      }));
    } catch (error) {
      console.error('Error curating news:', error);
      return [];
    }
  }

  private async curateOpportunities(
    rules: ContentRule[], 
    dateRange: DateRange, 
    maxItems?: number,
    customCriteria?: any
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
          company:companies(name, logo)
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

      return (data || []).map(opp => ({
        id: opp.id,
        title: opp.title,
        company: opp.company?.name || 'Community',
        company_logo: opp.company?.logo,
        type: opp.title.toLowerCase().includes('volunteer') ? 'volunteer' : 'job',
        location: opp.location,
        remote: opp.remote || false,
        description: opp.description || '',
        requirements: opp.requirements || [],
        application_url: `/opportunities/${opp.id}`,
        deadline: opp.deadline,
        featured: opp.featured || false
      }));
    } catch (error) {
      console.error('Error curating opportunities:', error);
      return [];
    }
  }

  private async curateMarketplace(
    rules: ContentRule[], 
    dateRange: DateRange, 
    maxItems?: number,
    customCriteria?: any
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
          seller:members(name)
        `);

      // Status filter
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Featured only
      if (criteria.featured_only) {
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

      return (data || []).map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description || '',
        price: listing.price,
        condition: listing.condition,
        images: listing.images || [],
        seller: listing.seller?.name || 'Seller',
        contact_url: `/marketplace/${listing.id}`,
        location: listing.location,
        featured: listing.featured || false
      }));
    } catch (error) {
      console.error('Error curating marketplace:', error);
      return [];
    }
  }

  private async curateMembers(
    rules: ContentRule[], 
    maxItems?: number,
    customCriteria?: any
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
          skills,
          featured
        `);

      // Status filter
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Featured only
      if (criteria.featured_only) {
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
        title: member.title || '',
        bio: member.bio || '',
        image: member.image,
        location: member.location || '',
        skills: member.skills || [],
        profile_url: `/directory/${member.id}`,
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
    customCriteria?: any
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
          employee_count,
          featured
        `);

      // Status filter
      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      // Featured only
      if (criteria.featured_only) {
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
        industry: company.industry || '',
        logo: company.logo,
        website: company.website,
        employee_count: company.employee_count,
        profile_url: `/directory/companies/${company.id}`,
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
      return data || [];
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
      return data?.content || null;
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
          content,
          expires_at: expiresAt.toISOString()
        });
    } catch (error) {
      console.error('Error caching content:', error);
    }
  }
}

export const newsletterContentApi = new NewsletterContentAPI();