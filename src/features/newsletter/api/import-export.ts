import { supabase } from '@/lib/supabase';
import { newsletterSubscriptionApi } from './subscriptions';
import { newsletterCampaignApi } from './campaigns';
import { 
  NewsletterSubscription,
  NewsletterCampaign,
  ImportResult,
  ExportFormat,
  BulkOperation,
  BulkOperationResult
} from '@/types/newsletter';

class NewsletterImportExportAPI {
  /**
   * Import subscribers from CSV
   */
  async importSubscribers(
    csvContent: string,
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      defaultStatus?: 'pending' | 'active';
      sendConfirmation?: boolean;
    } = {}
  ): Promise<ImportResult> {
    try {
      const result: ImportResult = {
        success: true,
        total_processed: 0,
        successful_imports: 0,
        failed_imports: 0,
        errors: [],
        warnings: [],
        duplicates_skipped: 0
      };

      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        return {
          ...result,
          success: false,
          errors: ['CSV must contain at least a header row and one data row']
        };
      }

      const headers = this.parseCSVLine(lines[0]);
      const emailIndex = this.findColumnIndex(headers, ['email', 'email_address', 'e-mail']);
      
      if (emailIndex === -1) {
        return {
          ...result,
          success: false,
          errors: ['Email column not found in CSV. Expected columns: email, email_address, or e-mail']
        };
      }

      result.total_processed = lines.length - 1;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          if (values.length <= emailIndex) {
            result.errors.push(`Row ${i + 1}: Insufficient columns`);
            result.failed_imports++;
            continue;
          }

          const email = values[emailIndex].trim();
          if (!this.isValidEmail(email)) {
            result.errors.push(`Row ${i + 1}: Invalid email format: ${email}`);
            result.failed_imports++;
            continue;
          }

          // Check for existing subscription
          const existing = await newsletterSubscriptionApi.getSubscription(email);
          
          if (existing) {
            if (options.skipDuplicates) {
              result.duplicates_skipped++;
              continue;
            } else if (options.updateExisting) {
              // Update existing subscription
              const preferences = this.extractPreferencesFromRow(headers, values);
              await newsletterSubscriptionApi.updatePreferences(
                existing.subscription_token, 
                { preferences }
              );
              result.successful_imports++;
            } else {
              result.warnings.push(`Row ${i + 1}: Email ${email} already exists`);
              result.duplicates_skipped++;
            }
          } else {
            // Create new subscription
            const subscriptionData = {
              email,
              preferences: this.extractPreferencesFromRow(headers, values)
            };

            const subscription = await newsletterSubscriptionApi.subscribe(subscriptionData);
            
            if (subscription) {
              // If default status is active and not sending confirmation, confirm immediately
              if (options.defaultStatus === 'active' && !options.sendConfirmation) {
                await newsletterSubscriptionApi.confirmSubscription(subscription.confirmation_token!);
              }
              result.successful_imports++;
            } else {
              result.errors.push(`Row ${i + 1}: Failed to create subscription for ${email}`);
              result.failed_imports++;
            }
          }
        } catch (error) {
          result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.failed_imports++;
        }
      }

      result.success = result.failed_imports === 0;
      return result;
    } catch (error) {
      console.error('Error importing subscribers:', error);
      return {
        success: false,
        total_processed: 0,
        successful_imports: 0,
        failed_imports: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        duplicates_skipped: 0
      };
    }
  }

  /**
   * Export subscribers to various formats
   */
  async exportSubscribers(
    format: ExportFormat = 'csv',
    filters: {
      status?: string[];
      segments?: string[];
      dateRange?: { start: string; end: string };
      includeAnalytics?: boolean;
    } = {}
  ): Promise<string | null> {
    try {
      // Get subscribers with filters
      const subscriptionFilters = {
        limit: 10000, // Export all matching
        offset: 0,
        ...filters
      };

      const result = await newsletterSubscriptionApi.getAllSubscriptions(subscriptionFilters);
      if (!result || !result.data) return null;

      let subscribers = result.data;

      // Apply segment filter if specified
      if (filters.segments && filters.segments.length > 0) {
        const segmentSubscribers = await this.getSubscribersInSegments(filters.segments);
        subscribers = subscribers.filter(sub => segmentSubscribers.includes(sub.id));
      }

      // Add analytics data if requested
      if (filters.includeAnalytics) {
        subscribers = await this.addAnalyticsToSubscribers(subscribers);
      }

      switch (format) {
        case 'csv':
          return this.exportToCSV(subscribers, filters.includeAnalytics);
        case 'json':
          return this.exportToJSON(subscribers);
        case 'xlsx':
          return this.exportToXLSX(subscribers, filters.includeAnalytics);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      return null;
    }
  }

  /**
   * Export campaign data
   */
  async exportCampaigns(
    format: ExportFormat = 'csv',
    filters: {
      status?: string[];
      dateRange?: { start: string; end: string };
      includeAnalytics?: boolean;
    } = {}
  ): Promise<string | null> {
    try {
      const campaignFilters = {
        limit: 10000,
        offset: 0,
        ...filters
      };

      const result = await newsletterCampaignApi.getCampaigns(campaignFilters);
      if (!result || !result.data) return null;

      let campaigns = result.data;

      // Add analytics data if requested
      if (filters.includeAnalytics) {
        campaigns = await this.addAnalyticsToCampaigns(campaigns);
      }

      switch (format) {
        case 'csv':
          return this.exportCampaignsToCSV(campaigns, filters.includeAnalytics);
        case 'json':
          return this.exportCampaignsToJSON(campaigns);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting campaigns:', error);
      return null;
    }
  }

  /**
   * Bulk operations on subscribers
   */
  async bulkOperation(operation: BulkOperation): Promise<BulkOperationResult> {
    try {
      const result: BulkOperationResult = {
        success: true,
        total_processed: operation.subscriber_ids.length,
        successful_operations: 0,
        failed_operations: 0,
        errors: []
      };

      for (const subscriberId of operation.subscriber_ids) {
        try {
          switch (operation.type) {
            case 'update_status':
              await newsletterSubscriptionApi.updateSubscriptionStatus(
                subscriberId, 
                operation.data.status
              );
              break;
            
            case 'update_preferences':
              // Need to get subscription token first
              const { data: sub } = await supabase
                .from('newsletter_subscriptions')
                .select('subscription_token')
                .eq('id', subscriberId)
                .single();
              
              if (sub) {
                await newsletterSubscriptionApi.updatePreferences(
                  sub.subscription_token,
                  { preferences: operation.data.preferences }
                );
              }
              break;
            
            case 'assign_segment':
              await this.assignSubscriberToSegment(subscriberId, operation.data.segment_id);
              break;
            
            case 'remove_segment':
              await this.removeSubscriberFromSegment(subscriberId, operation.data.segment_id);
              break;
            
            case 'delete':
              await newsletterSubscriptionApi.deleteSubscription(subscriberId);
              break;
            
            default:
              throw new Error(`Unsupported operation type: ${operation.type}`);
          }
          
          result.successful_operations++;
        } catch (error) {
          result.errors.push(`Subscriber ${subscriberId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.failed_operations++;
        }
      }

      result.success = result.failed_operations === 0;
      return result;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      return {
        success: false,
        total_processed: operation.subscriber_ids.length,
        successful_operations: 0,
        failed_operations: operation.subscriber_ids.length,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Generate export template for imports
   */
  generateImportTemplate(format: ExportFormat = 'csv'): string {
    const headers = [
      'email',
      'frequency',
      'content_types',
      'format',
      'location_filter',
      'language'
    ];

    const sampleData = [
      'john@example.com',
      'weekly',
      'events,news,opportunities',
      'digest',
      'true',
      'en'
    ];

    if (format === 'csv') {
      return [
        headers.join(','),
        sampleData.join(',')
      ].join('\n');
    } else if (format === 'json') {
      const sampleRecord = headers.reduce((obj, header, index) => {
        obj[header] = sampleData[index];
        return obj;
      }, {} as Record<string, string>);

      return JSON.stringify([sampleRecord], null, 2);
    }

    return '';
  }

  // Private helper methods

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    for (const name of possibleNames) {
      const index = lowerHeaders.indexOf(name.toLowerCase());
      if (index !== -1) return index;
    }
    return -1;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private extractPreferencesFromRow(headers: string[], values: string[]): any {
    const preferences: any = {
      frequency: 'weekly',
      content_types: ['events', 'news', 'opportunities'],
      format: 'digest',
      location_filter: true,
      language: 'en'
    };

    const frequencyIndex = this.findColumnIndex(headers, ['frequency']);
    if (frequencyIndex !== -1 && values[frequencyIndex]) {
      preferences.frequency = values[frequencyIndex];
    }

    const contentTypesIndex = this.findColumnIndex(headers, ['content_types', 'interests']);
    if (contentTypesIndex !== -1 && values[contentTypesIndex]) {
      preferences.content_types = values[contentTypesIndex].split(',').map(s => s.trim());
    }

    const formatIndex = this.findColumnIndex(headers, ['format']);
    if (formatIndex !== -1 && values[formatIndex]) {
      preferences.format = values[formatIndex];
    }

    const languageIndex = this.findColumnIndex(headers, ['language', 'lang']);
    if (languageIndex !== -1 && values[languageIndex]) {
      preferences.language = values[languageIndex];
    }

    return preferences;
  }

  private async getSubscribersInSegments(segmentIds: string[]): Promise<string[]> {
    const { data, error } = await supabase
      .from('newsletter_segment_assignments')
      .select('subscription_id')
      .in('segment_id', segmentIds);

    if (error) throw error;
    return (data || []).map(d => d.subscription_id);
  }

  private async addAnalyticsToSubscribers(subscribers: NewsletterSubscription[]): Promise<any[]> {
    // Add analytics data like open rates, click rates, etc.
    const subscriberIds = subscribers.map(s => s.id);
    
    const { data: analytics, error } = await supabase
      .from('newsletter_analytics')
      .select('subscription_id, event_type')
      .in('subscription_id', subscriberIds);

    if (error) throw error;

    return subscribers.map(subscriber => {
      const subscriberAnalytics = (analytics || []).filter(a => a.subscription_id === subscriber.id);
      const opens = subscriberAnalytics.filter(a => a.event_type === 'opened').length;
      const clicks = subscriberAnalytics.filter(a => a.event_type === 'clicked').length;
      const sent = subscriberAnalytics.filter(a => a.event_type === 'sent').length;

      return {
        ...subscriber,
        analytics: {
          total_sent: sent,
          total_opens: opens,
          total_clicks: clicks,
          open_rate: sent > 0 ? (opens / sent) * 100 : 0,
          click_rate: opens > 0 ? (clicks / opens) * 100 : 0
        }
      };
    });
  }

  private async addAnalyticsToCampaigns(campaigns: NewsletterCampaign[]): Promise<any[]> {
    return campaigns.map(campaign => ({
      ...campaign,
      analytics: {
        open_rate: campaign.delivery_stats.sent > 0 ? 
          (campaign.delivery_stats.opened / campaign.delivery_stats.sent) * 100 : 0,
        click_rate: campaign.delivery_stats.opened > 0 ? 
          (campaign.delivery_stats.clicked / campaign.delivery_stats.opened) * 100 : 0,
        bounce_rate: campaign.delivery_stats.sent > 0 ? 
          (campaign.delivery_stats.bounced / campaign.delivery_stats.sent) * 100 : 0
      }
    }));
  }

  private exportToCSV(subscribers: any[], includeAnalytics: boolean = false): string {
    const headers = [
      'Email',
      'Status',
      'Member ID',
      'Frequency',
      'Content Types',
      'Format',
      'Language',
      'Subscribed At',
      'Confirmed At',
      'Last Sent At',
      'Bounce Count'
    ];

    if (includeAnalytics) {
      headers.push('Total Sent', 'Total Opens', 'Total Clicks', 'Open Rate %', 'Click Rate %');
    }

    const rows = subscribers.map(subscriber => {
      const row = [
        subscriber.email,
        subscriber.status,
        subscriber.member_id || '',
        subscriber.preferences.frequency,
        subscriber.preferences.content_types.join(';'),
        subscriber.preferences.format,
        subscriber.preferences.language,
        subscriber.subscribed_at,
        subscriber.confirmed_at || '',
        subscriber.last_sent_at || '',
        subscriber.bounce_count.toString()
      ];

      if (includeAnalytics && subscriber.analytics) {
        row.push(
          subscriber.analytics.total_sent.toString(),
          subscriber.analytics.total_opens.toString(),
          subscriber.analytics.total_clicks.toString(),
          subscriber.analytics.open_rate.toFixed(2),
          subscriber.analytics.click_rate.toFixed(2)
        );
      }

      return row;
    });

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  private exportToJSON(subscribers: any[]): string {
    return JSON.stringify(subscribers, null, 2);
  }

  private exportToXLSX(subscribers: any[], includeAnalytics: boolean = false): string {
    // TODO: Implement XLSX export using a library like xlsx
    // For now, return CSV format
    return this.exportToCSV(subscribers, includeAnalytics);
  }

  private exportCampaignsToCSV(campaigns: any[], includeAnalytics: boolean = false): string {
    const headers = [
      'Title',
      'Subject',
      'Status',
      'Template ID',
      'Sent At',
      'Recipient Count',
      'Sent',
      'Delivered',
      'Bounced',
      'Opened',
      'Clicked'
    ];

    if (includeAnalytics) {
      headers.push('Open Rate %', 'Click Rate %', 'Bounce Rate %');
    }

    const rows = campaigns.map(campaign => {
      const row = [
        campaign.title,
        campaign.subject,
        campaign.status,
        campaign.template_id,
        campaign.sent_at || '',
        campaign.recipient_count.toString(),
        campaign.delivery_stats.sent.toString(),
        campaign.delivery_stats.delivered.toString(),
        campaign.delivery_stats.bounced.toString(),
        campaign.delivery_stats.opened.toString(),
        campaign.delivery_stats.clicked.toString()
      ];

      if (includeAnalytics && campaign.analytics) {
        row.push(
          campaign.analytics.open_rate.toFixed(2),
          campaign.analytics.click_rate.toFixed(2),
          campaign.analytics.bounce_rate.toFixed(2)
        );
      }

      return row;
    });

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  private exportCampaignsToJSON(campaigns: any[]): string {
    return JSON.stringify(campaigns, null, 2);
  }

  private async assignSubscriberToSegment(subscriberId: string, segmentId: string): Promise<void> {
    await supabase
      .from('newsletter_segment_assignments')
      .upsert({
        subscription_id: subscriberId,
        segment_id: segmentId
      }, { onConflict: 'subscription_id,segment_id' });
  }

  private async removeSubscriberFromSegment(subscriberId: string, segmentId: string): Promise<void> {
    await supabase
      .from('newsletter_segment_assignments')
      .delete()
      .eq('subscription_id', subscriberId)
      .eq('segment_id', segmentId);
  }
}

export const newsletterImportExportApi = new NewsletterImportExportAPI();