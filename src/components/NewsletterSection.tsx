import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { newsletterSubscriptionApi } from '@/api/newsletter/subscriptions';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const subscribeMutation = useMutation({
    mutationFn: (email: string) => newsletterSubscriptionApi.subscribe({
      email,
      preferences: {
        frequency: 'weekly',
        content_types: ['events', 'news', 'opportunities', 'marketplace'],
        format: 'digest',
        location_filter: true,
        language: 'en'
      }
    }),
    onSuccess: (result) => {
      if (result) {
        setSubmitted(true);
        setEmail('');
        setError('');
        // Reset after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError('Failed to subscribe. Please try again.');
      }
    },
    onError: () => {
      setError('Failed to subscribe. Please try again.');
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setError('');
      subscribeMutation.mutate(email);
    }
  };

  return (
    <section id="newsletter" className="py-16 bg-purple-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <div className="w-20 h-1 bg-purple-400 mx-auto mb-6"></div>
          <p className="text-lg text-purple-200 mb-8">
            Subscribe to our newsletter to get monthly recaps of our meetups,
            early announcements about upcoming speakers, and AI news from the Kootenays.
          </p>
          
          <div className="bg-purple-800/50 p-6 rounded-lg">
            {submitted ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-full mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Success!
                </div>
                <p>Thank you for subscribing to our newsletter!</p>
                <p className="text-sm text-purple-300 mt-2">
                  Please check your email to confirm your subscription.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-grow px-4 py-3 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="px-6 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                {error && (
                  <div className="mt-3 text-sm text-red-300 text-center">
                    {error}
                  </div>
                )}
                <p className="text-xs text-purple-300 mt-3">
                  We respect your privacy. Your email will only be used for Kootenay Tech Community communications.
                  You can unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;