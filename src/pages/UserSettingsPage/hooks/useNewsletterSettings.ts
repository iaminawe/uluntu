import { useState } from 'react';
import { NewsletterPreferences } from '../types';

const defaultNewsletterPreferences: NewsletterPreferences = {
  subscribed: false,
  frequency: 'weekly',
  contentTypes: {
    events: true,
    news: true,
    opportunities: true,
    marketplace: true,
    members: false
  },
  format: 'digest',
  locationFilter: true
};

/**
 * Hook for managing newsletter subscription preferences
 */
export const useNewsletterSettings = (initialData?: Partial<NewsletterPreferences>) => {
  const [newsletterPreferences, setNewsletterPreferences] = useState<NewsletterPreferences>({
    ...defaultNewsletterPreferences,
    ...initialData,
    contentTypes: {
      ...defaultNewsletterPreferences.contentTypes,
      ...initialData?.contentTypes
    }
  });

  const updateContentType = (
    key: keyof NewsletterPreferences['contentTypes'],
    value: boolean
  ) => {
    setNewsletterPreferences(prev => ({
      ...prev,
      contentTypes: {
        ...prev.contentTypes,
        [key]: value
      }
    }));
  };

  const toggleSubscription = (subscribed: boolean) => {
    setNewsletterPreferences(prev => ({
      ...prev,
      subscribed
    }));
  };

  const updateFrequency = (frequency: NewsletterPreferences['frequency']) => {
    setNewsletterPreferences(prev => ({
      ...prev,
      frequency
    }));
  };

  const updateFormat = (format: NewsletterPreferences['format']) => {
    setNewsletterPreferences(prev => ({
      ...prev,
      format
    }));
  };

  const toggleLocationFilter = (locationFilter: boolean) => {
    setNewsletterPreferences(prev => ({
      ...prev,
      locationFilter
    }));
  };

  return {
    newsletterPreferences,
    setNewsletterPreferences,
    updateContentType,
    toggleSubscription,
    updateFrequency,
    updateFormat,
    toggleLocationFilter
  };
};
