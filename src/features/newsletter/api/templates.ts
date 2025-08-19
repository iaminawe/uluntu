import { supabase } from '@/lib/supabase';
import { 
  NewsletterTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateFilters,
  PaginatedTemplates,
  TemplateCategory,
  TemplatePreview
} from '@/types/newsletter';

class NewsletterTemplateAPI {
  /**
   * Create a new newsletter template
   */
  async createTemplate(request: CreateTemplateRequest): Promise<NewsletterTemplate | null> {
    try {
      const templateData = {
        name: request.name,
        description: request.description,
        category: request.category || 'general',
        type: request.type || 'mjml',
        template_content: request.template_content,
        default_settings: request.default_settings || {},
        preview_image: request.preview_image,
        tags: request.tags || [],
        is_active: request.is_active !== false,
        is_system: false,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data, error } = await supabase
        .from('newsletter_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return data as NewsletterTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  }

  /**
   * Get templates with filtering and pagination
   */
  async getTemplates(filters: TemplateFilters = {}): Promise<PaginatedTemplates | null> {
    try {
      let query = supabase
        .from('newsletter_templates')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.is_system !== undefined) {
        query = query.eq('is_system', filters.is_system);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by name
      query = query.order('name', { ascending: true });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: (data || []) as NewsletterTemplate[],
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        page_size: limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error getting templates:', error);
      return null;
    }
  }

  /**
   * Get single template by ID
   */
  async getTemplate(id: string): Promise<NewsletterTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as NewsletterTemplate;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, updates: UpdateTemplateRequest): Promise<NewsletterTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('newsletter_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as NewsletterTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      return null;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      // Check if template is used by any campaigns
      const { data: campaigns, error: campaignError } = await supabase
        .from('newsletter_campaigns')
        .select('id')
        .eq('template_id', id)
        .limit(1);

      if (campaignError) throw campaignError;

      if (campaigns && campaigns.length > 0) {
        throw new Error('Cannot delete template that is used by campaigns');
      }

      const { error } = await supabase
        .from('newsletter_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(id: string, newName?: string): Promise<NewsletterTemplate | null> {
    try {
      const original = await this.getTemplate(id);
      if (!original) return null;

      const duplicateData = {
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        type: original.type,
        template_content: original.template_content,
        default_settings: original.default_settings,
        tags: original.tags,
        is_active: false, // New copies start as inactive
        is_system: false,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data, error } = await supabase
        .from('newsletter_templates')
        .insert(duplicateData)
        .select()
        .single();

      if (error) throw error;
      return data as NewsletterTemplate;
    } catch (error) {
      console.error('Error duplicating template:', error);
      return null;
    }
  }

  /**
   * Preview template with sample data
   */
  async previewTemplate(id: string, sampleData?: Record<string, unknown>): Promise<TemplatePreview | null> {
    try {
      const template = await this.getTemplate(id);
      if (!template) return null;

      // Create sample template data if not provided
      const templateData = sampleData || this.createSampleData();

      // Render template based on type
      let html: string;
      if (template.type === 'mjml') {
        html = await this.renderMJMLTemplate(template.template_content, templateData);
      } else {
        html = await this.renderReactTemplate(template.template_content, templateData);
      }

      return {
        template_id: id,
        html,
        text: this.htmlToText(html),
        preview_data: templateData
      };
    } catch (error) {
      console.error('Error previewing template:', error);
      return null;
    }
  }

  /**
   * Validate template content
   */
  async validateTemplate(templateContent: string, type: 'mjml' | 'react-email'): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic validation
      if (!templateContent.trim()) {
        errors.push('Template content cannot be empty');
      }

      if (type === 'mjml') {
        // MJML validation
        if (!templateContent.includes('<mjml>')) {
          errors.push('MJML template must contain <mjml> tag');
        }
        if (!templateContent.includes('<mj-body>')) {
          errors.push('MJML template must contain <mj-body> tag');
        }
      }

      // Check for required placeholders
      const requiredPlaceholders = [
        '{{unsubscribe_url}}',
        '{{web_view_url}}'
      ];

      requiredPlaceholders.forEach(placeholder => {
        if (!templateContent.includes(placeholder)) {
          warnings.push(`Template should include ${placeholder} placeholder`);
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      console.error('Error validating template:', error);
      return {
        valid: false,
        errors: ['Failed to validate template'],
        warnings: []
      };
    }
  }

  /**
   * Get template categories
   */
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_templates')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const categories = [...new Set((data || []).map(d => d.category))]
        .filter(Boolean)
        .map(category => ({
          id: category,
          name: this.formatCategoryName(category),
          description: this.getCategoryDescription(category)
        }));

      return categories;
    } catch (error) {
      console.error('Error getting template categories:', error);
      return [];
    }
  }

  /**
   * Export template
   */
  async exportTemplate(id: string): Promise<string | null> {
    try {
      const template = await this.getTemplate(id);
      if (!template) return null;

      const exportData = {
        name: template.name,
        description: template.description,
        category: template.category,
        type: template.type,
        template_content: template.template_content,
        default_settings: template.default_settings,
        tags: template.tags,
        exported_at: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting template:', error);
      return null;
    }
  }

  /**
   * Import template
   */
  async importTemplate(templateJson: string, overrideName?: string): Promise<NewsletterTemplate | null> {
    try {
      const templateData = JSON.parse(templateJson);

      // Validate import data
      if (!templateData.name || !templateData.template_content) {
        throw new Error('Invalid template data');
      }

      const importData = {
        name: overrideName || templateData.name,
        description: templateData.description || '',
        category: templateData.category || 'general',
        type: templateData.type || 'mjml',
        template_content: templateData.template_content,
        default_settings: templateData.default_settings || {},
        tags: templateData.tags || [],
        is_active: false, // Imported templates start as inactive
        is_system: false,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data, error } = await supabase
        .from('newsletter_templates')
        .insert(importData)
        .select()
        .single();

      if (error) throw error;
      return data as NewsletterTemplate;
    } catch (error) {
      console.error('Error importing template:', error);
      return null;
    }
  }

  /**
   * Get template usage statistics
   */
  async getTemplateUsage(id: string): Promise<{
    campaign_count: number;
    last_used: string | null;
    total_recipients: number;
  }> {
    try {
      const { data: campaigns, error } = await supabase
        .from('newsletter_campaigns')
        .select('sent_at, recipient_count')
        .eq('template_id', id)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      const campaign_count = campaigns?.length || 0;
      const last_used = campaigns && campaigns.length > 0 ? campaigns[0].sent_at : null;
      const total_recipients = (campaigns || []).reduce((sum, c) => sum + (c.recipient_count || 0), 0);

      return {
        campaign_count,
        last_used,
        total_recipients
      };
    } catch (error) {
      console.error('Error getting template usage:', error);
      return {
        campaign_count: 0,
        last_used: null,
        total_recipients: 0
      };
    }
  }

  // Private helper methods

  private async renderMJMLTemplate(templateContent: string, data: Record<string, unknown>): Promise<string> {
    // TODO: Implement MJML rendering with mjml library
    // For now, return a simple HTML version
    let html = templateContent;

    // Replace common placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replaceAll(placeholder, String(value));
    });

    return html;
  }

  private async renderReactTemplate(templateContent: string, data: Record<string, unknown>): Promise<string> {
    // TODO: Implement React Email rendering
    // For now, use same logic as MJML
    return this.renderMJMLTemplate(templateContent, data);
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private createSampleData(): Record<string, unknown> {
    return {
      subscriber_name: 'John Doe',
      subscriber_email: 'john@example.com',
      unsubscribe_url: 'https://example.com/unsubscribe',
      web_view_url: 'https://example.com/newsletter/view',
      company_name: 'Kootenay Tech Community',
      company_logo: 'https://example.com/logo.png',
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      events: [
        {
          title: 'Sample Event',
          description: 'This is a sample event description',
          date: new Date().toISOString(),
          location: 'Sample Location'
        }
      ],
      news: [
        {
          title: 'Sample News Article',
          excerpt: 'This is a sample news excerpt',
          read_more_url: 'https://example.com/news/1'
        }
      ]
    };
  }

  private formatCategoryName(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'general': 'General purpose templates',
      'event': 'Templates for event announcements',
      'newsletter': 'Newsletter digest templates',
      'welcome': 'Welcome email templates',
      'promotion': 'Promotional email templates',
      'announcement': 'General announcement templates'
    };

    return descriptions[category] || 'Custom template category';
  }
}

export const newsletterTemplateApi = new NewsletterTemplateAPI();