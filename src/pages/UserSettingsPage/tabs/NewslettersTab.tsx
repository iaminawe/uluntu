import React from 'react';
import { Newspaper, Calendar, Briefcase, ShoppingBag, Users, CheckCircle2 } from 'lucide-react';
import { NewsletterPreferences } from '../types';
import { SettingsField } from '../components/SettingsField';

interface NewslettersTabProps {
  newsletterPreferences: NewsletterPreferences;
  setNewsletterPreferences: (preferences: NewsletterPreferences) => void;
  newsletterLoading: boolean;
}

/**
 * Newsletters Tab
 */
export const NewslettersTab: React.FC<NewslettersTabProps> = ({
  newsletterPreferences,
  setNewsletterPreferences,
  newsletterLoading
}) => {
  return (
    <div className="space-y-6">
      {/* Newsletter Subscription Status */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Newsletter Subscription
        </h3>

        <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Newspaper className="w-5 h-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {newsletterPreferences.subscribed ? 'Subscribed to Newsletter' : 'Subscribe to Newsletter'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {newsletterPreferences.subscribed
                    ? 'You are receiving our newsletter updates'
                    : 'Get the latest news, events, and opportunities'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={newsletterPreferences.subscribed}
                onChange={(e) => setNewsletterPreferences({
                  ...newsletterPreferences,
                  subscribed: e.target.checked
                })}
                disabled={newsletterLoading}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
            </label>
          </label>
        </div>
      </div>

      {/* Newsletter Preferences - Only show if subscribed */}
      {newsletterPreferences.subscribed && (
        <>
          {/* Frequency */}
          <SettingsField
            label="Delivery Frequency"
            description="How often would you like to receive newsletter updates?"
          >
            <select
              value={newsletterPreferences.frequency}
              onChange={(e) => setNewsletterPreferences({
                ...newsletterPreferences,
                frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={newsletterLoading}
            >
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Roundup</option>
            </select>
          </SettingsField>

          {/* Content Types */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Content Preferences
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Choose what types of content you'd like to receive in your newsletter.
            </p>
            <div className="space-y-3">
              {[
                { key: 'events', label: 'Events', description: 'Upcoming events and meetups', icon: Calendar },
                { key: 'news', label: 'News & Updates', description: 'Community news and announcements', icon: Newspaper },
                { key: 'opportunities', label: 'Opportunities', description: 'Jobs and volunteer positions', icon: Briefcase },
                { key: 'marketplace', label: 'Marketplace', description: 'New items and services', icon: ShoppingBag },
                { key: 'members', label: 'Member Spotlights', description: 'Featured community members', icon: Users }
              ].map(({ key, label, description, icon: Icon }) => (
                <label key={key} className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={newsletterPreferences.contentTypes[key as keyof typeof newsletterPreferences.contentTypes]}
                    onChange={(e) => setNewsletterPreferences({
                      ...newsletterPreferences,
                      contentTypes: {
                        ...newsletterPreferences.contentTypes,
                        [key]: e.target.checked
                      }
                    })}
                    className="mt-1 rounded border-slate-300 dark:border-slate-600 text-orange-500
                             focus:ring-orange-500 dark:bg-slate-700"
                    disabled={newsletterLoading}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-900 dark:text-white">{label}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Email Format">
              <select
                value={newsletterPreferences.format}
                onChange={(e) => setNewsletterPreferences({
                  ...newsletterPreferences,
                  format: e.target.value as 'digest' | 'full'
                })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={newsletterLoading}
              >
                <option value="digest">Digest (Summary)</option>
                <option value="full">Full Content</option>
              </select>
            </SettingsField>

            <SettingsField label="Location Filter">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newsletterPreferences.locationFilter}
                  onChange={(e) => setNewsletterPreferences({
                    ...newsletterPreferences,
                    locationFilter: e.target.checked
                  })}
                  className="rounded border-slate-300 dark:border-slate-600 text-orange-500
                           focus:ring-orange-500 dark:bg-slate-700"
                  disabled={newsletterLoading}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Prioritize local content
                </span>
              </label>
            </SettingsField>
          </div>
        </>
      )}

      {/* Newsletter Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
              About Our Newsletter
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Stay updated with community news and events</li>
              <li>• Discover new opportunities and resources</li>
              <li>• Connect with local community members</li>
              <li>• Unsubscribe anytime with one click</li>
              <li>• We respect your privacy and never share your email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
