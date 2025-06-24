import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { newsletterAnalyticsApi } from '@/api/newsletter/analytics';

// This would normally be a separate API endpoint, but for demo purposes
// we'll create a React component that handles tracking

export const OpenTracker: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('s');

  useQuery({
    queryKey: ['track-open', campaignId, subscriptionId],
    queryFn: async () => {
      if (campaignId && subscriptionId) {
        await (newsletterAnalyticsApi as any).trackOpen(
          campaignId,
          subscriptionId,
          // In a real app, you'd get these from request headers
          '127.0.0.1',
          navigator.userAgent
        );
      }
      return null;
    },
    enabled: !!(campaignId && subscriptionId)
  });

  // Return a 1x1 transparent pixel
  return (
    <img 
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" 
      alt="" 
      width="1" 
      height="1" 
      style={{ border: 'none', display: 'block' }}
    />
  );
};

export const ClickTracker: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('s');
  const url = searchParams.get('url');

  useQuery({
    queryKey: ['track-click', campaignId, subscriptionId, url],
    queryFn: async () => {
      if (campaignId && subscriptionId && url) {
        await (newsletterAnalyticsApi as any).trackClick(
          campaignId,
          subscriptionId,
          decodeURIComponent(url),
          '127.0.0.1',
          navigator.userAgent
        );
        
        // Redirect to the actual URL
        window.location.href = decodeURIComponent(url);
      }
      return null;
    },
    enabled: !!(campaignId && subscriptionId && url)
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

// Webhook handler component (this would typically be a separate API route)
export const WebhookHandler: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Webhook Handler</h1>
      <p className="text-gray-600">
        This endpoint handles Resend webhooks for delivery tracking.
        In a production app, this would be a server-side API route.
      </p>
    </div>
  );
};