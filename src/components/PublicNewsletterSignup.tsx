import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { newsletterSubscriptionApi } from '@/features/newsletter/api/subscriptions';

interface PublicNewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'hero';
  showPreferences?: boolean;
}

const PublicNewsletterSignup: React.FC<PublicNewsletterSignupProps> = ({ 
  className = '',
  variant = 'default',
  showPreferences = false 
}) => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    contentTypes: {
      events: true,
      news: true,
      opportunities: true,
      marketplace: false
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const subscribeMutation = useMutation({
    mutationFn: (data: { email: string; preferences: any }) => 
      newsletterSubscriptionApi.subscribe({
        email: data.email,
        preferences: {
          frequency: data.preferences.frequency,
          content_types: Object.entries(data.preferences.contentTypes)
            .filter(([_, enabled]) => enabled)
            .map(([type]) => type) as any,
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
      } else {
        setError('Failed to subscribe. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Newsletter subscription error:', error);
      setError('Failed to subscribe. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setError('');
      subscribeMutation.mutate({ email, preferences });
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError('');
  };

  if (variant === 'minimal') {
    return (
      <div className={`max-w-md ${className}`}>
        {submitted ? (
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-green-700 dark:text-green-400">
              Check your email to confirm your subscription!
            </p>
            <button 
              onClick={resetForm}
              className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribeMutation.isPending ? '...' : 'Subscribe'}
            </button>
          </form>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`max-w-2xl mx-auto text-center ${className}`}>
        {submitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-900 dark:text-green-300 mb-2">
              Almost there!
            </h3>
            <p className="text-green-700 dark:text-green-400 mb-4">
              We've sent a confirmation email to your inbox. Click the link to complete your subscription.
            </p>
            <button 
              onClick={resetForm}
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Get the latest from the Uluntu community - events, opportunities, and news.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg
                           font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              
              {showPreferences && (
                <div className="text-left max-w-md mx-auto mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                    What would you like to receive?
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { key: 'events', label: 'Events & Meetups' },
                      { key: 'news', label: 'Community News' },
                      { key: 'opportunities', label: 'Job Opportunities' },
                      { key: 'marketplace', label: 'Marketplace Items' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.contentTypes[key as keyof typeof preferences.contentTypes]}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            contentTypes: {
                              ...preferences.contentTypes,
                              [key]: e.target.checked
                            }
                          })}
                          className="rounded border-slate-300 dark:border-slate-600 text-orange-500
                                   focus:ring-orange-500 dark:bg-slate-700 mr-2"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      How often?
                    </label>
                    <select
                      value={preferences.frequency}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              )}
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white ${className}`}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6" />
          </div>
        </div>
        
        {submitted ? (
          <div>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Check Your Email!</h3>
            <p className="text-white/80 mb-4">
              We've sent a confirmation link to your email address. Click it to complete your subscription.
            </p>
            <button 
              onClick={resetForm}
              className="text-white/80 hover:text-white underline"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
            <p className="text-white/80 mb-6">
              Get the latest updates from the Uluntu community, including events, opportunities, and news.
            </p>
            
            <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white 
                         placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                required
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 
                         transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-sm text-red-200 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
            
            <p className="text-xs text-white/60 mt-4">
              We respect your privacy. Your email will only be used for community communications. Unsubscribe at any time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicNewsletterSignup;