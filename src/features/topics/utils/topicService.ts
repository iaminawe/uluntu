import { topicsApi } from '../api/topicsApi';
import type { 
  Topic, 
  TopicEntityType, 
  TopicFormData,
  TopicAnalytics,
  TopicSearchResult,
  TopicSearchOptions,
  TopicTrend,
  TopicUsageStats 
} from '../types';
import { validateTopicData, generateTopicSlug, sortTopics, filterTopics } from './topicAdapter';

/**
 * Business logic layer for topics functionality
 */
export class TopicService {
  
  /**
   * Create a new topic with validation and slug generation
   */
  async createTopic(data: TopicFormData): Promise<{ success: boolean; topic?: Topic; errors?: string[] }> {
    // Validate the input data
    const validation = validateTopicData(data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    try {
      // Generate slug if not provided
      if (!data.slug && data.name) {
        data.slug = generateTopicSlug(data.name);
      }

      // Check for slug uniqueness
      if (data.slug) {
        const existingTopic = await topicsApi.getBySlug(data.slug);
        if (existingTopic) {
          return { success: false, errors: ['A topic with this slug already exists'] };
        }
      }

      const topic = await topicsApi.create(data);
      if (topic) {
        return { success: true, topic };
      } else {
        return { success: false, errors: ['Failed to create topic'] };
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      return { success: false, errors: ['An unexpected error occurred'] };
    }
  }

  /**
   * Update a topic with validation
   */
  async updateTopic(id: string, data: Partial<TopicFormData>): Promise<{ success: boolean; topic?: Topic; errors?: string[] }> {
    // Validate the input data if it contains required fields
    if (data.name !== undefined) {
      const validation = validateTopicData({ name: data.name, ...data } as TopicFormData);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }
    }

    try {
      // Generate slug if name is provided but slug is not
      if (data.name && !data.slug) {
        data.slug = generateTopicSlug(data.name);
      }

      // Check for slug uniqueness if slug is being updated
      if (data.slug) {
        const existingTopic = await topicsApi.getBySlug(data.slug);
        if (existingTopic && existingTopic.id !== id) {
          return { success: false, errors: ['A topic with this slug already exists'] };
        }
      }

      const topic = await topicsApi.update(id, data);
      if (topic) {
        return { success: true, topic };
      } else {
        return { success: false, errors: ['Failed to update topic'] };
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      return { success: false, errors: ['An unexpected error occurred'] };
    }
  }

  /**
   * Delete a topic with dependency checking
   */
  async deleteTopic(id: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Check if topic has any content associations
      const analytics = await topicsApi.getAnalytics();
      const topicAnalytics = analytics.find(a => a.topic_id === id);
      
      if (topicAnalytics && topicAnalytics.content_count > 0) {
        return { 
          success: false, 
          errors: [`Cannot delete topic: it is associated with ${topicAnalytics.content_count} content items`] 
        };
      }

      const success = await topicsApi.delete(id);
      if (success) {
        return { success: true };
      } else {
        return { success: false, errors: ['Failed to delete topic'] };
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      return { success: false, errors: ['An unexpected error occurred'] };
    }
  }

  /**
   * Search topics with advanced filtering and ranking
   */
  async searchTopics(options: TopicSearchOptions): Promise<TopicSearchResult[]> {
    try {
      const allTopics = await topicsApi.getAll();
      let results: TopicSearchResult[] = [];

      if (!options.query.trim()) {
        // No search query, return all topics with default score
        results = allTopics.map(topic => ({
          topic,
          matchScore: 1,
          matchFields: []
        }));
      } else {
        // Search and score topics
        const query = options.query.toLowerCase();
        
        results = allTopics
          .map(topic => {
            let score = 0;
            const matchFields: string[] = [];

            // Name match (highest weight)
            if (topic.name.toLowerCase().includes(query)) {
              score += topic.name.toLowerCase() === query ? 100 : 50;
              matchFields.push('name');
            }

            // Description match (medium weight)
            if (topic.description?.toLowerCase().includes(query)) {
              score += 20;
              matchFields.push('description');
            }

            // Slug match (medium weight)
            if (topic.slug.toLowerCase().includes(query)) {
              score += 15;
              matchFields.push('slug');
            }

            return score > 0 ? { topic, matchScore: score, matchFields } : null;
          })
          .filter((result): result is TopicSearchResult => result !== null);
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'relevance':
          results.sort((a, b) => b.matchScore - a.matchScore);
          break;
        case 'alphabetical':
          results.sort((a, b) => a.topic.name.localeCompare(b.topic.name));
          break;
        case 'popularity':
          // Would need analytics data for this
          const analytics = await topicsApi.getAnalytics();
          results.sort((a, b) => {
            const aAnalytics = analytics.find(an => an.topic_id === a.topic.id);
            const bAnalytics = analytics.find(an => an.topic_id === b.topic.id);
            return (bAnalytics?.content_count || 0) - (aAnalytics?.content_count || 0);
          });
          break;
        default:
          results.sort((a, b) => a.topic.sort_order - b.topic.sort_order);
      }

      // Apply limit
      if (options.limit && options.limit > 0) {
        results = results.slice(0, options.limit);
      }

      return results;
    } catch (error) {
      console.error('Error searching topics:', error);
      return [];
    }
  }

  /**
   * Get topic usage statistics
   */
  async getTopicUsageStats(): Promise<TopicUsageStats[]> {
    try {
      const analytics = await topicsApi.getAnalytics();
      
      return analytics.map(analytic => ({
        topicId: analytic.topic_id,
        topicName: analytic.topic_name,
        totalUsage: analytic.content_count,
        recentUsage: analytic.content_count, // Would need time-based data for this
        trendDirection: 'stable' as const, // Would need historical data
        usageByEntity: {
          news: analytic.news_count,
          event: analytic.event_count,
          resource: analytic.resource_count,
          group: analytic.group_count,
          marketplace: analytic.marketplace_count,
          opportunity: analytic.opportunity_count,
          company: analytic.company_count,
        }
      }));
    } catch (error) {
      console.error('Error getting topic usage stats:', error);
      return [];
    }
  }

  /**
   * Get trending topics (would need historical data for real trends)
   */
  async getTrendingTopics(): Promise<TopicTrend[]> {
    try {
      const analytics = await topicsApi.getAnalytics();
      
      // For now, just return topics sorted by content count
      // In a real implementation, this would compare current vs previous periods
      return analytics
        .sort((a, b) => b.content_count - a.content_count)
        .slice(0, 10)
        .map(analytic => ({
          topicId: analytic.topic_id,
          topicName: analytic.topic_name,
          currentPeriodCount: analytic.content_count,
          previousPeriodCount: analytic.content_count, // Would need historical data
          percentageChange: 0, // Would calculate from historical data
          isGrowing: analytic.content_count > 0
        }));
    } catch (error) {
      console.error('Error getting trending topics:', error);
      return [];
    }
  }

  /**
   * Bulk assign topics to multiple entities
   */
  async bulkAssignTopics(
    assignments: Array<{ entityType: TopicEntityType; entityId: string; topicIds: string[] }>
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const errors: string[] = [];
      
      for (const assignment of assignments) {
        try {
          await topicsApi.setTopicsForEntity(
            assignment.entityType, 
            assignment.entityId, 
            assignment.topicIds
          );
        } catch (error) {
          errors.push(`Failed to assign topics for ${assignment.entityType} ${assignment.entityId}`);
        }
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in bulk topic assignment:', error);
      return { success: false, errors: ['An unexpected error occurred'] };
    }
  }

  /**
   * Get suggested topics based on content analysis
   */
  async getSuggestedTopics(content: string, entityType: TopicEntityType): Promise<Topic[]> {
    try {
      const allTopics = await topicsApi.getAll();
      const contentLower = content.toLowerCase();
      
      // Simple keyword matching - in a real implementation, 
      // this could use NLP or machine learning
      const suggestions = allTopics.filter(topic => {
        const nameMatch = contentLower.includes(topic.name.toLowerCase());
        const descMatch = topic.description && 
          contentLower.includes(topic.description.toLowerCase());
        
        return nameMatch || descMatch;
      });

      // Sort by relevance (name matches first, then description matches)
      suggestions.sort((a, b) => {
        const aNameMatch = contentLower.includes(a.name.toLowerCase());
        const bNameMatch = contentLower.includes(b.name.toLowerCase());
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        return a.name.localeCompare(b.name);
      });

      return suggestions.slice(0, 5); // Return top 5 suggestions
    } catch (error) {
      console.error('Error getting suggested topics:', error);
      return [];
    }
  }

  /**
   * Validate topic relationships for consistency
   */
  async validateTopicRelationships(): Promise<{ isValid: boolean; issues: string[] }> {
    try {
      const issues: string[] = [];
      const analytics = await topicsApi.getAnalytics();
      
      // Check for topics with no content
      const emptyTopics = analytics.filter(a => a.content_count === 0);
      if (emptyTopics.length > 0) {
        issues.push(`${emptyTopics.length} topics have no associated content`);
      }

      // Check for duplicate slugs (shouldn't happen with DB constraints, but good to verify)
      const allTopics = await topicsApi.getAll();
      const slugs = allTopics.map(t => t.slug);
      const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
      if (duplicateSlugs.length > 0) {
        issues.push(`Duplicate slugs found: ${duplicateSlugs.join(', ')}`);
      }

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Error validating topic relationships:', error);
      return {
        isValid: false,
        issues: ['Failed to validate topic relationships']
      };
    }
  }

  /**
   * Export topics data for backup or migration
   */
  async exportTopicsData(): Promise<{ topics: Topic[]; analytics: TopicAnalytics[] }> {
    try {
      const [topics, analytics] = await Promise.all([
        topicsApi.getAll(),
        topicsApi.getAnalytics()
      ]);

      return { topics, analytics };
    } catch (error) {
      console.error('Error exporting topics data:', error);
      throw new Error('Failed to export topics data');
    }
  }
}

// Create a singleton instance
export const topicService = new TopicService();